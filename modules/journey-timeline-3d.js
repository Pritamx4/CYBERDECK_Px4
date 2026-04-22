import * as THREE from 'three';

/**
 * JourneyTimeline - High-Fidelity Winding City Experience
 * Rebuilt for "Crazy Level" visuals: winding roads, detailed architecture, 
 * golden-hour lighting, and a living world feel.
 */
class JourneyTimeline {
    constructor() {
        this.container = document.getElementById('journey-timeline-container');
        this.isActive = false;
        this.scrollProgress = 0;
        this.targetProgress = 0;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 4000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.roadCurve = null;
        this.milestones = [];
        this.environmentElements = [];
        
        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        this.createSky();
        this.createGround();
        this.createWindingRoad();
        this.createDetailedCity();
        this.createMilestones();
        this.createAtmosphere();
        this.createLights();
        
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('wheel', (e) => this.onScroll(e), { passive: false });
        
        this.animate();
    }

    createSky() {
        // Sunset / Golden Hour Gradient
        const canvas = document.createElement('canvas');
        canvas.width = 2; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#1e2a44'); // Deep Twilight Blue
        gradient.addColorStop(0.5, '#ff7e5f'); // Sunset Orange
        gradient.addColorStop(0.8, '#feb47b'); // Golden Glow
        gradient.addColorStop(1, '#ffffff'); // Horizon
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2, 512);

