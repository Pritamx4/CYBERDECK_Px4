import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

/**
 * Hero Logo 3D - Bulletproof Module
 * Features: Instant Placeholder, ResizeObserver, and Refined SVG Extrusion
 */

class HeroLogo3D {
  constructor() {
    console.log('PX4_3D_LOG: Constructor started.');
    this.container = document.getElementById('hero-logo-canvas');
    if (!this.container) {
      console.error('PX4_3D_LOG: Container #hero-logo-canvas NOT FOUND.');
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    this.logoGroup = new THREE.Group();
    this.placeholderGroup = new THREE.Group();
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;

    this.init();
  }

  init() {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    console.log('PX4_3D_LOG: Renderer appended.');

    this.camera.position.z = 1000;

    this.setupLighting();
    this.createPlaceholder();
    this.loadLogoSVG();
    
    // Dynamic Resizing via ResizeObserver (most robust)
    const resizeObserver = new ResizeObserver(() => this.handleResize());
    resizeObserver.observe(this.container);

    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.animate();
  }

  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    
    this.pointLight = new THREE.PointLight(0x00FFD1, 30, 2000);
    this.pointLight.position.set(200, 200, 500);
    this.scene.add(this.pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(0, 500, 500);
    this.scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    this.scene.add(hemiLight);
  }

  createPlaceholder() {
    // Instant feedback: A glowing wireframe box
    console.log('PX4_3D_LOG: Creating placeholder.');
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00FFD1, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const box = new THREE.Mesh(geometry, material);
    this.placeholderGroup.add(box);
    this.scene.add(this.placeholderGroup);
  }

  loadLogoSVG() {
    const loader = new SVGLoader();
    const svgPath = 'images/px4%20main%20logo.svg';
    console.log('PX4_3D_LOG: Loading SVG:', svgPath);

    loader.load(
      svgPath,
      (data) => {
        console.log('PX4_3D_LOG: SVG Data loaded. Paths:', data.paths.length);
        
        // Remove placeholder once data is ready
        this.scene.remove(this.placeholderGroup);
        
        const paths = data.paths;
        paths.forEach((path) => {
          const shapes = SVGLoader.createShapes(path);
          shapes.forEach((shape) => {
            const extrudeSettings = {
              depth: 35,
              bevelEnabled: true,
              bevelThickness: 3,
              bevelSize: 3,
              bevelOffset: 0,
              bevelSegments: 8
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            
            // Do not center individual paths, keep their SVG offsets
            const material = new THREE.MeshPhysicalMaterial({
              color: 0x00FFD1,
              metalness: 0.9,
              roughness: 0.1,
              emissive: 0x00FFD1,
              emissiveIntensity: 0.2,
              clearcoat: 1.0,
              clearcoatRoughness: 0.02,
              reflectivity: 1.0,
              side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            this.logoGroup.add(mesh);
          });
        });

        // Use a combined bounding box to find the exact center of all logo parts
        const box = new THREE.Box3().setFromObject(this.logoGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // Use a pivot (mainGroup) for centered rotation
        this.mainGroup = new THREE.Group();
        this.mainGroup.add(this.logoGroup);
        
        // Offset the logoGroup so its collective center is at the mainGroup origin (0,0,0)
        // We multiply Y by -1 because our group scale is inverted for SVG coordinates
        this.logoGroup.position.set(-center.x, -center.y, -center.z);
        
        this.mainGroup.scale.set(0.65, -0.65, 0.65);
        this.scene.add(this.mainGroup);
        console.log('PX4_3D_LOG: Logo mesh active and correctly aligned.');
      },
      undefined,
      (error) => {
        console.error('PX4_3D_LOG: SVG Load ERROR:', error);
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
      this.placeholderGroup.rotation.x += 0.005;
    }

    if (this.mainGroup) {
      this.mainGroup.rotation.y += 0.003;
      
      this.targetRotationX += (this.mouseY * 0.25 - this.targetRotationX) * 0.05;
      this.targetRotationY += (this.mouseX * 0.25 - this.targetRotationY) * 0.05;
      
      this.mainGroup.rotation.x = this.targetRotationX;
      this.mainGroup.rotation.y += this.targetRotationY * 0.1;
    }

    if (this.pointLight) {
      this.pointLight.position.x = Math.sin(time) * 400;
      this.pointLight.position.y = Math.cos(time * 0.5) * 300;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global exposure
window.HeroLogo3DInstance = new HeroLogo3D();
