import * as THREE from 'three';

export class Planet {
    constructor(scene, data) {
        this.scene = scene;
        this.data = data;
        this.mesh = null;
        this.angle = Math.random() * Math.PI * 2; // Random start angle
        this.children = []; // Store moons
        this.init();
    }

    init() {
        // Create Mesh
        const geometry = new THREE.SphereGeometry(this.data.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.data.color),
            roughness: 0.7,
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.userData = { type: 'planet', data: this.data };

        // Apply Tilt if specified
        if (this.data.visual && this.data.visual.tilt) {
            this.mesh.rotation.z = THREE.MathUtils.degToRad(this.data.visual.tilt);
        }

        // Atmosphere
        if (this.data.visual && this.data.visual.atmosphere) {
            const atmosphereGeo = new THREE.SphereGeometry(this.data.radius * 1.05, 64, 64);
            const atmosphereMat = new THREE.MeshPhongMaterial({
                color: new THREE.Color(this.data.visual.atmosphereColor || 0x4facfe),
                transparent: true,
                opacity: this.data.visual.atmosphereOpacity || 0.2,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending
            });
            const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
            this.mesh.add(atmosphere);
        }

        // Initial Position
        this.updatePosition();

        this.scene.add(this.mesh);

        // Create Orbit Line
        const orbitCurve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            this.data.distance, this.data.distance,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );

        const points = orbitCurve.getPoints(128);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });

        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        orbitLine.rotation.x = Math.PI / 2;
        this.scene.add(orbitLine);

        // Rings (if applicable)
        if (this.data.visual && this.data.visual.rings) {
            const innerRadius = this.data.radius * (this.data.visual.ringInnerRadius || 1.4);
            const outerRadius = this.data.radius * (this.data.visual.ringOuterRadius || 2.2);
            const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
            const ringMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(this.data.visual.ringColor || 0xcccccc),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 2;
            ringMesh.rotation.y = Math.PI / 8; // Tilt
            this.mesh.add(ringMesh);
        }

        // Moons
        if (this.data.children) {
            this.data.children.forEach(moonData => {
                const moonGeo = new THREE.SphereGeometry(moonData.radius, 32, 32);
                const moonMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(moonData.color),
                    roughness: 0.8
                });
                const moonMesh = new THREE.Mesh(moonGeo, moonMat);

                // Create a pivot for the moon to orbit around the planet
                const pivot = new THREE.Object3D();
                pivot.rotation.y = Math.random() * Math.PI * 2;
                this.mesh.add(pivot);

                moonMesh.position.set(moonData.distance, 0, 0);
                pivot.add(moonMesh);

                this.children.push({ mesh: pivot, speed: moonData.orbitSpeed });
            });
        }
    }

    updatePosition() {
        this.mesh.position.x = Math.cos(this.angle) * this.data.distance;
        this.mesh.position.z = Math.sin(this.angle) * this.data.distance;
    }

    update() {
        // Orbit around Sun
        // Scale speed down for visualization
        const orbitSpeed = this.data.orbitalPeriod > 0 ? (1 / this.data.orbitalPeriod) * 5 : 0;
        this.angle += orbitSpeed;
        this.updatePosition();

        // Rotation on axis
        this.mesh.rotation.y += this.data.rotationSpeed;

        // Update Moons
        this.children.forEach(moon => {
            moon.mesh.rotation.y += moon.speed;
        });
    }
}
