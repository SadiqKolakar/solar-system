import * as THREE from 'three';

export class Sun {
    constructor(scene, data) {
        this.scene = scene;
        this.data = data;
        this.mesh = null;
        this.light = null;
        this.init();
    }

    init() {
        const geometry = new THREE.SphereGeometry(this.data.radius, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(this.data.color),
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.userData = { type: 'sun', data: this.data };
        this.scene.add(this.mesh);

        // Add Light
        this.light = new THREE.PointLight(0xffffff, 1.5, 5000);
        this.light.decay = 2;
        this.scene.add(this.light);

        // Add Ambient Light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Add Glow
        const glowGeo = new THREE.SphereGeometry(this.data.radius * 1.2, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: this.data.color,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        this.mesh.add(glowMesh);
    }

    update() {
        if (this.mesh) {
            this.mesh.rotation.y += this.data.rotationSpeed;
        }
    }
}
