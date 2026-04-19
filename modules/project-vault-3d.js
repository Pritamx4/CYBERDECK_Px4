import * as THREE from 'three';

/**
 * Project Vault 3D - Three.js 3D orbital project showcase
 * Displays project cards in an orbital formation with interactive detail overlay
 */

class ProjectVault3DModel {
/**
 * Project Vault 3D - Interactive 3D project showcase with orbital mechanics
 * @class ProjectVault3DModel
 * @description Displays portfolio projects as orbital shards around a rotating core.
 *              Features: Raycasting interaction, detail overlay modal, lattice connections,
 *              GSAP animations, responsive breakpoints, Intersection Observer optimization
 */
  constructor() {
  /**
   * Initialize ProjectVault3DModel instance with Three.js scene setup
   * Extracts project data from DOM, sets up renderer and lighting
   * @constructor
   */
    this.container = document.getElementById('project-canvas-container');
    this.projectSection = document.getElementById('section-projects');
    if (!this.container || !this.projectSection) return;

    this.projectsData = this.extractProjectData();
    this.isMobile = window.innerWidth <= 768;
    this.isVisible = false;
    this.isDragging = false;
    this.rotationEnabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.shards = [];
    this.labels = [];
    this.pulses = [];
    this.latticeLines = [];
    this.activeProjectIndex = 0;
    this.lastFocusedElement = null;
    this.swipeStartX = 0;
    this.swipeStartY = 0;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.initProjectVault();
    this.setupProjectVaultVisibilityObserver();
    this.setupProjectVaultDetailOverlay();

  }

  extractProjectData() {
    const cards = document.querySelectorAll('.project-card');
    const data = Array.from(cards).map((card, index) => {
      const h3 = card.querySelector('h3');
      const p = card.querySelector('p');
      const img = card.querySelector('img');
      const links = card.querySelectorAll('.links a');

      return {
        id: index,
        title: (h3 && h3.textContent) ? h3.textContent.trim() : `MODULE_${index + 1}`,
        description: (p && p.textContent) ? p.textContent.trim() : 'Neural link active. Data stream stabilized.',
        img: img ? img.getAttribute('src') : 'images/fallback.png',
        codeLink: (links[0] && links[0].href) ? links[0].href : '#',
        liveLink: (links[1] && links[1].href) ? links[1].href : '#'
      };
    });
    console.table(data);
    return data;
  }

  createBinaryStringTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    ctx.clearRect(0, 0, 512, 128);
    
    // Choose a random bit string like "0101 01"
    const bits = Array.from({ length: 4 + Math.floor(Math.random() * 6) }, () => 
        (Math.random() > 0.5 ? '1' : '0') + (Math.random() > 0.8 ? ' ' : '')
    ).join('');

    ctx.font = 'bold 80px "Space Mono", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Intense Bloom/Glow
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.fillText(bits, 10, 64);
    ctx.shadowBlur = 5;
    ctx.fillText(bits, 10, 64);
    
