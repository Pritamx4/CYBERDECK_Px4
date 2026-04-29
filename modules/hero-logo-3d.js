import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

/**
 * Hero Logo 3D - Pure Silver Chrome Edition
 * Features: High-Fidelity HDR Environment Reflections & Mirror Polish
 */

class HeroLogo3D {
  constructor() {
    console.log('PX4_3D_LOG: Chrome Constructor started.');
    this.container = document.getElementById('hero-logo-canvas');
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // HDR-ready Tone Mapping
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.useLegacyLights = false;

    this.logoGroup = new THREE.Group();
    this.placeholderGroup = new THREE.Group();
    this.mainGroup = null;
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;

    this.init();
  }

  init() {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Set initial canvas size
    const width = this.container.offsetWidth || 300;
    const height = this.container.offsetHeight || 300;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.camera.position.z = 1000;

    this.setupLighting();
    this.setupEnvironment();
    this.createPlaceholder();
    this.loadLogoSVG();
    
    const resizeObserver = new ResizeObserver(() => this.handleResize());
    resizeObserver.observe(this.container);

    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.animate();
  }

  setupLighting() {
    // Subtle ambient for soft fill
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    // Sharp white point light for glints
    this.pointLight = new THREE.PointLight(0xffffff, 10, 2000);
    this.pointLight.position.set(200, 200, 800);
    this.scene.add(this.pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(0, 500, 500);
    this.scene.add(dirLight);
  }

  setupEnvironment() {
    // CORS-Proof Procedural Environment Map
    // Generates a high-contrast Studio Light texture using an offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // High-contrast gradient for sharp chrome reflections
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#ffffff');    // Sky/Light
    grad.addColorStop(0.48, '#222222'); // Horizon line
    grad.addColorStop(0.52, '#666666'); // Ground line
    grad.addColorStop(1, '#000000');    // Floor
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    
    // Virtual 'Window' lights to create sharp metallic glints
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 40, 120, 120);
    ctx.fillRect(350, 80, 60, 100);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    this.scene.environment = texture;
    console.log('PX4_3D_LOG: Procedural Chrome Environment Active.');
  }

  createPlaceholder() {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00FFD1, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.2 
    });
    const box = new THREE.Mesh(geometry, material);
    this.placeholderGroup.add(box);
    this.scene.add(this.placeholderGroup);
  }

  loadLogoSVG() {
    const loader = new SVGLoader();
    const svgPath = 'images/px4%20main%20logo.svg';

    loader.load(
      svgPath,
      (data) => {
        this.scene.remove(this.placeholderGroup);
        const paths = data.paths;
        
        paths.forEach((path) => {
          const shapes = SVGLoader.createShapes(path);
          shapes.forEach((shape) => {
            const extrudeSettings = {
              depth: 40,
              bevelEnabled: true,
              bevelThickness: 4,
              bevelSize: 4,
              bevelOffset: 0,
              bevelSegments: 16 // High segment count for silky smooth chrome edges
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

            // PURE SILVER CHROME: Multi-layered physical material
            const material = new THREE.MeshPhysicalMaterial({
              color: 0xFFFFFF,      // Pure Silver/White base
              metalness: 1.0,       // 100% Metallic
              roughness: 0.0,       // Mirror Finish
              ior: 2.5,             // High index of refraction for punchy reflections
              envMapIntensity: 2.0, // Boost reflection brightness
              clearcoat: 1.0,       // Extra layer of polish
              clearcoatRoughness: 0.0,
              reflectivity: 1.0,
              side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            this.logoGroup.add(mesh);
          });
        });

        // Center the entire group
        const box = new THREE.Box3().setFromObject(this.logoGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        this.mainGroup = new THREE.Group();
        this.mainGroup.add(this.logoGroup);
        this.logoGroup.position.set(-center.x, -center.y, -center.z);
        
        this.mainGroup.scale.set(0.55, -0.55, 0.55);
        this.scene.add(this.mainGroup);
        console.log('PX4_3D_LOG: Chrome Logo Material Applied.');
      }
    );
  }

  handleResize() {
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left - rect.width / 2) / 250;
    this.mouseY = (e.clientY - rect.top - rect.height / 2) / 250;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001;

    if (this.placeholderGroup) {
      this.placeholderGroup.rotation.y += 0.01;
    }

    if (this.mainGroup) {
      this.mainGroup.rotation.y += 0.001; // Slower, more cinematic rotation
      
      this.targetRotationX += (this.mouseY * 0.25 - this.targetRotationX) * 0.05;
      this.targetRotationY += (this.mouseX * 0.25 - this.targetRotationY) * 0.05;
      
      this.mainGroup.rotation.x = this.targetRotationX;
      this.mainGroup.rotation.y += this.targetRotationY * 0.1;
    }

    if (this.pointLight) {
        // Move light for dynamic glints on the chrome surface
      this.pointLight.position.x = Math.sin(time) * 400;
      this.pointLight.position.z = Math.cos(time * 0.5) * 600;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

const init = () => {
  const container = document.getElementById('hero-logo-canvas');
  if (container && container.offsetWidth > 0) {
    window.heroLogo3DInstance = new HeroLogo3D();
  } else {
    setTimeout(init, 100);
  }
};
init();
