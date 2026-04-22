import * as THREE from 'three';

/**
 * JourneyTimeline - Sci-Fi Megacity Journey
 * Creates a grounded high-tech city with curved transit lanes, dense futuristic towers,
 * and anchored geometry so roads and structures never appear to float.
 */
class JourneyTimeline {
    constructor() {
        this.container = document.getElementById('journey-timeline-container');
        this.exitBtn = document.getElementById('exit-timeline-btn');
        this.hud = this.container ? this.container.querySelector('.timeline-hud') : null;

        this.isActive = false;
        this.scrollProgress = 0;
        this.targetProgress = 0;
        this.clock = new THREE.Clock();
        this.savedScrollY = 0;

        this.pointerState = {
            active: false,
            lastX: 0,
            lastY: 0,
            pointerId: null
        };

        this.groundOffset = -24;
        this.pathCurve = null;
        this.pathRibbon = null;
        this.pathSamples = [];
        this.milestones = [];
        this.hazeSprites = [];
        this.dustParticles = null;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

        this.init();
    }

    init() {
        this.applyResponsiveSettings();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(this.getPixelRatio());
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.setClearColor(0x000000, 0);

        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.inset = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        this.renderer.domElement.style.pointerEvents = 'none';

        this.container.appendChild(this.renderer.domElement);
        this.container.style.touchAction = 'none';
        this.container.style.overscrollBehavior = 'none';

        this.createSky();
        this.createJourneyPath();
        this.createGround();
        this.createEnvironment();
        this.createMilestones();
        this.createAtmosphere();
        this.createLights();

        this.bindEvents();
        window.addEventListener('resize', () => this.onResize());

        this.animate();
    }

    bindEvents() {
        const pointerDown = (event) => this.onPointerDown(event);
        const pointerMove = (event) => this.onPointerMove(event);
        const pointerUp = (event) => this.onPointerUp(event);
        const keyDown = (event) => this.onKeyDown(event);

        this.container.addEventListener('wheel', (event) => this.onScroll(event), { passive: false });
        this.container.addEventListener('pointerdown', pointerDown, { passive: false });
        window.addEventListener('pointermove', pointerMove, { passive: false });
        window.addEventListener('pointerup', pointerUp, { passive: false });
        window.addEventListener('pointercancel', pointerUp, { passive: false });
        window.addEventListener('keydown', keyDown);
    }

    getPixelRatio() {
        return Math.min(window.devicePixelRatio, this.isCompactMode() ? 1.35 : 2);
    }

    isCompactMode() {
        return window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
    }

    applyResponsiveSettings() {
        const compact = this.isCompactMode();
        this.camera.fov = compact ? 54 : 46;
        this.camera.updateProjectionMatrix();
        if (this.renderer) {
            this.renderer.setPixelRatio(this.getPixelRatio());
        }
    }

    lockPageScroll() {
        this.savedScrollY = window.scrollY || window.pageYOffset || 0;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.savedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overscrollBehavior = 'none';
        document.body.style.overscrollBehavior = 'none';
    }

    unlockPageScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overscrollBehavior = '';
        document.body.style.overscrollBehavior = '';
        window.scrollTo(0, this.savedScrollY);
    }

    setTargetProgress(nextProgress) {
        this.targetProgress = THREE.MathUtils.clamp(nextProgress, 0, 0.995);
    }

    onPointerDown(event) {
        if (!this.isActive || event.target.closest('button')) {
            return;
        }

        event.preventDefault();
        this.pointerState.active = true;
        this.pointerState.lastX = event.clientX;
        this.pointerState.lastY = event.clientY;
        this.pointerState.pointerId = event.pointerId;

        if (event.pointerId !== undefined && this.container.setPointerCapture) {
            this.container.setPointerCapture(event.pointerId);
        }
    }

    onPointerMove(event) {
        if (!this.isActive || !this.pointerState.active) {
            return;
        }

        event.preventDefault();
        const deltaY = event.clientY - this.pointerState.lastY;
        const deltaX = event.clientX - this.pointerState.lastX;
        this.pointerState.lastX = event.clientX;
        this.pointerState.lastY = event.clientY;

        const sensitivity = this.isCompactMode() ? 0.00115 : 0.0007;
        const motion = THREE.MathUtils.clamp((Math.abs(deltaY) + Math.abs(deltaX) * 0.45) * sensitivity, 0.00005, 0.006);
        this.setTargetProgress(this.targetProgress + (deltaY * -motion));
    }

    onPointerUp(event) {
        if (!this.pointerState.active) {
            return;
        }

        this.pointerState.active = false;
        this.pointerState.pointerId = null;

        if (event && event.pointerId !== undefined && this.container.releasePointerCapture) {
            try {
                this.container.releasePointerCapture(event.pointerId);
            } catch (error) {
                // Ignore pointer release issues on browsers that already dropped capture.
            }
        }
    }

    onKeyDown(event) {
        if (event.key === 'Escape' && this.isActive) {
            this.deactivate();
        }
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    pick(values) {
        return values[Math.floor(Math.random() * values.length)];
    }

    baseTerrainHeight(x, z) {
        return (
            Math.sin(x * 0.0018) * 6.5 +
            Math.cos(z * 0.0015) * 5.5 +
            Math.sin((x + z) * 0.0009) * 3.8 +
            Math.cos((x - z) * 0.0013) * 2.8
        );
    }

    sampleGroundHeight(x, z) {
        const roadInfluence = this.pathCurve ? this.getRoadDepthInfluence(x, z) : 0;
        return this.baseTerrainHeight(x, z) - roadInfluence * 5.2;
    }

    worldGroundHeight(x, z) {
        return this.groundOffset + this.sampleGroundHeight(x, z);
    }

    getRoadDepthInfluence(x, z) {
        if (!this.pathSamples || this.pathSamples.length === 0) {
            return 0;
        }

        let closestDistance = Infinity;
        for (let index = 0; index < this.pathSamples.length; index += 8) {
            const sample = this.pathSamples[index];
            const distance = Math.hypot(x - sample.point.x, z - sample.point.z);
            if (distance < closestDistance) {
                closestDistance = distance;
            }
        }

        return THREE.MathUtils.clamp(1 - closestDistance / 86, 0, 1);
    }

    snapObjectToGround(object, x, z, clearance = 0) {
        object.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(object);
        const targetY = this.worldGroundHeight(x, z) + clearance;
        const delta = targetY - bounds.min.y;
        object.position.y += delta;
    }

    createSky() {
        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 1024;
        const context = canvas.getContext('2d');

        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#060b19');
        gradient.addColorStop(0.28, '#111f45');
        gradient.addColorStop(0.56, '#253463');
        gradient.addColorStop(0.78, '#4f3a78');
        gradient.addColorStop(1, '#102642');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const coreGlow = context.createRadialGradient(2, 760, 40, 2, 760, 260);
        coreGlow.addColorStop(0, 'rgba(120, 188, 255, 0.85)');
        coreGlow.addColorStop(0.45, 'rgba(108, 125, 255, 0.3)');
        coreGlow.addColorStop(1, 'rgba(108, 125, 255, 0)');
        context.fillStyle = coreGlow;
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (let index = 0; index < 45; index += 1) {
            context.fillStyle = `rgba(255, 255, 255, ${0.06 + Math.random() * 0.12})`;
            context.fillRect(Math.random() * canvas.width, Math.random() * (canvas.height * 0.7), 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        this.scene.background = texture;
        this.scene.fog = new THREE.FogExp2(0x0d1530, 0.00105);
    }

    createGround() {
        const geometry = new THREE.PlaneGeometry(5000, 5000, 240, 240);
        const position = geometry.attributes.position;
        const colors = [];
        const base = new THREE.Color(0x0f1428);
        const trench = new THREE.Color(0x090d19);
        const highlight = new THREE.Color(0x1a294f);

        for (let index = 0; index < position.count; index += 1) {
            const x = position.getX(index);
            const z = position.getY(index);
            const height = this.sampleGroundHeight(x, z);
            const gridMix = Math.sin(x * 0.004) * Math.sin(z * 0.004);
            const roadInfluence = this.getRoadDepthInfluence(x, z);

            position.setZ(index, height);
            const color = base.clone()
                .lerp(highlight, THREE.MathUtils.clamp(0.5 + gridMix * 0.5, 0, 1) * 0.36)
                .lerp(trench, roadInfluence * 0.28);
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();

        const basePlane = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.95,
                metalness: 0.08
            })
        );
        basePlane.rotation.x = -Math.PI / 2;
        basePlane.position.y = this.groundOffset;
        basePlane.receiveShadow = true;
        this.scene.add(basePlane);

        for (let index = 0; index < 12; index += 1) {
            const platform = new THREE.Mesh(
                new THREE.CylinderGeometry(95 + index * 24, 95 + index * 24, 1.4, 8),
                new THREE.MeshStandardMaterial({
                    color: index % 2 === 0 ? 0x1a2140 : 0x12172f,
                    roughness: 0.82,
                    metalness: 0.35,
                    emissive: index % 3 === 0 ? 0x192d6c : 0x0a1229,
                    emissiveIntensity: 0.28
                })
            );
            platform.position.set(0, this.groundOffset - 4.8 + index * 0.45, -900 + index * 150);
            platform.rotation.y = (index * Math.PI) / 8;
            platform.receiveShadow = true;
            this.scene.add(platform);
        }
    }

    createJourneyPath() {
        const blueprint = [
            { x: -280, z: 240 },
            { x: -235, z: 92 },
            { x: -260, z: -78 },
            { x: -110, z: -260 },
            { x: 46, z: -410 },
            { x: 190, z: -575 },
            { x: 64, z: -770 },
            { x: -150, z: -940 },
            { x: -52, z: -1160 },
            { x: 168, z: -1360 },
            { x: 82, z: -1590 },
            { x: -115, z: -1810 },
            { x: -30, z: -2020 }
        ];

        const points = blueprint.map((node) => {
            const y = this.worldGroundHeight(node.x, node.z) + 1.3;
            return new THREE.Vector3(node.x, y, node.z);
        });

        this.pathCurve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.52);
        this.pathSamples = this.sampleCurve(this.pathCurve, 300);

        this.pathRibbon = this.buildPathRibbon(this.pathSamples);
        this.scene.add(this.pathRibbon);

        const guideMaterial = new THREE.MeshStandardMaterial({
            color: 0x63e4ff,
            roughness: 0.22,
            metalness: 0.52,
            emissive: 0x1f6c9d,
            emissiveIntensity: 0.7
        });
        for (let index = 12; index < this.pathSamples.length - 12; index += 14) {
            const sample = this.pathSamples[index];
            const guide = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.24, 2.8), guideMaterial.clone());
            guide.position.copy(sample.point);
            guide.position.y += 0.18;
            guide.lookAt(this.pathSamples[Math.min(index + 2, this.pathSamples.length - 1)].point);
            this.scene.add(guide);
        }

        const start = this.pathCurve.getPointAt(0.02);
        const startAhead = this.pathCurve.getPointAt(0.05);
        this.camera.position.copy(start).add(new THREE.Vector3(-32, 18, 46));
        this.camera.lookAt(startAhead.x, startAhead.y + 4, startAhead.z);
    }

    sampleCurve(curve, count) {
        const samples = [];
        const up = new THREE.Vector3(0, 1, 0);

        for (let index = 0; index < count; index += 1) {
            const progress = index / (count - 1);
            const point = curve.getPointAt(progress);
            const tangent = curve.getTangentAt(progress).normalize();
            let side = new THREE.Vector3().crossVectors(up, tangent).normalize();

            if (side.lengthSq() < 0.0001) {
                side = new THREE.Vector3(1, 0, 0);
            }

            samples.push({ point, tangent, side, progress });
        }

        return samples;
    }

    buildPathRibbon(samples) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        const trackColor = new THREE.Color(0x2c3346);
        const trackEdge = new THREE.Color(0x1a1f2d);
        const laneColor = new THREE.Color(0x8ce4ff);
        const up = new THREE.Vector3(0, 1, 0);

        samples.forEach((sample, index) => {
            const nextSample = samples[Math.min(index + 1, samples.length - 1)];
            const curveMix = 0.48 + Math.sin(sample.progress * Math.PI * 4.2) * 0.12;
            const width = 22 + curveMix * 5.4 + Math.sin(index * 0.17) * 0.9;
            const heightLift = 0.52 + Math.sin(sample.progress * Math.PI * 2.6) * 0.42;
            const bank = Math.sin(sample.progress * Math.PI * 4.8) * 0.08;
            const left = sample.point.clone().add(sample.side.clone().multiplyScalar(-width * 0.5)).add(up.clone().multiplyScalar(heightLift - bank));
            const right = sample.point.clone().add(sample.side.clone().multiplyScalar(width * 0.5)).add(up.clone().multiplyScalar(heightLift + bank));

            positions.push(left.x, left.y, left.z, right.x, right.y, right.z);

            const blended = trackColor.clone().lerp(new THREE.Color(0x3d4261), Math.sin(sample.progress * Math.PI * 2) * 0.16 + 0.22);
            const edgeColor = blended.clone().lerp(trackEdge, 0.28);
            colors.push(blended.r, blended.g, blended.b, edgeColor.r, edgeColor.g, edgeColor.b);

            if (index < samples.length - 1) {
                const a = index * 2;
                const b = index * 2 + 1;
                const c = index * 2 + 2;
                const d = index * 2 + 3;
                indices.push(a, b, d, a, d, c);
            }

            if (nextSample && index % 15 === 0) {
                const center = sample.point.clone().lerp(nextSample.point, 0.5);
                center.y += 0.24;
                const lineMark = new THREE.Mesh(
                    new THREE.BoxGeometry(1.1, 0.08, 3.6),
                    new THREE.MeshStandardMaterial({
                        color: laneColor,
                        roughness: 0.22,
                        metalness: 0.38,
                        emissive: 0x1f7fc8,
                        emissiveIntensity: 0.75
                    })
                );
                lineMark.position.copy(center);
                lineMark.position.y += 0.08;
                lineMark.lookAt(nextSample.point.x, lineMark.position.y, nextSample.point.z);
                this.scene.add(lineMark);
            }
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 1,
            roughness: 0.64,
            metalness: 0.36,
            emissive: new THREE.Color(0x081426),
            emissiveIntensity: 0.44,
            side: THREE.DoubleSide
        });

        const ribbon = new THREE.Mesh(geometry, material);
        ribbon.receiveShadow = true;
        ribbon.castShadow = false;
        return ribbon;
    }

    getPathFrame(progress) {
        const point = this.pathCurve.getPointAt(progress);
        const tangent = this.pathCurve.getTangentAt(progress).normalize();
        let side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), tangent).normalize();

        if (side.lengthSq() < 0.0001) {
            side = new THREE.Vector3(1, 0, 0);
        }

        return { point, tangent, side, progress };
    }

    createEnvironment() {
        const zones = [
            { start: 0.04, end: 0.22, density: 0.78, style: 'industrial' },
            { start: 0.24, end: 0.44, density: 1.2, style: 'core' },
            { start: 0.46, end: 0.62, density: 0.68, style: 'energy' },
            { start: 0.64, end: 0.88, density: 1.35, style: 'mega' }
        ];

        zones.forEach((zone, zoneIndex) => {
            const count = Math.floor(14 + zone.density * 20);
            for (let index = 0; index < count; index += 1) {
                const progress = this.randomRange(zone.start, zone.end);
                const frame = this.getPathFrame(progress);
                const side = Math.random() > 0.5 ? 1 : -1;
                const lateral = zone.style === 'core' ? this.randomRange(44, 180) : this.randomRange(58, 240);
                const forward = this.randomRange(-36, 36);

                const x = frame.point.x + frame.side.x * lateral * side + frame.tangent.x * forward;
                const z = frame.point.z + frame.side.z * lateral * side + frame.tangent.z * forward;

                const tower = this.createSciFiStructure(zone.style, index + zoneIndex * 13);
                tower.position.set(x, 0, z);
                tower.lookAt(frame.point.x, 0, frame.point.z);
                tower.rotateY(this.randomRange(-0.22, 0.22));
                this.snapObjectToGround(tower, x, z, 0.16);
                this.scene.add(tower);
            }

            const haze = this.createDistrictHaze((zone.start + zone.end) * 0.5, zone.style);
            this.scene.add(haze);
        });

        [0.1, 0.33, 0.57, 0.82].forEach((progress, index) => {
            const frame = this.getPathFrame(progress);
            const gate = this.createTransitGate(index);
            const x = frame.point.x + frame.side.x * (index % 2 === 0 ? 28 : -28);
            const z = frame.point.z + frame.side.z * (index % 2 === 0 ? 28 : -28);
            gate.position.set(x, 0, z);
            gate.lookAt(frame.point.x, 0, frame.point.z);
            this.snapObjectToGround(gate, x, z, 0.12);
            this.scene.add(gate);
        });
    }

    createSciFiStructure(style, seed) {
        const group = new THREE.Group();
        const styleMap = {
            industrial: { base: 0x1b2238, panel: 0x2f3651, glow: 0x5ac8ff, height: [28, 76] },
            core: { base: 0x1b1f45, panel: 0x414896, glow: 0x63f0ff, height: [52, 160] },
            energy: { base: 0x1a2745, panel: 0x254d71, glow: 0xff4fe1, height: [36, 120] },
            mega: { base: 0x121a3b, panel: 0x2a3471, glow: 0x79a7ff, height: [78, 210] }
        };

        const selected = styleMap[style] || styleMap.core;
        const width = this.randomRange(12, 26);
        const depth = this.randomRange(12, 30);
        const height = this.randomRange(selected.height[0], selected.height[1]);
        const form = ['spire', 'terrace', 'arcology', 'prism', 'stack'][seed % 5];

        const shellMaterial = new THREE.MeshStandardMaterial({
            color: selected.base,
            roughness: 0.42,
            metalness: 0.55,
            emissive: new THREE.Color(selected.panel).multiplyScalar(0.18),
            emissiveIntensity: 0.72
        });

        const glowMaterial = new THREE.MeshBasicMaterial({
            color: selected.glow,
            transparent: true,
            opacity: 0.58,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const basePod = new THREE.Mesh(
            new THREE.CylinderGeometry(width * 0.74, width * 0.92, 3.8, 8),
            new THREE.MeshStandardMaterial({ color: 0x2a3046, roughness: 0.72, metalness: 0.4, emissive: 0x19253f, emissiveIntensity: 0.3 })
        );
        basePod.position.y = 1.9;
        group.add(basePod);

        if (form === 'spire') {
            const core = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.22, width * 0.34, height, 8), shellMaterial);
            core.position.y = height * 0.5 + 3;
            group.add(core);
            const crown = new THREE.Mesh(new THREE.ConeGeometry(width * 0.2, height * 0.22, 6), glowMaterial);
            crown.position.y = height + 8;
            group.add(crown);
        } else if (form === 'terrace') {
            for (let level = 0; level < 5; level += 1) {
                const slab = new THREE.Mesh(
                    new THREE.BoxGeometry(width + level * 3.8, height * (0.15 + level * 0.03), depth + level * 3.2),
                    shellMaterial.clone()
                );
                slab.position.y = 3 + level * (height * 0.17);
                group.add(slab);
            }
            const halo = new THREE.Mesh(new THREE.TorusGeometry(width * 0.48, 0.68, 10, 30), glowMaterial);
            halo.rotation.x = Math.PI / 2;
            halo.position.y = height * 0.78;
            group.add(halo);
        } else if (form === 'arcology') {
            const body = new THREE.Mesh(new THREE.BoxGeometry(width * 1.1, height * 0.72, depth * 1.05), shellMaterial);
            body.position.y = height * 0.36 + 3;
            group.add(body);
            const arch = new THREE.Mesh(new THREE.TorusGeometry(width * 0.62, 1.2, 12, 34, Math.PI), glowMaterial.clone());
            arch.rotation.z = Math.PI / 2;
            arch.position.y = height * 0.72;
            group.add(arch);
        } else if (form === 'prism') {
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.36, width * 0.68, height, 5), shellMaterial);
            tower.position.y = height * 0.5 + 3;
            group.add(tower);
            const cap = new THREE.Mesh(new THREE.OctahedronGeometry(width * 0.36), glowMaterial);
            cap.position.y = height + 6;
            group.add(cap);
        } else {
            const lower = new THREE.Mesh(new THREE.BoxGeometry(width * 1.08, height * 0.48, depth * 1.08), shellMaterial);
            lower.position.y = height * 0.24 + 3;
            group.add(lower);
            const upper = new THREE.Mesh(new THREE.BoxGeometry(width * 0.62, height * 0.72, depth * 0.62), shellMaterial.clone());
            upper.position.y = height * 0.82;
            group.add(upper);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(width * 0.5, 0.58, 10, 24), glowMaterial.clone());
            ring.rotation.x = Math.PI / 2;
            ring.position.y = height * 0.62;
            group.add(ring);
        }

        const strip = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.94, 0.9, depth * 1.02),
            new THREE.MeshBasicMaterial({ color: selected.glow, transparent: true, opacity: 0.62, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        strip.position.y = Math.min(height * 0.52, 62);
        group.add(strip);

        group.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        return group;
    }

    createTransitGate(seed) {
        const group = new THREE.Group();
        const frame = new THREE.Mesh(
            new THREE.TorusGeometry(10 + (seed % 3) * 2.5, 1, 10, 26),
            new THREE.MeshStandardMaterial({ color: 0x2b3f6a, roughness: 0.4, metalness: 0.5, emissive: 0x2f74c2, emissiveIntensity: 0.75 })
        );
        frame.rotation.x = Math.PI / 2;
        frame.position.y = 11;
        group.add(frame);

        const supportA = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1.2, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0x1f2741, roughness: 0.65, metalness: 0.4 })
        );
        supportA.position.set(-7, 5, 0);
        group.add(supportA);

        const supportB = supportA.clone();
        supportB.position.x = 7;
        group.add(supportB);
        return group;
    }

    createDistrictHaze(progress, style) {
        const frame = this.getPathFrame(progress);
        const tone = style === 'energy' ? 0xff56e5 : style === 'core' ? 0x63e4ff : 0x7184ff;
        const haze = new THREE.Sprite(
            new THREE.SpriteMaterial({
                color: tone,
                transparent: true,
                opacity: style === 'mega' ? 0.1 : 0.14,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })
        );
        haze.position.copy(frame.point);
        haze.position.y += 48;
        haze.scale.set(style === 'mega' ? 420 : 340, style === 'mega' ? 200 : 150, 1);
        this.hazeSprites.push({ mesh: haze, drift: this.randomRange(0.01, 0.05), phase: Math.random() * Math.PI * 2 });
        return haze;
    }

    createMilestones() {
        const entries = [
            { type: 'school', title: 'HIGH SCHOOL', year: '2016-2018', progress: 0.14, side: -1 },
            { type: 'college', title: 'UNIVERSITY', year: '2018-2022', progress: 0.48, side: 1 },
            { type: 'project', title: 'CYBERDECK_PX4', year: '2023-PRESENT', progress: 0.84, side: -1 }
        ];

        entries.forEach((entry, index) => {
            const sculpture = this.createMilestoneSculpture(entry.type, index);
            const frame = this.getPathFrame(entry.progress);
            const offset = frame.side.clone().multiplyScalar(entry.side * (30 + index * 6));
            const x = frame.point.x + offset.x;
            const z = frame.point.z + offset.z;

            sculpture.position.set(x, 0, z);
            this.snapObjectToGround(sculpture, x, z, 0.08);
            sculpture.lookAt(frame.point.x, sculpture.position.y, frame.point.z);
            this.scene.add(sculpture);

            this.createFloatingLabel(entry.title, entry.year, sculpture.position, index === 2 ? 0x63e4ff : 0x8ea6ff, entry.side);
            this.milestones.push({ mesh: sculpture, baseY: sculpture.position.y, phase: Math.random() * Math.PI * 2 });
        });
    }

    createMilestoneSculpture(type) {
        const group = new THREE.Group();
        const palette = {
            school: { base: 0x24335f, roof: 0x4a6cc7, accent: 0x63e4ff },
            college: { base: 0x2a274f, roof: 0x8158ff, accent: 0x9c86ff },
            project: { base: 0x1b2c46, roof: 0x2f8cc7, accent: 0x56f4e2 }
        };
        const selected = palette[type] || palette.project;

        const shell = new THREE.MeshStandardMaterial({
            color: selected.base,
            roughness: 0.36,
            metalness: 0.56,
            emissive: new THREE.Color(selected.accent).multiplyScalar(0.24),
            emissiveIntensity: 0.9
        });

        const glow = new THREE.MeshBasicMaterial({
            color: selected.accent,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        if (type === 'school') {
            const base = new THREE.Mesh(new THREE.BoxGeometry(18, 10, 12), shell);
            base.position.y = 5;
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(4, 5.6, 26, 6), shell.clone());
            tower.position.y = 22;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(8.2, 0.75, 10, 24), glow);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 15;
            group.add(base, tower, ring);
        } else if (type === 'college') {
            const dome = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 20, 0, Math.PI * 2, 0, Math.PI / 2), shell);
            dome.position.y = 10;
            const plinth = new THREE.Mesh(new THREE.BoxGeometry(22, 6, 16), shell.clone());
            plinth.position.y = 3;
            const spires = new THREE.Group();
            for (let index = 0; index < 6; index += 1) {
                const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.1, 11, 6), shell.clone());
                spire.position.set(Math.cos((index / 6) * Math.PI * 2) * 10.5, 7, Math.sin((index / 6) * Math.PI * 2) * 7.5);
                spires.add(spire);
            }
            group.add(dome, plinth, spires);
        } else {
            const frame = new THREE.Mesh(new THREE.BoxGeometry(24, 20, 8), shell);
            frame.position.y = 10;
            const holo = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), glow.clone());
            holo.position.set(0, 10, 4.2);
            const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(4.2), glow);
            beacon.position.y = 24;
            group.add(frame, holo, beacon);
        }

        const baseSteps = new THREE.Mesh(
            new THREE.CylinderGeometry(14, 15.8, 2.4, 8),
            new THREE.MeshStandardMaterial({ color: 0x222c48, roughness: 0.72, metalness: 0.3, emissive: 0x122137, emissiveIntensity: 0.4 })
        );
        baseSteps.position.y = 1.2;
        group.add(baseSteps);

        group.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        return group;
    }

    createFloatingLabel(title, year, position, accent, side) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        const drawRoundedRect = (x, y, width, height, radius) => {
            const corner = Math.min(radius, width / 2, height / 2);
            context.beginPath();
            context.moveTo(x + corner, y);
            context.lineTo(x + width - corner, y);
            context.quadraticCurveTo(x + width, y, x + width, y + corner);
            context.lineTo(x + width, y + height - corner);
            context.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
            context.lineTo(x + corner, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - corner);
            context.lineTo(x, y + corner);
            context.quadraticCurveTo(x, y, x + corner, y);
            context.closePath();
        };

        const background = context.createLinearGradient(0, 0, canvas.width, 0);
        background.addColorStop(0, 'rgba(8, 14, 34, 0.18)');
        background.addColorStop(0.45, 'rgba(19, 30, 65, 0.78)');
        background.addColorStop(1, 'rgba(10, 18, 44, 0.22)');

        context.fillStyle = background;
        drawRoundedRect(24, 34, 976, 188, 30);
        context.fill();

        context.strokeStyle = `rgba(${((accent >> 16) & 255)}, ${((accent >> 8) & 255)}, ${accent & 255}, 0.9)`;
        context.lineWidth = 4;
        context.stroke();

        context.shadowBlur = 24;
        context.shadowColor = 'rgba(0, 0, 0, 0.6)';
        context.textAlign = 'center';
        context.fillStyle = '#f4f8ff';
        context.font = '700 72px "JetBrains Mono", monospace';
        context.fillText(title, 512, 116);
        context.font = '500 32px "Space Mono", monospace';
        context.fillStyle = 'rgba(206, 232, 255, 0.9)';
        context.fillText(year, 512, 172);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
        sprite.position.copy(position).add(new THREE.Vector3(side * 24, 24, 0));
        sprite.scale.set(30, 7.5, 1);
        this.scene.add(sprite);
    }

    createAtmosphere() {
        const pointCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(pointCount * 3);
        const colors = new Float32Array(pointCount * 3);
        const palette = [new THREE.Color(0x63e4ff), new THREE.Color(0x78a0ff), new THREE.Color(0xff56e5), new THREE.Color(0xe4ecff)];

        for (let index = 0; index < pointCount; index += 1) {
            positions[index * 3] = this.randomRange(-1000, 1000);
            positions[index * 3 + 1] = this.randomRange(6, 260);
            positions[index * 3 + 2] = this.randomRange(-2200, 260);
            const tint = this.pick(palette).clone().lerp(new THREE.Color(0x0a1631), Math.random() * 0.5);
            colors[index * 3] = tint.r;
            colors[index * 3 + 1] = tint.g;
            colors[index * 3 + 2] = tint.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.dustParticles = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                size: 0.9,
                vertexColors: true,
                transparent: true,
                opacity: 0.28,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        this.scene.add(this.dustParticles);

        for (let index = 0; index < 12; index += 1) {
            const drone = new THREE.Mesh(
                new THREE.BoxGeometry(2.6, 0.2, 1.4),
                new THREE.MeshBasicMaterial({ color: 0x9bc8ff, transparent: true, opacity: 0.76, blending: THREE.AdditiveBlending })
            );
            drone.position.set(this.randomRange(-600, 600), this.randomRange(50, 220), this.randomRange(-1900, 100));
            drone.rotation.y = this.randomRange(0, Math.PI * 2);
            this.scene.add(drone);
            this.hazeSprites.push({ mesh: drone, drift: this.randomRange(0.02, 0.06), phase: Math.random() * Math.PI * 2 });
        }
    }

    createLights() {
        const hemisphere = new THREE.HemisphereLight(0x92bcff, 0x0a1026, 1.05);
        this.scene.add(hemisphere);

        const key = new THREE.DirectionalLight(0x88aaff, 1.75);
        key.position.set(300, 260, 210);
        key.castShadow = true;
        key.shadow.camera.left = -860;
        key.shadow.camera.right = 860;
        key.shadow.camera.top = 860;
        key.shadow.camera.bottom = -860;
        key.shadow.camera.near = 1;
        key.shadow.camera.far = 1500;
        key.shadow.mapSize.width = 2048;
        key.shadow.mapSize.height = 2048;
        this.scene.add(key);

        const magentaFill = new THREE.DirectionalLight(0xff57e2, 1.1);
        magentaFill.position.set(-180, 140, -120);
        this.scene.add(magentaFill);

        const cyanFill = new THREE.DirectionalLight(0x63e4ff, 1.15);
        cyanFill.position.set(120, 90, -200);
        this.scene.add(cyanFill);

        const cityAmbient = new THREE.AmbientLight(0x182747, 0.72);
        this.scene.add(cityAmbient);
    }

    onResize() {
        this.applyResponsiveSettings();
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onScroll(event) {
        if (!this.isActive) {
            return;
        }

        event.preventDefault();
        this.targetProgress = THREE.MathUtils.clamp(this.targetProgress + event.deltaY * 0.00013, 0, 0.995);
    }

    activate() {
        this.isActive = true;
        this.container.classList.add('active');
        this.lockPageScroll();
        this.targetProgress = Math.max(this.targetProgress, 0.03);

        gsap.killTweensOf([this.container, this.exitBtn, this.hud]);
        const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });

        intro
            .set(this.container, { visibility: 'visible' })
            .fromTo(this.container, { opacity: 0 }, { opacity: 1, duration: 1.25 })
            .fromTo(this.exitBtn, { y: -16, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.75 }, 0.1)
            .fromTo(this.hud, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, 0.16);
    }

    deactivate() {
        this.isActive = false;
        this.pointerState.active = false;

        gsap.killTweensOf([this.container, this.exitBtn, this.hud]);
        gsap.timeline({
            defaults: { ease: 'power4.inOut' },
            onComplete: () => {
                this.container.classList.remove('active');
                this.unlockPageScroll();
            }
        })
            .to(this.hud, { y: 14, opacity: 0, duration: 0.45 }, 0)
            .to(this.exitBtn, { y: -12, opacity: 0, scale: 0.96, duration: 0.45 }, 0)
            .to(this.container, { opacity: 0, duration: 0.95 }, 0.05);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isActive) {
            return;
        }

        const elapsed = this.clock.getElapsedTime();
        this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.045;
        this.scrollProgress = THREE.MathUtils.clamp(this.scrollProgress, 0, 0.995);

        const frame = this.getPathFrame(this.scrollProgress);
        const lookFrame = this.getPathFrame(Math.min(this.scrollProgress + 0.035, 0.995));

        const compact = this.isCompactMode();
        const lateralDistance = compact ? -18 : -28;
        const verticalLift = compact ? 12 : 17;
        const forwardPush = compact ? 9 : 12;

        const cameraOffset = frame.side.clone().multiplyScalar(lateralDistance + Math.sin(elapsed * 0.55) * 3);
        cameraOffset.y += verticalLift + Math.sin(elapsed * 0.8) * (compact ? 0.9 : 1.4);
        cameraOffset.add(frame.tangent.clone().multiplyScalar(forwardPush));

        const targetPosition = frame.point.clone().add(cameraOffset);
        this.camera.position.lerp(targetPosition, 0.08);
        this.camera.lookAt(lookFrame.point.x, lookFrame.point.y + (compact ? 5 : 7), lookFrame.point.z);
        this.camera.rotation.z = Math.sin(elapsed * 0.35) * (compact ? 0.006 : 0.01);

        this.milestones.forEach((milestone) => {
            milestone.mesh.position.y = milestone.baseY + Math.sin(elapsed * 1.5 + milestone.phase) * 0.7;
            milestone.mesh.rotation.y += 0.0045;
        });

        if (this.dustParticles) {
            this.dustParticles.rotation.y += 0.00022;
        }

        this.hazeSprites.forEach((entry) => {
            if (!entry.mesh || !entry.mesh.material) {
                return;
            }

            if (typeof entry.mesh.material.opacity === 'number') {
                entry.mesh.material.opacity = Math.max(0.02, entry.mesh.material.opacity + Math.sin(elapsed * entry.drift + entry.phase) * 0.0015);
            }
            entry.mesh.position.y += Math.sin(elapsed * entry.drift + entry.phase) * 0.02;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

export default JourneyTimeline;
