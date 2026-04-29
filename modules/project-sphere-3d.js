import * as THREE from 'three';

/**
 * ProjectSphere3D Module
 * Creates a high-fidelity 3D orbital environment for project showcasing.
 */

class ProjectSphere3D {
  constructor() {
    this.container = document.getElementById('project-canvas-container');
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.shards = [];
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.activePointerId = null;
    this.dragStart = { x: 0, y: 0 };
    this.dragDistance = 0;
    this.suppressNextClick = false;
    
    this.init();
  }

  init() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    this.container.style.touchAction = 'none';

    this.camera.position.z = 15;

    this.setupEnvironment();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00f0ff, 2, 50);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    this.createCore();
    this.createShards();
    this.createTooltip();
    this.addEventListeners();
    
    // Add resize observer for responsive canvas
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = this.container.clientWidth;
      const newHeight = this.container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        this.renderer.setSize(newWidth, newHeight);
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(this.container);
    
    this.animate();
  }

  setupEnvironment() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#111111');
    grad.addColorStop(0.5, '#444444');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(100, 50, 100, 100);
    ctx.fillRect(350, 100, 50, 50);
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = texture;
  }

  createCore() {
    const geometry = new THREE.BufferGeometry();
    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 4.5 + Math.random() * 0.8;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0.94;
      colors[i * 3 + 2] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    this.core = new THREE.Points(geometry, material);
    this.scene.add(this.core);
  }

  createShards() {
    const projectData = window.PROJECT_CARD_DATA || [];
    if (projectData.length === 0) return;

    projectData.forEach((project, index) => {
      const shardGroup = new THREE.Group();
      
      // 1. Solid Chrome Core
      const coreGeo = new THREE.IcosahedronGeometry(0.8, 0);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1.0,
        roughness: 0.05,
        envMapIntensity: 2.5,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.2
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      
      // 2. Glowing Outer Wireframe
      const shellGeo = new THREE.IcosahedronGeometry(1.2, 0);
      const shellMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);

      coreMesh.userData = { projectIndex: index, ...project };
      
      shardGroup.add(coreMesh);
      shardGroup.add(shellMesh);

      const radius = 9 + (index * 2.2);
      const speed = 0.001 + (Math.random() * 0.002);
      const angle = (index / projectData.length) * Math.PI * 2;
      const tilt = (Math.random() - 0.5) * 2;

      shardGroup.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * Math.cos(tilt),
        Math.sin(angle) * radius * Math.sin(tilt)
      );

      this.scene.add(shardGroup);
      this.shards.push({ group: shardGroup, core: coreMesh, shell: shellMesh, angle, radius, speed, tilt });
    });
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'project-3d-tooltip';
    this.tooltip.style.position = 'fixed';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.padding = '8px 12px';
    this.tooltip.style.background = 'rgba(0, 240, 255, 0.1)';
    this.tooltip.style.border = '1px solid var(--color-primary)';
    this.tooltip.style.color = 'var(--color-primary)';
    this.tooltip.style.fontFamily = 'var(--font-mono)';
    this.tooltip.style.fontSize = '12px';
    this.tooltip.style.textTransform = 'uppercase';
    this.tooltip.style.letterSpacing = '2px';
    this.tooltip.style.backdropFilter = 'blur(10px)';
    this.tooltip.style.zIndex = '10000';
    this.tooltip.style.opacity = '0';
    this.tooltip.style.transition = 'opacity 0.3s ease';
    this.tooltip.innerHTML = '<span class="tooltip-text"></span>';
    document.body.appendChild(this.tooltip);
  }

  addEventListeners() {
    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.activePointerId = e.pointerId;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.dragDistance = 0;

      if (this.container.setPointerCapture) {
        this.container.setPointerCapture(e.pointerId);
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (this.activePointerId !== null && e.pointerId !== this.activePointerId) {
        return;
      }

      this.isDragging = false;

      if (this.container.releasePointerCapture && this.activePointerId !== null) {
        try {
          this.container.releasePointerCapture(this.activePointerId);
        } catch (error) {
          // Ignore capture release issues when the browser already cleared it.
        }
      }

      this.activePointerId = null;
      this.suppressNextClick = this.dragDistance > 8;
      if (this.suppressNextClick) {
        window.setTimeout(() => {
          this.suppressNextClick = false;
        }, 0);
      }
    });

    window.addEventListener('pointercancel', () => {
      this.isDragging = false;
      this.activePointerId = null;
      this.suppressNextClick = false;
    });

    this.container.addEventListener('pointermove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

      if (this.isDragging && (this.activePointerId === null || e.pointerId === this.activePointerId)) {
        const deltaMove = {
          x: e.clientX - this.previousMousePosition.x,
          y: e.clientY - this.previousMousePosition.y
        };

        this.dragDistance += Math.abs(deltaMove.x) + Math.abs(deltaMove.y);
        this.scene.rotation.y += deltaMove.x * 0.005;
        this.scene.rotation.x += deltaMove.y * 0.005;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      this.tooltip.style.left = `${e.clientX + 20}px`;
      this.tooltip.style.top = `${e.clientY + 20}px`;
    });

    this.container.addEventListener('click', () => {
      if (this.suppressNextClick) {
        this.suppressNextClick = false;
        return;
      }

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.shards.map(s => s.core));
      if (intersects.length > 0) {
        this.openProjectDetail(intersects[0].object.userData);
      }
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }

  openProjectDetail(data) {
    const overlay = document.getElementById('project-detail-overlay');
    if (!overlay) return;

    document.getElementById('detail-title').textContent = data.title;
    document.getElementById('detail-description').textContent = data.description;
    document.getElementById('detail-img').src = data.image;
    document.getElementById('detail-code').href = data.codeLink;
    document.getElementById('detail-live').href = data.liveLink;

    overlay.classList.add('active');
    
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#detail-img', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" });
    }

    const closeBtn = overlay.querySelector('.close-detail');
    const handleClose = () => {
      overlay.classList.remove('active');
      closeBtn.removeEventListener('click', handleClose);
    };
    closeBtn.addEventListener('click', handleClose);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;
    if (this.core) {
      this.core.rotation.y += 0.002;
      this.core.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }

    this.shards.forEach((shard, i) => {
      shard.angle += shard.speed;
      
      shard.group.position.x = Math.cos(shard.angle) * shard.radius;
      shard.group.position.y = Math.sin(shard.angle) * shard.radius * Math.cos(shard.tilt);
      shard.group.position.z = Math.sin(shard.angle) * shard.radius * Math.sin(shard.tilt);
      
      shard.group.rotation.x += 0.004;
      shard.group.rotation.y += 0.005;

      // Pulse shell
      shard.shell.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.1);
      shard.shell.material.opacity = 0.2 + Math.sin(time * 3 + i) * 0.1;
    });

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.shards.map(s => s.core));
    
    this.shards.forEach(s => {
      s.core.material.emissiveIntensity = 0.2;
      s.shell.material.color.setHex(0x00f0ff);
    });

    if (intersects.length > 0) {
      const activeShard = intersects[0].object;
      activeShard.material.emissiveIntensity = 1.5;
      
      // Find the corresponding shell
      const shardData = this.shards.find(s => s.core === activeShard);
      if (shardData) {
        shardData.shell.material.color.setHex(0xffffff);
        shardData.shell.scale.setScalar(1.3);
      }

      this.tooltip.querySelector('.tooltip-text').textContent = activeShard.userData.title;
      this.tooltip.style.opacity = '1';
      this.container.style.cursor = 'pointer';
    } else {
      this.tooltip.style.opacity = '0';
      this.container.style.cursor = this.isDragging ? 'grabbing' : 'grab';
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Self-initialization logic
const initProjectSphere = () => {
  const container = document.getElementById('project-canvas-container');
  if (container && container.offsetWidth > 0) {
    window.ProjectSphere3DInstance = new ProjectSphere3D();
  } else {
    setTimeout(initProjectSphere, 100);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectSphere);
} else {
  initProjectSphere();
}
