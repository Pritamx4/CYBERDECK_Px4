import * as THREE from 'three';

/**
 * GalaxyBackground - Premium 3D Cosmic Environment V3
 * Features volumetric starfields, spiral geometry, and a Bright Galactic Core that follows scroll depth.
 */

class GalaxyBackground {
  constructor() {
    this.container = document.getElementById('galaxy-bg-container');
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    this.stars = null;
    this.halo = null;
    this.nebulae = [];
    this.scrollProgress = 0;
    this.targetScroll = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.initGalaxy();
  }

  initGalaxy() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.createPremiumStarfield();
    this.createStaticHalo();
    this.createVibrantNebulae();
    
    this.camera.position.z = 150;

    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('scroll', () => {
      this.targetScroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    });
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      this.mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    this.animate();
  }

  createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  createPremiumStarfield() {
    const starCount = 25000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const cosmicColors = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0x7a00ff), // Purple
      new THREE.Color(0xff0080), // Pink
      new THREE.Color(0xffffff), // White
      new THREE.Color(0x0022ff)  // Deep Blue
    ];

    const branches = 5;
    const radius = 1200;
    const spin = 3.5;

    for (let i = 0; i < starCount; i++) {
        const r = Math.pow(Math.random(), 1.5) * radius;
        const branchAngle = ((i % branches) / branches) * Math.PI * 2;
        const spinAngle = r * spin * 0.01;
        
        const randomX = (Math.random() - 0.5) * Math.pow(r, 0.6) * 30;
        // Increased Y variance (Volumetric disk) for scroll coverage
        const randomY = (Math.random() - 0.5) * 600; 
        const randomZ = (Math.random() - 0.5) * Math.pow(r, 0.6) * 30;

        positions[i * 3] = Math.cos(branchAngle + spinAngle) * r + randomX;
        positions[i * 3 + 1] = randomY; 
        positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

        const mixedColor = cosmicColors[Math.floor(Math.random() * cosmicColors.length)].clone();
        // Core is more subtle
        if (r < 150) mixedColor.lerp(new THREE.Color(0x333333), 0.4);
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;

        sizes[i] = (Math.random() * 2.0) + (r < 100 ? 1 : 0);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      map: this.createStarTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  createStaticHalo() {
    const haloCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(haloCount * 3);
    const colors = new Float32Array(haloCount * 3);

    for (let i = 0; i < haloCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4000;

      const color = new THREE.Color(0xffffff);
      color.setHSL(Math.random(), 0.5, 0.8);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending
    });

    this.halo = new THREE.Points(geometry, material);
    this.scene.add(this.halo);
  }

  createVibrantNebulae() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const nebulaColors = [0x7a00ff, 0xff0080, 0x00f0ff, 0x002244];
    
    for (let i = 0; i < 40; i++) { // More nebulae
      const material = new THREE.SpriteMaterial({
        map: texture,
        color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
        transparent: true,
        opacity: 0.04 + Math.random() * 0.06,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(material);
      
      const r = 200 + Math.random() * 600;
      const angle = Math.random() * Math.PI * 2;
      
      sprite.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 800, // Distributed vertically
        Math.sin(angle) * r
      );
      
      const scale = 400 + Math.random() * 800;
      sprite.scale.set(scale, scale, 1);
      
      this.scene.add(sprite);
      this.nebulae.push({
        obj: sprite,
        speed: 0.0005 + Math.random() * 0.001,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;
    this.scrollProgress += (this.targetScroll - this.scrollProgress) * 0.05;

    // Fixed Rotation
    this.stars.rotation.y += 0.0002;
    this.halo.rotation.x += 0.00005;
    this.halo.rotation.y += 0.00005;
    
    // Optimized Camera Path (Keep in volume)
    const travelRange = 400; // Total vertical travel
    const targetCamX = this.mouseX * 30;
    const targetCamY = -this.scrollProgress * travelRange + (this.mouseY * 20);
    
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05;
    this.camera.position.z = 200 + Math.sin(this.scrollProgress * Math.PI) * 150;
    
    // Look ahead to the core
    this.camera.lookAt(0, -this.scrollProgress * travelRange - 100, 0);

    // Pulsing Nebulae
    this.nebulae.forEach((neb) => {
      neb.obj.material.opacity = 0.05 + Math.sin(time * 0.5 + neb.phase) * 0.03;
      const angle = time * neb.speed + neb.phase;
      const r = Math.sqrt(neb.obj.position.x ** 2 + neb.obj.position.z ** 2);
      neb.obj.position.x = Math.cos(angle) * r;
      neb.obj.position.z = Math.sin(angle) * r;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.GalaxyBackground = GalaxyBackground;
if (typeof THREE !== 'undefined') {
  console.log('GALAXY_INITIALIZER: Volumetric High-Fidelity Engine Active.');
}