        this.scene.background = new THREE.CanvasTexture(canvas);
        this.scene.fog = new THREE.FogExp2(0xfeb47b, 0.002);
    }

    createGround() {
        const geo = new THREE.PlaneGeometry(3000, 3000, 50, 50);
        // Add subtle terrain noise
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            pos.setZ(i, Math.sin(x * 0.02) * Math.cos(y * 0.02) * 5);
        }
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x2d3436, 
            roughness: 0.9, 
            metalness: 0.1 
        });
        const ground = new THREE.Mesh(geo, mat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createWindingRoad() {
        // Create a complex winding curve
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(30, 0, -80),
            new THREE.Vector3(-40, 0, -180),
            new THREE.Vector3(50, 0, -300),
            new THREE.Vector3(-20, 0, -450),
            new THREE.Vector3(60, 0, -600),
            new THREE.Vector3(0, 0, -800)
        ];
        
        this.roadCurve = new THREE.CatmullRomCurve3(points);

        // Extrude geometry for a thick road
        const tubeGeo = new THREE.TubeGeometry(this.roadCurve, 200, 6, 8, false);
        const roadMat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.4 
        });
        const road = new THREE.Mesh(tubeGeo, roadMat);
        road.position.y = -5.8; // Sink it so it looks like a flat road on terrain
        road.scale.set(1, 0.1, 1);
        road.receiveShadow = true;
        this.scene.add(road);

        // Road Markings (Emissive)
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        for (let i = 0; i < 150; i++) {
            const p = this.roadCurve.getPointAt(i / 150);
            const marker = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 3), markerMat);
            marker.position.copy(p);
            marker.position.y += 0.1;
            marker.lookAt(this.roadCurve.getPointAt(Math.min((i+1)/150, 0.99)));
            this.scene.add(marker);
        }
    }

    createDetailedCity() {
        const buildingTypes = [
            { color: 0xe0e0e0, windows: true },
            { color: 0x2d3436, windows: true },
            { color: 0x7a00ff, windows: false }, // Feature building
        ];

        for (let i = 0; i < 120; i++) {
            const t = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
            const w = 8 + Math.random() * 12;
            const h = 20 + Math.random() * 80;
            const d = 8 + Math.random() * 12;
            
            const group = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: t.color }));
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            if (t.windows) {
                const winGeo = new THREE.PlaneGeometry(0.5, 0.8);
                const winMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
                for (let j = 0; j < 15; j++) {
                    const win = new THREE.Mesh(winGeo, winMat);
                    win.position.set(
                        (Math.random() - 0.5) * w * 0.8,
                        (Math.random() - 0.5) * h * 0.8,
                        d/2 + 0.1
                    );
                    group.add(win);
                }
            }

            // Position avoiding road
            const side = Math.random() > 0.5 ? 1 : -1;
            const dist = 30 + Math.random() * 150;
            const angle = Math.random() * Math.PI * 2;
            const z = -Math.random() * 900;
            const pAtZ = this.roadCurve.getPointAt(Math.abs(z) / 900);
            
            group.position.set(pAtZ.x + dist * side, h / 2, z);
            this.scene.add(group);
        }

        // Add Trees (Low Poly Cones)
        for (let i = 0; i < 200; i++) {
            const tree = this.createTree();
            const z = -Math.random() * 900;
            const p = this.roadCurve.getPointAt(Math.abs(z) / 900);
            const side = Math.random() > 0.5 ? 1 : -1;
            tree.position.set(p.x + (15 + Math.random() * 40) * side, 0, z);
            this.scene.add(tree);
        }
    }

    createTree() {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0x4a3728 }));
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2ecc71 }));
        leaves.position.y = 4;
        trunk.position.y = 2;
        group.add(trunk, leaves);
        group.scale.set(Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5);
        return group;
    }

    createMilestones() {
        const data = [
            { type: 'school', title: 'HIGH SCHOOL', year: '2016-2018', pos: 0.15, color: 0xff5f6d },
            { type: 'college', title: 'UNIVERSITY', year: '2018-2022', pos: 0.45, color: 0x7a00ff },
            { type: 'project', title: 'CYBERDECK_PX4', year: '2023-PRESENT', pos: 0.85, color: 0x00d2ff }
        ];

        data.forEach(item => {
            const milestone = this.createIconicBuilding(item.type, item.color);
            const p = this.roadCurve.getPointAt(item.pos);
            const tangent = this.roadCurve.getTangentAt(item.pos);
            
            milestone.position.copy(p);
            milestone.position.y += 2;
            milestone.position.x += 18; 
            milestone.lookAt(p.clone().add(tangent));
            milestone.rotateY(Math.PI / 2);
            
            this.scene.add(milestone);
            this.createFloatingLabel(item.title, item.year, milestone.position);
            this.milestones.push({ mesh: milestone, baseY: milestone.position.y });
        });
    }

    createIconicBuilding(type, color) {
        const group = new THREE.Group();
        const mat = new THREE.MeshPhysicalMaterial({ color: color, metalness: 0.8, roughness: 0.2, transmission: 0.3 });
        
        if (type === 'school') {
            const body = new THREE.Mesh(new THREE.BoxGeometry(10, 15, 10), mat);
            const clock = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            clock.rotation.x = Math.PI/2; clock.position.set(0, 5, 5.1);
            group.add(body, clock);
        } else if (type === 'college') {
            const dome = new THREE.Mesh(new THREE.SphereGeometry(8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), mat);
            const pillars = new THREE.Group();
            for(let i=0; i<8; i++) {
                const p = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 15), mat);
                p.position.set(Math.cos(i/8 * Math.PI*2)*10, -7.5, Math.sin(i/8 * Math.PI*2)*10);
                pillars.add(p);
            }
            group.add(dome, pillars);
        } else {
            const frame = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 2), new THREE.MeshStandardMaterial({ color: 0x222222 }));
            const screen = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 }));
            screen.position.z = 1.1;
            group.add(frame, screen);
        }

        group.traverse(o => { if(o.isMesh) o.castShadow = true; });
        return group;
    }

    createFloatingLabel(title, year, pos) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.font = '700 80px "JetBrains Mono"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.fillText(title, 512, 100);
        ctx.font = '500 40px "Space Mono"';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(year, 512, 180);

        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
        sprite.position.copy(pos).y += 20;
        sprite.scale.set(16, 4, 1);
        this.scene.add(sprite);
    }

    createAtmosphere() {
        // Birds / Floating data particles
        const count = 500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            pos[i*3] = (Math.random()-0.5)*1000;
            pos[i*3+1] = 50 + Math.random()*100;
            pos[i*3+2] = -Math.random()*1000;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.5, color: 0xffffff, transparent: true, opacity: 0.5 });
        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    createLights() {
        this.scene.add(new THREE.HemisphereLight(0xffeeb1, 0x080820, 1.0));
        
        const sun = new THREE.DirectionalLight(0xff7e5f, 2.5);
        sun.position.set(100, 100, 50);
        sun.castShadow = true;
        sun.shadow.camera.left = -500; sun.shadow.camera.right = 500;
        sun.shadow.camera.top = 500; sun.shadow.camera.bottom = -500;
        sun.shadow.mapSize.width = 4096; sun.shadow.mapSize.height = 4096;
        this.scene.add(sun);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onScroll(e) {
        if (!this.isActive) return;
        e.preventDefault();
        this.targetProgress = Math.min(Math.max(this.targetProgress + e.deltaY * 0.00015, 0), 0.99);
    }

    activate() {
        this.isActive = true;
        this.container.classList.add('active');
        document.body.style.overflow = 'hidden';
        gsap.to(this.container, { opacity: 1, duration: 1.5, ease: "power4.out" });
    }

    deactivate() {
        this.isActive = false;
        gsap.to(this.container, { 
            opacity: 0, duration: 1.2, ease: "power4.inOut",
            onComplete: () => {
                this.container.classList.remove('active');
                document.body.style.overflow = '';
            } 
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.isActive) return;

        this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.03;
        
        const p = this.roadCurve.getPointAt(this.scrollProgress);
        const look = this.roadCurve.getPointAt(Math.min(this.scrollProgress + 0.05, 0.99));
        
        // Cinematic camera movement
        const camOffset = new THREE.Vector3(-25, 18, 35);
        this.camera.position.lerp(p.clone().add(camOffset), 0.1);
        this.camera.lookAt(look.x, look.y + 5, look.z);

        // Milestones float
        const time = Date.now() * 0.001;
        this.milestones.forEach(m => {
            m.mesh.position.y = m.baseY + Math.sin(time * 2) * 0.5;
            m.mesh.rotation.y += 0.005;
        });

        if (this.particles) this.particles.rotation.y += 0.0002;

        this.renderer.render(this.scene, this.camera);
    }
}

export default JourneyTimeline;