    return new THREE.CanvasTexture(canvas);
  }

  initProjectVault() {
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    const maxDPR = this.isMobile ? 1 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 150, 50);
    pointLight.position.set(0, 10, 10);
    this.scene.add(pointLight);

    this.createProjectVaultCore();
    this.createProjectVaultShards();
    this.createProjectVaultLattice();

    this.camera.position.z = this.isMobile ? 25 : 22;

    window.addEventListener('resize', () => this.onProjectVaultResize());
    this.container.addEventListener('click', (e) => this.onProjectVaultClick(e));
    this.container.addEventListener('mousemove', (e) => this.onProjectVaultHover(e));

    let prevMouseX = 0;
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      prevMouseX = e.clientX;
    });
    window.addEventListener('mouseup', () => this.isDragging = false);
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = (e.clientX - prevMouseX) * 0.005;
        this.group.rotation.y += deltaX;
        prevMouseX = e.clientX;
      }
    });

    this.projectSection.classList.add('orbital-active');
    this.animateProjectVault();

    setInterval(() => this.spawnProjectVaultPulse(), 2000);
  }

  setupProjectVaultVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(this.container);
  }

  createProjectVaultCore() {
    this.group = new THREE.Group();
    this.coreGroup = new THREE.Group();

    const shellGeometry = new THREE.IcosahedronGeometry(2.35, 1);
    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x07131a,
      transparent: true,
      opacity: 0.12,
      roughness: 0.15,
      metalness: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.18
    });
    this.coreShell = new THREE.Mesh(shellGeometry, shellMaterial);
    this.coreGroup.add(this.coreShell);

    const shellWireGeometry = new THREE.IcosahedronGeometry(2.45, 0);
    const shellWireMaterial = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.4
    });
    this.coreShellWire = new THREE.Mesh(shellWireGeometry, shellWireMaterial);
    this.coreGroup.add(this.coreShellWire);

    const nucleusGeometry = new THREE.OctahedronGeometry(1.25, 1);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCFF00,
      emissive: 0xCCFF00,
      emissiveIntensity: 1.1,
      roughness: 0.2,
      metalness: 0.75
    });
    this.coreNucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    this.coreGroup.add(this.coreNucleus);

    this.coreOuter = this.coreShellWire;
    this.coreInner = this.coreNucleus;

    const coreGlowGeometry = new THREE.SphereGeometry(0.95, 24, 24);
    const coreGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18
    });
    this.coreGlow = new THREE.Mesh(coreGlowGeometry, coreGlowMaterial);
    this.coreGroup.add(this.coreGlow);

    const ringMaterialA = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.7, transparent: true, opacity: 0.45, metalness: 0.9, roughness: 0.2 });
    const ringGeometryA = new THREE.TorusGeometry(3.0, 0.08, 12, 96);
    this.coreRingA = new THREE.Mesh(ringGeometryA, ringMaterialA);
    this.coreRingA.rotation.x = Math.PI / 2;
    this.coreGroup.add(this.coreRingA);

    const ringMaterialB = new THREE.MeshStandardMaterial({ color: 0xCCFF00, emissive: 0xCCFF00, emissiveIntensity: 0.6, transparent: true, opacity: 0.35, metalness: 0.85, roughness: 0.25 });
    const ringGeometryB = new THREE.TorusGeometry(2.5, 0.06, 12, 96);
    this.coreRingB = new THREE.Mesh(ringGeometryB, ringMaterialB);
    this.coreRingB.rotation.x = Math.PI / 3;
    this.coreGroup.add(this.coreRingB);

    const spineGeometry = new THREE.CylinderGeometry(0.22, 0.22, 4.8, 12, 1, true);
    const spineMaterial = new THREE.MeshStandardMaterial({ color: 0x08141f, transparent: true, opacity: 0.55, side: THREE.DoubleSide, emissive: 0x00f0ff, emissiveIntensity: 0.15, metalness: 0.65, roughness: 0.3 });
    this.coreSpine = new THREE.Mesh(spineGeometry, spineMaterial);
    this.coreSpine.rotation.z = Math.PI / 2;
    this.coreGroup.add(this.coreSpine);

    const particleCount = 260;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 0.65 + Math.random() * 1.7;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 1.9;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = height;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.045, transparent: true, opacity: 0.9 });
    this.coreParticles = new THREE.Points(pGeo, pMat);
    this.coreGroup.add(this.coreParticles);

    this.group.add(this.coreGroup);
    this.scene.add(this.group);
  }

  createProjectVaultShards() {
    const loader = new THREE.TextureLoader();
    const count = this.projectsData.length;

    this.projectsData.forEach((data, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = this.isMobile ? 14 : 18; // Restored and increased for massive scale
      const geometry = new THREE.CylinderGeometry(2.2, 2.2, 0.4, 6);

      loader.load(data.img, (texture) => {
        const materials = [
          new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.5, wireframe: true }),
          new THREE.MeshStandardMaterial({ map: texture, transparent: true, opacity: 0.9 }),
          new THREE.MeshStandardMaterial({ color: 0x111111 })
        ];

        const shard = new THREE.Mesh(geometry, materials);
        shard.rotation.x = Math.PI / 2;
        shard.position.x = Math.cos(angle) * radius;
        shard.position.z = Math.sin(angle) * radius;
        shard.position.y = (Math.random() - 0.5) * 6;

        shard.userData = data;
        shard.userData.angle = angle;
        shard.userData.index = i;
        this.shards.push(shard);
        this.group.add(shard);

        const wireGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.45, 6);
        const wireMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.2 });
        const circuit = new THREE.Mesh(wireGeo, wireMat);
        shard.add(circuit);
      });
    });
  }

  createProjectVaultLattice() {
    this.latticeGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.1 });
    this.shards.forEach(() => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
      const line = new THREE.Line(geo, lineMat);
      this.latticeLines.push(line);
      this.latticeGroup.add(line);
    });
    this.group.add(this.latticeGroup);
  }

  spawnProjectVaultPulse() {
    if (!this.isVisible || this.shards.length === 0 || !window.gsap) return;
    const targetShard = this.shards[Math.floor(Math.random() * this.shards.length)];
    const latticeIdx = targetShard.userData.index;

    // Sequential Bit Stream (0101 strings) - KEPT FROM UPGRADE
    const streamCount = 3;
    const streamGroup = new THREE.Group();
    this.group.add(streamGroup);

    // Core Flash Effect
    gsap.to(this.coreGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.2, yoyo: true, repeat: 1 });
    gsap.to(this.coreInner.material, { emissiveIntensity: 4, duration: 0.2, yoyo: true, repeat: 1 });

    for (let i = 0; i < streamCount; i++) {
        const bitTex = this.createBinaryStringTexture();
        const bitMat = new THREE.SpriteMaterial({ map: bitTex, transparent: true, opacity: 0.9 });
        const sprite = new THREE.Sprite(bitMat);
        sprite.scale.set(3, 0.75, 1);
        sprite.position.set(0, 0, 0);
        streamGroup.add(sprite);

        gsap.to(sprite.position, {
            x: targetShard.position.x,
            y: targetShard.position.y,
            z: targetShard.position.z,
            duration: 1.2,
            delay: i * 0.25,
            ease: "power2.in",
            onStart: () => {
                if (this.latticeLines[latticeIdx]) {
                    gsap.to(this.latticeLines[latticeIdx].material, { opacity: 0.6, duration: 0.2, yoyo: true, repeat: 1 });
                }
            },
            onComplete: () => {
                streamGroup.remove(sprite);
                if (i === streamCount - 1) {
                    this.group.remove(streamGroup);
                    gsap.to(targetShard.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.1, yoyo: true, repeat: 1 });
                    if (this.latticeLines[latticeIdx]) {
                        gsap.to(this.latticeLines[latticeIdx].material, { opacity: 0.9, duration: 0.1, yoyo: true, repeat: 3 });
                    }
                }
            }
        });
    }
  }

  updateProjectVaultLattice() {
    this.shards.forEach((shard, i) => {
      if (this.latticeLines[i]) {
        this.latticeLines[i].geometry.setFromPoints([new THREE.Vector3(0, 0, 0), shard.position]);
        this.latticeLines[i].geometry.attributes.position.needsUpdate = true;
      }
    });
  }

  setupProjectVaultDetailOverlay() {
    this.overlay = document.getElementById('project-detail-overlay');
    this.detailContainer = this.overlay ? this.overlay.querySelector('.detail-container') : null;
    this.closeBtn = this.overlay.querySelector('.close-detail');
    this.prevBtn = this.overlay.querySelector('#detail-prev');
    this.nextBtn = this.overlay.querySelector('#detail-next');

    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeProjectVaultDetail());
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.showPrevProjectVault());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.showNextProjectVault());
    this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.closeProjectVaultDetail(); });

    if (this.detailContainer) {
      this.detailContainer.addEventListener('touchstart', (e) => {
        const touch = e.changedTouches[0];
        this.swipeStartX = touch.clientX;
        this.swipeStartY = touch.clientY;
      }, { passive: true });

      this.detailContainer.addEventListener('touchend', (e) => {
        if (!this.overlay.classList.contains('active')) return;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.swipeStartX;
        const deltaY = touch.clientY - this.swipeStartY;

        if (Math.abs(deltaX) > 45 && Math.abs(deltaY) < 60) {
          if (deltaX < 0) {
            this.showNextProjectVault();
          } else {
            this.showPrevProjectVault();
          }
        }
      }, { passive: true });
    }

    window.addEventListener('keydown', (e) => {
      if (!this.overlay.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeProjectVaultDetail();
      if (e.key === 'ArrowLeft') this.showPrevProjectVault();
      if (e.key === 'ArrowRight') this.showNextProjectVault();
    });
  }

  closeProjectVaultDetail() {
    this.rotationEnabled = true;
    try { playDataGlitch(); } catch (e) { }

    if (window.gsap) {
      const container = this.overlay.querySelector('.detail-container');
      const visual = this.overlay.querySelector('.detail-frame');
      const content = this.overlay.querySelector('.detail-content');
      const contentElements = content.querySelectorAll('.content-header, .content-body, .detail-actions');
      const uiLayer = this.overlay.querySelector('.modal-ui-layer');
      const closeBtn = this.overlay.querySelector('.close-detail');
      const navBtn = this.overlay.querySelector('.detail-nav');

      gsap.killTweensOf([this.overlay, container, visual, contentElements, uiLayer, closeBtn, navBtn]);

      const tl = gsap.timeline({
        onComplete: () => {
          this.overlay.classList.remove('active');
          gsap.set(this.overlay, { visibility: 'hidden' });
        }
      });

      tl.to([contentElements, uiLayer, closeBtn, navBtn], {
        opacity: 0,
        y: -10,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in"
      })
      .to(visual, {
        scaleX: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      }, "-=0.1")
      .to(container, {
        scaleY: 0.005,
        duration: 0.4,
        ease: "expo.inOut"
      }, "-=0.2")
      .to(this.overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      }, "-=0.2");
    } else {
      this.overlay.classList.remove('active');
    }

    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      setTimeout(() => this.lastFocusedElement.focus(), 0);
    }
  }

  showProjectVaultByIndex(index) {
    if (!this.projectsData.length) return;
    const normalized = (index + this.projectsData.length) % this.projectsData.length;
    const data = this.projectsData[normalized];
    const sourceCard = document.querySelector(`.project-card[data-project-id="${data.id}"]`);
    this.showProjectVaultDetail(data, sourceCard);
  }

  showNextProjectVault() {
    this.showProjectVaultByIndex(this.activeProjectIndex + 1);
  }

  showPrevProjectVault() {
    this.showProjectVaultByIndex(this.activeProjectIndex - 1);
  }

  showProjectVaultDetail(data, sourceElement) {
    console.log("PROJECT_UPLINK_START:", data ? data.title : "NO_DATA");
    const title = document.getElementById('detail-title');
    const desc = document.getElementById('detail-description');
    const img = document.getElementById('detail-img');
    const code = document.getElementById('detail-code');
    const live = document.getElementById('detail-live');

    if (!title || !desc || !img || !data) return;

    const isAlreadyActive = this.overlay.classList.contains('active');
    
    // Ensure we have a valid index even if called with a data object from Three.js userData
    this.activeProjectIndex = this.projectsData.findIndex((p) => p.title === data.title);
    if (this.activeProjectIndex === -1 && typeof data.id !== 'undefined') {
       this.activeProjectIndex = this.projectsData.findIndex((p) => p.id == data.id);
    }

    if (sourceElement) {
      this.lastFocusedElement = sourceElement;
    } else if (document.activeElement && document.activeElement !== document.body) {
      this.lastFocusedElement = document.activeElement;
    }

    const updateContent = () => {
      title.textContent = data.title || 'UNKNOWN_MODULE';
      desc.textContent = data.description || 'Data stream interrupted. No description available.';
      
      // Handle the image source and loading sequence properly
      const newImgSrc = data.img || data.image || 'images/fallback.png';
      if (img.src !== newImgSrc) {
        img.style.opacity = '0';
        img.onload = () => { img.style.opacity = '1'; };
        img.src = newImgSrc;
      } else {
        img.style.opacity = '1';
      }

      if (code) { 
        code.href = data.codeLink || '#'; 
        code.style.display = (data.codeLink && data.codeLink !== '#') ? 'flex' : 'none'; 
      }
      if (live) { 
        live.href = data.liveLink || '#'; 
        live.style.display = (data.liveLink && data.liveLink !== '#') ? 'flex' : 'none'; 
      }
    };

    if (window.gsap && isAlreadyActive) {
      // Content-only transition for navigation
      const visual = this.overlay.querySelector('.detail-frame');
      const content = this.overlay.querySelector('.detail-content');
      const contentElements = content.querySelectorAll('.content-header, .content-body, .detail-actions');

      gsap.killTweensOf([visual, contentElements]);
      const navTl = gsap.timeline();

      navTl.to([contentElements, visual], {
        opacity: 0,
        y: 5,
        duration: 0.25,
        ease: "power2.in"
      })
      .add(() => {
        updateContent();
        gsap.set(visual, { scaleX: 0, transformOrigin: "left" });
        try { playDataGlitch(); } catch (e) { }
      })
      .to(visual, {
        scaleX: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(contentElements, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out"
      }, "-=0.3");
      
      return; // Exit early as we don't need the full unfold
    }

    // Initial Full Unfold
    this.overlay.classList.add('active');
    updateContent();
    this.rotationEnabled = false;
    try { playDataGlitch(); } catch (e) { }

    if (window.gsap) {
      const container = this.overlay.querySelector('.detail-container');
      const visual = this.overlay.querySelector('.detail-frame');
      const content = this.overlay.querySelector('.detail-content');
      const contentElements = content.querySelectorAll('.content-header, .content-body, .detail-actions');
      const uiLayer = this.overlay.querySelector('.modal-ui-layer');
      const closeBtn = this.overlay.querySelector('.close-detail');
      const navBtn = this.overlay.querySelector('.detail-nav');

      // Kill any ongoing animations
      gsap.killTweensOf([this.overlay, container, visual, contentElements, uiLayer, closeBtn, navBtn]);

      const tl = gsap.timeline();

      // Initial states
      gsap.set(this.overlay, { opacity: 0, visibility: 'visible' });
      gsap.set(container, { scaleY: 0.005, scaleX: 1, opacity: 1, transformOrigin: "center" });
      gsap.set(visual, { scaleX: 0, transformOrigin: "left", opacity: 0 });
      gsap.set(contentElements, { opacity: 0, y: 20 });
      gsap.set([uiLayer, closeBtn, navBtn], { opacity: 0 });

      tl.to(this.overlay, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      })
      .to(container, {
        scaleY: 1,
        duration: 0.6,
        ease: "expo.inOut"
      }, "-=0.2")
      .to(visual, {
        scaleX: 1,
        opacity: 1,
        duration: 0.7,
        ease: "power4.out"
      }, "-=0.1")
      .to(contentElements, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.4")
      .to([uiLayer, closeBtn, navBtn], {
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.3");
    }
  }

  onProjectVaultHover(e) {
    if (!window.gsap) return;
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.shards, true); // Recursive

    if (intersects.length > 0) {
      this.container.style.cursor = 'pointer';
      
      // Find the parent shard in the shards array
      let shard = intersects[0].object;
      while (shard && !this.shards.includes(shard)) {
        shard = shard.parent;
      }

      if (shard && !shard.isAnimating) {
        shard.isAnimating = true;
        gsap.to(shard.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.3 });
      }
    } else {
      this.container.style.cursor = this.isDragging ? 'grabbing' : 'grab';
      this.shards.forEach(shard => {
        shard.isAnimating = false;
        gsap.to(shard.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      });
    }
  }

  onProjectVaultClick(e) {
    // Update mouse coordinates immediately on click for precise raycasting
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.shards, true); // Recursive
    
    if (intersects.length > 0) {
      // Traverse up to find the shard mesh with metadata
      let shard = intersects[0].object;
      while (shard && !this.shards.includes(shard)) {
        shard = shard.parent;
      }

      if (shard) {
        const shardIndex = shard.userData.index;
        if (typeof shardIndex === 'number' && shardIndex !== -1) {
          const projectData = this.projectsData[shardIndex];
          const sourceCard = document.querySelector(`.project-card[data-project-id="${projectData.id}"]`);
          
          console.log("VAULT_CLICK_SUCCESS:", projectData.title);
          this.showProjectVaultDetail(projectData, sourceCard);
          
          if (window.gsap) {
            gsap.to(shard.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.4, yoyo: true, repeat: 1, ease: "power2.inOut" });
          }
        }
      }
    }
  }

  onProjectVaultResize() {
    this.isMobile = window.innerWidth <= 768;
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.camera.position.z = this.isMobile ? 22 : 15; // Massive screen-filling zoom
    
    // Mathematically Centered in the 55vh container
    if (this.group) {
        this.group.position.y = 0;
    }
  }

  animateProjectVault() {
    requestAnimationFrame(() => this.animateProjectVault());
    if (!this.isVisible) return;
    if (this.rotationEnabled && !this.isDragging) { this.group.rotation.y += 0.002; }
    
    this.coreOuter.rotation.y += 0.01;
    this.coreInner.rotation.x -= 0.015;
    if (this.coreShell) this.coreShell.rotation.y += 0.004;
    if (this.coreShellWire) this.coreShellWire.rotation.y -= 0.006;
    if (this.coreNucleus) this.coreNucleus.rotation.y += 0.01;
    if (this.coreGlow) this.coreGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.004) * 0.08);
    if (this.coreRingA) this.coreRingA.rotation.z += 0.003;
    if (this.coreRingB) this.coreRingB.rotation.x += 0.004;
    if (this.coreSpine) this.coreSpine.rotation.y += 0.002;
    this.coreParticles.rotation.y += 0.005;
    
    const time = Date.now() * 0.001;
    this.coreInner.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
    
    this.shards.forEach(shard => {
      shard.lookAt(this.camera.position);
      shard.rotation.x = Math.PI / 2;
      shard.position.y += Math.sin(time * 0.5 + shard.userData.angle) * 0.01;
    });

    this.updateProjectVaultLattice();
    this.renderer.render(this.scene, this.camera);
  }
}

window.ProjectVault3DModel = ProjectVault3DModel;
window.ProjectVault3D = ProjectVault3DModel;
