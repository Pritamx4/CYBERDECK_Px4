/**
 * Neural Core 3D - Three.js 3D visualization of the cyberdeck neural interface
 * Displays an animated wireframe core with orbiting tech skill icons
 * 
 * @class NeuralGrid3D
 * @description Main 3D visualization for the hero section featuring:
 *              - Rotating wireframe icosahedron core
 *              - Orbiting tech skill icon sprites
 *              - Animated pulse effects with boost mechanics
 *              - Mouse-responsive rotation
 *              - Visibility-based rendering optimization
 */

class NeuralGrid3D {
  /**
   * Initialize Neural Core 3D scene
   * @constructor
   */
  constructor() {
    this.container = document.getElementById('neural-canvas-container');
    if (!this.container) return;

    this.isMobile = window.innerWidth <= 768;
    this.isVisible = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;

    // VFX & Kinetic States
    this.pulses = [];
    this.nodes = [];
    this.boostPower = 0;
    this.lastPulseTime = 0;

    this.initNeuralGrid();
    this.setupNeuralGridVisibilityObserver();
  }

  initNeuralGrid() {
    /**
     * Initialize Three.js scene, camera, renderer, and event listeners
     * Sets up viewport, event listeners for mouse/resize, and starts animation loop
     * @method init
     */
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    const maxDPR = this.isMobile ? 1.5 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
    this.container.appendChild(this.renderer.domElement);

    this.createNeuralGridCore();
    this.createNeuralGridNodes();

    this.camera.position.z = 10;
    this.onNeuralGridResize();
    window.addEventListener('mousemove', (e) => this.onNeuralGridMouseMove(e));
    window.addEventListener('resize', () => this.onNeuralGridResize());

    this.animateNeuralGrid();
  }

  setupNeuralGridVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(this.container);
  }

  createNeuralGridCore() {
    /**
     * Create the central neural core geometry with wireframe and shell effects
     * Components: Inner icosahedron wireframe (cyan), outer shell, central group
     * @method createCore
     */
    this.group = new THREE.Group();

    // Inner Core
    const innerGeo = new THREE.IcosahedronGeometry(1.5, 1);
    this.innerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.innerMesh = new THREE.Mesh(innerGeo, this.innerMat);
    this.group.add(this.innerMesh);

    // Outer Shell
    const outerGeo = new THREE.IcosahedronGeometry(2, 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x7A00FF,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    this.outerMesh = new THREE.Mesh(outerGeo, outerMat);
    this.group.add(this.outerMesh);

    // Floating Px4 Logo
    const loader = new THREE.TextureLoader();
    loader.load('images/px4 main logo.svg', (texture) => {
      const logoGeo = new THREE.PlaneGeometry(1.5, 1.5);
      const logoMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      this.logoMesh = new THREE.Mesh(logoGeo, logoMat);
      this.group.add(this.logoMesh);
    });

    this.scene.add(this.group);
  }

  createNeuralGridNodes() {
    /**
     * Create orbiting skill icon sprite nodes in 3D space
     * Loads dev tool icons from CDN as textures; positions in orbital formations
     * Mobile: 8 nodes, Desktop: 12 nodes for performance optimization
     * @method createNodes
     */
    const skillIcons = [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg'
    ];

    const loader = new THREE.TextureLoader();

    // Optimization: Filter nodes if on low-end
    const iconsToRender = this.isMobile ? skillIcons.slice(0, 8) : skillIcons;

    iconsToRender.forEach((url, i) => {
      loader.load(url, (texture) => {
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.85 });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.9, 0.9, 0.9);

        const radius = this.isMobile ? (8 + Math.random() * 6) : (10 + Math.random() * 12);
        const speed = 0.002 + Math.random() * 0.006;
        const angle = (i / iconsToRender.length) * Math.PI * 2;
        const verticalOffset = (Math.random() - 0.5) * (this.isMobile ? 5 : 8);

        this.scene.add(sprite);
        this.nodes.push({
          sprite,
          url,
          orbit: { angle, radius, speed, verticalOffset }
        });
      });
    });
  }

  createNeuralGridPulse(startPos) {
    const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 1 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.copy(startPos);
    this.scene.add(head);

    const trail = [];
    const trailCount = this.isMobile ? 4 : 8; // Optimization: Shorter trails on mobile
    for (let i = 0; i < trailCount; i++) {
      const tGeo = new THREE.SphereGeometry(0.1 - (i * 0.012), 4, 4);
      const tMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.6 - (i * 0.07)
      });
      const tMesh = new THREE.Mesh(tGeo, tMat);
      tMesh.position.copy(startPos);
      this.scene.add(tMesh);
      trail.push(tMesh);
    }

    this.pulses.push({
      head: head,
      trail: trail,
      target: this.group.position,
      speed: 0.05 + Math.random() * 0.05,
      positions: Array(trailCount).fill().map(() => startPos.clone())
    });
  }

  updateNeuralGridPulses() {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.positions.unshift(p.head.position.clone());
      p.positions.pop();
      p.head.position.lerp(p.target, p.speed);
      p.trail.forEach((tMesh, idx) => {
        tMesh.position.copy(p.positions[idx]);
      });

      if (p.head.position.distanceTo(p.target) < 0.3) {
        this.scene.remove(p.head);
        p.trail.forEach(t => this.scene.remove(t));
        this.pulses.splice(i, 1);
        this.triggerNeuralGridBoost();
      }
    }

    if (Date.now() - this.lastPulseTime > 1500 && this.nodes.length > 3) {
      const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      this.createNeuralGridPulse(randomNode.sprite.position);
      this.lastPulseTime = Date.now();
    }
  }

  triggerNeuralGridBoost() {
    this.boostPower = 1.0;
  }

  onNeuralGridMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left - rect.width / 2) / 100;
    this.mouseY = (e.clientY - rect.top - rect.height / 2) / 100;
  }

  onNeuralGridResize() {
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    if (width === 0 || height === 0) return;

    this.isMobile = window.innerWidth <= 768;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    if (width > 1024) {
      this.group.position.x = 3.5;
      this.group.position.y = 0;
      this.camera.position.z = 10;
    } else {
      this.group.position.x = 0;
      this.group.position.y = 0; // Centered for mobile block
      this.camera.position.z = 15; // Adjusted for new layout
    }
  }

  animateNeuralGrid() {
    requestAnimationFrame(() => this.animateNeuralGrid());
    if (!this.isVisible) return; // Optimization: Stop render if hidden

    this.nodes.forEach(node => {
      node.orbit.angle += node.orbit.speed;
      node.sprite.position.x = Math.cos(node.orbit.angle) * node.orbit.radius;
      node.sprite.position.z = Math.sin(node.orbit.angle) * node.orbit.radius;
      node.sprite.position.y = node.orbit.verticalOffset + Math.sin(node.orbit.angle * 0.5) * 2;
    });

    this.innerMesh.rotation.y += 0.005;
    this.outerMesh.rotation.y -= 0.002;
    if (this.logoMesh) this.logoMesh.rotation.y += 0.005;

    this.targetRotationX += (this.mouseY - this.targetRotationX) * 0.05;
    this.targetRotationY += (this.mouseX - this.targetRotationY) * 0.05;
    this.group.rotation.x = this.targetRotationX;
    this.group.rotation.y = this.targetRotationY;

    this.updateNeuralGridPulses();

    if (this.boostPower > 0) {
      const scale = 1.0 + (this.boostPower * 0.3);
      this.group.scale.set(scale, scale, scale);
      this.innerMat.opacity = 0.3 + (this.boostPower * 0.6);
      this.boostPower *= 0.94;
    } else {
      this.group.scale.set(1, 1, 1);
      this.innerMat.opacity = 0.3;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.NeuralGrid3D = NeuralGrid3D;
window.NeuralCore3D = NeuralGrid3D;
