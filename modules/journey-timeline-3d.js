import * as THREE from 'three';

/**
 * JourneyTimeline - Cinematic Curved World
 * A stylized travel sequence with an organic path, layered districts,
 * soft atmosphere, and a moving camera that feels like a real journey.
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
        this.pointerState = {
            active: false,
            lastX: 0,
            lastY: 0,
            pointerId: null
        };
        this.savedScrollY = 0;
        this.boundListeners = [];

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

        this.pathCurve = null;
        this.pathRibbon = null;
        this.pathSamples = [];
        this.milestones = [];
        this.hazeSprites = [];
        this.dustParticles = null;

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
        this.renderer.toneMappingExposure = 1.18;
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
        this.createGround();
        this.createJourneyPath();
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

        this.boundListeners.push(
            ['wheel', this.container, (event) => this.onScroll(event), { passive: false }],
            ['pointerdown', this.container, pointerDown, { passive: false }],
            ['pointermove', window, pointerMove, { passive: false }],
            ['pointerup', window, pointerUp, { passive: false }],
            ['pointercancel', window, pointerUp, { passive: false }],
            ['keydown', window, keyDown]
        );
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
                // Ignore capture release errors on mobile browsers that already dropped the pointer.
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

    sampleGroundHeight(x, z) {
        return (
            Math.sin(x * 0.0024) * 6 +
            Math.cos(z * 0.0021) * 5 +
            Math.sin((x + z) * 0.0013) * 4 +
            Math.cos((x - z) * 0.0016) * 2.5
        );
    }

    createSky() {
        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 1024;
        const context = canvas.getContext('2d');

        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#09111f');
        gradient.addColorStop(0.28, '#172445');
        gradient.addColorStop(0.54, '#2f2a58');
        gradient.addColorStop(0.74, '#7c4a7d');
        gradient.addColorStop(0.9, '#f08fa5');
        gradient.addColorStop(1, '#fed8b1');

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        this.scene.background = texture;
        this.scene.fog = new THREE.FogExp2(0x12172d, 0.0011);
    }

    createGround() {
        const geometry = new THREE.PlaneGeometry(4200, 4200, 180, 180);
        const position = geometry.attributes.position;
        const colors = [];
        const baseColor = new THREE.Color(0x1d2745);
        const accentColor = new THREE.Color(0x4f4d9e);
        const glowColor = new THREE.Color(0x7d6cff);

        for (let index = 0; index < position.count; index += 1) {
            const x = position.getX(index);
            const y = position.getY(index);
            const height = this.sampleGroundHeight(x, y);

            position.setZ(index, height);

            const mix = THREE.MathUtils.clamp((height + 10) / 24, 0, 1);
            const color = baseColor.clone().lerp(accentColor, mix * 0.7).lerp(glowColor, Math.max(0, mix - 0.45) * 0.35);
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.95,
            metalness: 0.08,
            flatShading: false
        });

        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -18;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const glowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(3600, 3600, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0x13203f, transparent: true, opacity: 0.2, depthWrite: false })
        );
        glowPlane.rotation.x = -Math.PI / 2;
        glowPlane.position.y = -17.2;
        this.scene.add(glowPlane);
    }

    createJourneyPath() {
        const points = [
            new THREE.Vector3(-220, -2, 180),
            new THREE.Vector3(-165, 2, 40),
            new THREE.Vector3(-245, 10, -115),
            new THREE.Vector3(-120, 16, -260),
            new THREE.Vector3(35, 12, -360),
            new THREE.Vector3(165, 26, -500),
            new THREE.Vector3(70, 18, -665),
            new THREE.Vector3(-110, 22, -820),
            new THREE.Vector3(-15, 14, -1010),
            new THREE.Vector3(160, 20, -1210),
            new THREE.Vector3(55, 9, -1430),
            new THREE.Vector3(-125, 16, -1660),
            new THREE.Vector3(-40, 12, -1860)
        ];

        this.pathCurve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.55);
        this.pathSamples = this.sampleCurve(this.pathCurve, 260);

        const ribbon = this.buildPathRibbon(this.pathSamples);
        this.pathRibbon = ribbon;
        this.scene.add(ribbon);

        const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0x66f2ff, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
        const pulseGeometry = new THREE.IcosahedronGeometry(1.35, 0);

        for (let index = 10; index < this.pathSamples.length - 10; index += 11) {
            const sample = this.pathSamples[index];
            const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial.clone());
            pulse.position.copy(sample.point).add(sample.side.clone().multiplyScalar(Math.sin(index * 0.35) * 1.25));
            pulse.position.y += 1.2 + Math.sin(index * 0.45) * 0.6;
            pulse.scale.setScalar(0.55 + (index % 5) * 0.08);
            this.scene.add(pulse);
            this.hazeSprites.push({ mesh: pulse, drift: this.randomRange(0.15, 0.45), phase: Math.random() * Math.PI * 2 });
        }

        const start = this.pathCurve.getPointAt(0.02);
        const startAhead = this.pathCurve.getPointAt(0.05);
        this.camera.position.copy(start).add(new THREE.Vector3(-40, 24, 60));
        this.camera.lookAt(startAhead.x, startAhead.y + 8, startAhead.z);
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
        const leftColor = new THREE.Color(0x2d7cff);
        const centerColor = new THREE.Color(0x66f2ff);
        const rightColor = new THREE.Color(0xff7ac6);
        const up = new THREE.Vector3(0, 1, 0);

        samples.forEach((sample, index) => {
            const nextSample = samples[Math.min(index + 1, samples.length - 1)];
            const curveMix = 0.5 + Math.sin(sample.progress * Math.PI * 4.5) * 0.18;
            const width = 22 + curveMix * 10 + Math.sin(index * 0.22) * 3;
            const heightLift = 1.2 + Math.sin(sample.progress * Math.PI * 2.5) * 0.8;
            const bank = Math.sin(sample.progress * Math.PI * 5) * 0.12;
            const left = sample.point.clone().add(sample.side.clone().multiplyScalar(-width * 0.5)).add(up.clone().multiplyScalar(heightLift - bank));
            const right = sample.point.clone().add(sample.side.clone().multiplyScalar(width * 0.5)).add(up.clone().multiplyScalar(heightLift + bank));

            positions.push(left.x, left.y, left.z, right.x, right.y, right.z);

            const blended = centerColor.clone().lerp(leftColor, Math.max(0, 0.5 - sample.progress)).lerp(rightColor, Math.max(0, sample.progress - 0.45) * 0.6);
            const edgeColor = blended.clone().lerp(new THREE.Color(0x10162c), 0.25);

            colors.push(blended.r, blended.g, blended.b, edgeColor.r, edgeColor.g, edgeColor.b);

            if (index < samples.length - 1) {
                const a = index * 2;
                const b = index * 2 + 1;
                const c = index * 2 + 2;
                const d = index * 2 + 3;
                indices.push(a, b, d, a, d, c);
            }

            if (nextSample && index % 18 === 0) {
                const center = sample.point.clone().lerp(nextSample.point, 0.5);
                center.y += 0.8 + Math.sin(index * 0.3) * 0.4;
                const flare = new THREE.Mesh(
                    new THREE.SphereGeometry(0.75 + (index % 3) * 0.15, 10, 10),
                    new THREE.MeshBasicMaterial({ color: this.pick([0x66f2ff, 0xff7ac6, 0xb26dff]), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })
                );
                flare.position.copy(center);
                this.scene.add(flare);
            }
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.96,
            roughness: 0.28,
            metalness: 0.54,
            emissive: new THREE.Color(0x10152f),
            emissiveIntensity: 0.45,
            side: THREE.DoubleSide
        });

        const ribbon = new THREE.Mesh(geometry, material);
        ribbon.receiveShadow = true;
        ribbon.castShadow = false;
        return ribbon;
    }

    createEnvironment() {
        const districts = [
            { start: 0.03, end: 0.16, density: 0.38, style: 'open', accent: 0x6ef3ff },
            { start: 0.18, end: 0.34, density: 1.0, style: 'cluster', accent: 0x8b7cff },
            { start: 0.39, end: 0.55, density: 0.62, style: 'gallery', accent: 0xff84bf },
            { start: 0.58, end: 0.76, density: 1.15, style: 'dense', accent: 0x00d5ff },
            { start: 0.8, end: 0.96, density: 0.44, style: 'open', accent: 0xb26dff }
        ];

        districts.forEach((district, districtIndex) => {
            const count = Math.floor(12 + district.density * 18);

            for (let index = 0; index < count; index += 1) {
                const progress = THREE.MathUtils.clamp(
                    this.randomRange(district.start, district.end) + this.randomRange(-0.02, 0.02),
                    district.start,
                    district.end
                );

                const frame = this.getPathFrame(progress);
                const sideDirection = Math.random() > 0.5 ? 1 : -1;
                const clusterBias = district.style === 'cluster' || district.style === 'dense' ? this.randomRange(60, 240) : this.randomRange(90, 320);
                const depthOffset = this.randomRange(-38, 38);
                const height = district.style === 'dense' ? this.randomRange(28, 150) : this.randomRange(12, 86);
                const structure = this.createStructure({
                    accent: district.accent,
                    height,
                    profile: district.style,
                    layer: index % 2,
                    seed: index + districtIndex * 11
                });

                const position = frame.point.clone()
                    .add(frame.side.clone().multiplyScalar(sideDirection * clusterBias))
                    .add(frame.tangent.clone().multiplyScalar(depthOffset));

                position.y = this.sampleGroundHeight(position.x, position.z) + height / 2 - 6;
                structure.position.copy(position);
                structure.lookAt(frame.point.x, structure.position.y, frame.point.z);
                structure.rotateY(this.randomRange(-0.15, 0.15));
                this.scene.add(structure);
            }

            const hazeColor = district.style === 'dense' ? 0x8b7cff : district.accent;
            const haze = this.createFogOrb(district.start + (district.end - district.start) * 0.5, hazeColor, district.style);
            this.scene.add(haze);
        });

        const openForms = [0.1, 0.47, 0.68, 0.89];
        openForms.forEach((progress, index) => {
            const frame = this.getPathFrame(progress);
            const sculpture = this.createLandscapeSculpture(this.pick([0x6ef3ff, 0xff84bf, 0xb26dff]), index);
            sculpture.position.copy(frame.point)
                .add(frame.side.clone().multiplyScalar(index % 2 === 0 ? 175 : -175))
                .add(frame.tangent.clone().multiplyScalar(index % 2 === 0 ? 24 : -18));
            sculpture.position.y = this.sampleGroundHeight(sculpture.position.x, sculpture.position.z) + 10;
            sculpture.lookAt(frame.point.x, sculpture.position.y, frame.point.z);
            this.scene.add(sculpture);
        });
    }

    getPathFrame(progress) {
        const point = this.pathCurve.getPointAt(progress);
        const tangent = this.pathCurve.getTangentAt(progress).normalize();
        let side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), tangent).normalize();

        if (side.lengthSq() < 0.0001) {
            side = new THREE.Vector3(1, 0, 0);
        }

        return {
            point,
            tangent,
            side,
            progress
        };
    }

    createStructure({ accent, height, profile, layer, seed }) {
        const group = new THREE.Group();
        const palette = [0x0f1730, 0x19254d, 0x271f58, 0x122a42, 0x321f45];
        const baseColor = new THREE.Color(this.pick(palette));
        const accentColor = new THREE.Color(accent);
        const highlightColor = new THREE.Color(0xffffff).lerp(accentColor, 0.65);
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.46,
            metalness: 0.28,
            emissive: accentColor.clone().multiplyScalar(0.25),
            emissiveIntensity: 0.55
        });

        const glowMaterial = new THREE.MeshBasicMaterial({
            color: highlightColor,
            transparent: true,
            opacity: 0.42,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const variants = profile === 'open'
            ? ['pavilion', 'obelisk', 'arch']
            : profile === 'gallery'
                ? ['terrace', 'arch', 'blade']
                : ['spire', 'step', 'prism', 'pod', 'stack'];

        const type = variants[seed % variants.length];
        const width = this.randomRange(10, 20);
        const depth = this.randomRange(10, 20);

        if (type === 'spire') {
            const base = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.24, depth), glassMaterial);
            base.position.y = height * 0.12;
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.22, width * 0.34, height * 0.68, 6), glassMaterial);
            tower.position.y = height * 0.58;
            const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(width * 0.28, 0), glowMaterial);
            cap.position.y = height * 0.94;
            group.add(base, tower, cap);
        } else if (type === 'step') {
            for (let stepIndex = 0; stepIndex < 4; stepIndex += 1) {
                const stepWidth = width + (3 - stepIndex) * 3;
                const stepHeight = height * (0.14 + stepIndex * 0.05);
                const stepDepth = depth + (3 - stepIndex) * 2;
                const step = new THREE.Mesh(new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth), glassMaterial.clone());
                step.position.y = stepHeight * 0.5 + stepIndex * height * 0.14;
                group.add(step);
            }
            const band = new THREE.Mesh(new THREE.TorusGeometry(width * 0.42, 0.55, 10, 24), glowMaterial);
            band.rotation.x = Math.PI / 2;
            band.position.y = height * 0.72;
            group.add(band);
        } else if (type === 'prism') {
            const prism = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.35, width * 0.75, height * 0.95, 5), glassMaterial);
            prism.position.y = height * 0.47;
            const top = new THREE.Mesh(new THREE.ConeGeometry(width * 0.42, height * 0.18, 5), glowMaterial);
            top.position.y = height * 0.98;
            group.add(prism, top);
        } else if (type === 'pod') {
            const base = new THREE.Mesh(new THREE.BoxGeometry(width * 1.1, height * 0.18, depth * 1.1), glassMaterial);
            base.position.y = height * 0.09;
            const dome = new THREE.Mesh(new THREE.SphereGeometry(Math.max(width, depth) * 0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.8), glassMaterial);
            dome.position.y = height * 0.52;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(Math.max(width, depth) * 0.48, 0.45, 8, 28), glowMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = height * 0.46;
            group.add(base, dome, ring);
        } else if (type === 'arch') {
            const left = new THREE.Mesh(new THREE.BoxGeometry(width * 0.28, height * 0.75, depth * 0.5), glassMaterial);
            left.position.set(-width * 0.42, height * 0.37, 0);
            const right = new THREE.Mesh(new THREE.BoxGeometry(width * 0.28, height * 0.75, depth * 0.5), glassMaterial);
            right.position.set(width * 0.42, height * 0.37, 0);
            const arch = new THREE.Mesh(new THREE.TorusGeometry(width * 0.48, 0.72, 10, 24, Math.PI), glowMaterial);
            arch.rotation.z = Math.PI / 2;
            arch.position.y = height * 0.78;
            group.add(left, right, arch);
        } else if (type === 'blade') {
            const core = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, height * 0.82, depth * 0.4), glassMaterial);
            core.position.y = height * 0.41;
            const blade = new THREE.Mesh(new THREE.ConeGeometry(width * 0.6, height * 0.95, 4), glowMaterial);
            blade.position.y = height * 0.52;
            blade.rotation.y = Math.PI / 4;
            group.add(core, blade);
        } else if (type === 'terrace') {
            const slabs = [0.26, 0.42, 0.58];
            slabs.forEach((ratio, slabIndex) => {
                const slab = new THREE.Mesh(
                    new THREE.BoxGeometry(width + slabIndex * 6, height * ratio * 0.45, depth + slabIndex * 5),
                    glassMaterial.clone()
                );
                slab.position.y = height * ratio * 0.5 + slabIndex * height * 0.12;
                group.add(slab);
            });
            const rail = new THREE.Mesh(new THREE.TorusGeometry(width * 0.38, 0.45, 8, 18), glowMaterial);
            rail.position.y = height * 0.78;
            rail.rotation.x = Math.PI / 2;
            group.add(rail);
        } else {
            const base = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.92, depth), glassMaterial);
            base.position.y = height * 0.46;
            const cap = new THREE.Mesh(new THREE.BoxGeometry(width * 0.58, height * 0.24, depth * 0.58), glowMaterial);
            cap.position.y = height * 0.95;
            group.add(base, cap);
        }

        const windowBand = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.92, height * 0.04, depth * 1.02),
            new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        windowBand.position.y = height * 0.52;
        group.add(windowBand);

        const crown = new THREE.Mesh(
            new THREE.IcosahedronGeometry(Math.max(width, depth) * 0.12, 0),
            new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        crown.position.y = height * 0.98;
        group.add(crown);

        group.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        group.scale.setScalar(this.randomRange(0.94, 1.12));
        group.rotation.y = this.randomRange(-Math.PI, Math.PI);
        return group;
    }

    createLandscapeSculpture(accent, index) {
        const group = new THREE.Group();
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x121b36).lerp(new THREE.Color(accent), 0.25),
            roughness: 0.52,
            metalness: 0.22,
            emissive: new THREE.Color(accent).multiplyScalar(0.18),
            emissiveIntensity: 0.55
        });

        const glowMaterial = new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const core = new THREE.Mesh(new THREE.CylinderGeometry(7, 11, 24, 5), baseMaterial);
        core.position.y = 12;
        group.add(core);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(12, 0.9, 10, 26), glowMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 18;
        group.add(ring);

        const shard = new THREE.Mesh(new THREE.ConeGeometry(6, 24, 4), glowMaterial.clone());
        shard.position.y = 25;
        shard.rotation.y = Math.PI / 4 + index * 0.35;
        group.add(shard);

        const pedestal = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 20), baseMaterial.clone());
        pedestal.position.y = 2.5;
        group.add(pedestal);

        group.scale.setScalar(this.randomRange(0.85, 1.25));
        group.rotation.y = this.randomRange(-0.4, 0.4);
        group.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        return group;
    }

    createMilestones() {
        const entries = [
            { type: 'school', title: 'HIGH SCHOOL', year: '2016-2018', progress: 0.14, accent: 0xff7ac6, side: -1 },
            { type: 'college', title: 'UNIVERSITY', year: '2018-2022', progress: 0.48, accent: 0x8b7cff, side: 1 },
            { type: 'project', title: 'CYBERDECK_PX4', year: '2023-PRESENT', progress: 0.84, accent: 0x00d5ff, side: -1 }
        ];

        entries.forEach((entry, index) => {
            const sculpture = this.createMilestoneSculpture(entry.type, entry.accent, index);
            const frame = this.getPathFrame(entry.progress);
            const offset = frame.side.clone().multiplyScalar(entry.side * (28 + index * 6));
            const lift = new THREE.Vector3(0, 10 + index * 2, 0);

            sculpture.position.copy(frame.point).add(offset).add(lift);
            sculpture.lookAt(frame.point.x, sculpture.position.y, frame.point.z);
            this.scene.add(sculpture);

            this.createFloatingLabel(entry.title, entry.year, sculpture.position, entry.accent, entry.side);
            this.milestones.push({ mesh: sculpture, baseY: sculpture.position.y, phase: Math.random() * Math.PI * 2 });
        });
    }

    createMilestoneSculpture(type, accent, seed) {
        const group = new THREE.Group();
        const baseColor = new THREE.Color(0x121833).lerp(new THREE.Color(accent), 0.28);
        const glass = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.38,
            metalness: 0.32,
            emissive: new THREE.Color(accent).multiplyScalar(0.22),
            emissiveIntensity: 0.6
        });
        const glow = new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.68,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        if (type === 'school') {
            const base = new THREE.Mesh(new THREE.BoxGeometry(18, 14, 14), glass);
            base.position.y = 7;
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5.2, 30, 6), glass.clone());
            tower.position.y = 27;
            const cap = new THREE.Mesh(new THREE.TorusGeometry(7, 0.65, 8, 24), glow);
            cap.rotation.x = Math.PI / 2;
            cap.position.y = 33;
            group.add(base, tower, cap);
        } else if (type === 'college') {
            const plinth = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 18), glass);
            plinth.position.y = 4;
            const dome = new THREE.Mesh(new THREE.SphereGeometry(11, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), glass.clone());
            dome.position.y = 19;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(14, 0.8, 8, 32), glow);
            ring.position.y = 18;
            ring.rotation.x = Math.PI / 2;
            group.add(plinth, dome, ring);
        } else {
            const frame = new THREE.Mesh(new THREE.BoxGeometry(24, 20, 4), glass);
            frame.position.y = 10;
            const screen = new THREE.Mesh(new THREE.PlaneGeometry(20, 14), glow);
            screen.position.z = 2.2;
            screen.position.y = 10;
            const shard = new THREE.Mesh(new THREE.ConeGeometry(7, 22, 4), glow.clone());
            shard.position.y = 28;
            shard.rotation.y = seed * 0.65;
            group.add(frame, screen, shard);
        }

        const halo = new THREE.Mesh(new THREE.TorusGeometry(18, 0.45, 8, 28), glow.clone());
        halo.rotation.x = Math.PI / 2;
        halo.position.y = 3;
        group.add(halo);

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
        background.addColorStop(0, 'rgba(10, 16, 32, 0.15)');
        background.addColorStop(0.45, 'rgba(18, 25, 55, 0.75)');
        background.addColorStop(1, 'rgba(12, 18, 38, 0.18)');

        context.fillStyle = background;
        drawRoundedRect(24, 34, 976, 188, 30);
        context.fill();

        context.strokeStyle = `rgba(${((accent >> 16) & 255)}, ${((accent >> 8) & 255)}, ${accent & 255}, 0.9)`;
        context.lineWidth = 4;
        context.stroke();

        context.shadowBlur = 24;
        context.shadowColor = 'rgba(0, 0, 0, 0.6)';
        context.textAlign = 'center';
        context.fillStyle = '#f7fbff';
        context.font = '700 72px "JetBrains Mono", monospace';
        context.fillText(title, 512, 116);
        context.font = '500 32px "Space Mono", monospace';
        context.fillStyle = 'rgba(226, 235, 255, 0.84)';
        context.fillText(year, 512, 172);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
        sprite.position.copy(position).add(new THREE.Vector3(side * 24, 24, 0));
        sprite.scale.set(30, 7.5, 1);
        this.scene.add(sprite);
    }

    createFogOrb(progress, color, style) {
        const frame = this.getPathFrame(progress);
        const material = new THREE.SpriteMaterial({
            color,
            transparent: true,
            opacity: style === 'open' ? 0.05 : 0.08,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(frame.point).add(frame.side.clone().multiplyScalar(style === 'dense' ? 220 : 160));
        sprite.position.y += 68;
        sprite.scale.set(380, 250, 1);
        this.hazeSprites.push({ mesh: sprite, drift: this.randomRange(0.05, 0.15), phase: Math.random() * Math.PI * 2 });
        return sprite;
    }

    createAtmosphere() {
        const pointCount = 1600;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(pointCount * 3);
        const colors = new Float32Array(pointCount * 3);
        const palette = [new THREE.Color(0x66f2ff), new THREE.Color(0xff7ac6), new THREE.Color(0xb26dff), new THREE.Color(0xd7e1ff)];

        for (let index = 0; index < pointCount; index += 1) {
            const point = this.pathSamples[index % this.pathSamples.length] || {
                point: new THREE.Vector3(),
                side: new THREE.Vector3(1, 0, 0),
                tangent: new THREE.Vector3(0, 0, -1)
            };
            const spread = index % 4 === 0 ? 260 : 520;
            const offsetSide = (Math.random() - 0.5) * spread;
            const offsetUp = 12 + Math.random() * 220;
            const offsetForward = (Math.random() - 0.5) * 110;
            const position = point.point.clone()
                .add(point.side.clone().multiplyScalar(offsetSide))
                .add(point.tangent.clone().multiplyScalar(offsetForward));

            positions[index * 3] = position.x;
            positions[index * 3 + 1] = position.y + offsetUp;
            positions[index * 3 + 2] = position.z;

            const tint = this.pick(palette).clone();
            tint.lerp(new THREE.Color(0x10162c), Math.random() * 0.5);
            colors[index * 3] = tint.r;
            colors[index * 3 + 1] = tint.g;
            colors[index * 3 + 2] = tint.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.95,
            vertexColors: true,
            transparent: true,
            opacity: 0.34,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.dustParticles = new THREE.Points(geometry, material);
        this.scene.add(this.dustParticles);

        for (let index = 0; index < 10; index += 1) {
            const sprite = new THREE.Sprite(
                new THREE.SpriteMaterial({
                    color: this.pick([0x6ef3ff, 0xff84bf, 0xb26dff]),
                    transparent: true,
                    opacity: 0.04 + Math.random() * 0.03,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );
            sprite.position.set(this.randomRange(-400, 400), this.randomRange(20, 220), this.randomRange(-1800, 200));
            sprite.scale.set(this.randomRange(180, 420), this.randomRange(120, 300), 1);
            this.scene.add(sprite);
            this.hazeSprites.push({ mesh: sprite, drift: this.randomRange(0.03, 0.08), phase: Math.random() * Math.PI * 2 });
        }
    }

    createLights() {
        const hemisphere = new THREE.HemisphereLight(0xd9dfff, 0x1b1736, 1.45);
        this.scene.add(hemisphere);

        const warmSun = new THREE.DirectionalLight(0xffc08a, 2.5);
        warmSun.position.set(240, 280, 180);
        warmSun.castShadow = true;
        warmSun.shadow.camera.left = -720;
        warmSun.shadow.camera.right = 720;
        warmSun.shadow.camera.top = 720;
        warmSun.shadow.camera.bottom = -720;
        warmSun.shadow.camera.near = 1;
        warmSun.shadow.camera.far = 1400;
        warmSun.shadow.mapSize.width = 2048;
        warmSun.shadow.mapSize.height = 2048;
        this.scene.add(warmSun);

        const coolFill = new THREE.DirectionalLight(0x66f2ff, 1.1);
        coolFill.position.set(-260, 120, -160);
        this.scene.add(coolFill);

        const ambient = new THREE.AmbientLight(0x28345e, 0.62);
        this.scene.add(ambient);
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
        this.targetProgress = Math.max(this.targetProgress, 0.02);

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
        gsap.timeline({ defaults: { ease: 'power4.inOut' }, onComplete: () => {
            this.container.classList.remove('active');
            this.unlockPageScroll();
        } })
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
        const lateralDistance = compact ? -22 : -34;
        const verticalLift = compact ? 15 : 20;
        const forwardPush = compact ? 5 : 8;

        const cameraOffset = frame.side.clone().multiplyScalar(lateralDistance + Math.sin(elapsed * 0.55) * 3);
        cameraOffset.y += verticalLift + Math.sin(elapsed * 0.8) * (compact ? 1.1 : 1.8);
        cameraOffset.add(frame.tangent.clone().multiplyScalar(forwardPush));

        const targetPosition = frame.point.clone().add(cameraOffset);
        this.camera.position.lerp(targetPosition, 0.08);
        this.camera.lookAt(lookFrame.point.x, lookFrame.point.y + (compact ? 7 : 10), lookFrame.point.z);
        this.camera.rotation.z = Math.sin(elapsed * 0.35) * (compact ? 0.012 : 0.02);

        this.milestones.forEach((milestone) => {
            milestone.mesh.position.y = milestone.baseY + Math.sin(elapsed * 1.5 + milestone.phase) * 0.7;
            milestone.mesh.rotation.y += 0.0045;
        });

        if (this.dustParticles) {
            this.dustParticles.rotation.y += 0.00022;
        }

        this.hazeSprites.forEach((entry) => {
            if (!entry.mesh) {
                return;
            }

            entry.mesh.material.opacity = Math.max(0.02, entry.mesh.material.opacity + Math.sin(elapsed * entry.drift + entry.phase) * 0.0015);
            entry.mesh.position.y += Math.sin(elapsed * entry.drift + entry.phase) * 0.02;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

export default JourneyTimeline;
