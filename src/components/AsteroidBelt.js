import * as THREE from 'three';

export class AsteroidBelt {
    constructor(scene, count = 1500) {
        this.scene = scene;
        this.count = count;
        this.mesh = null;
        this.init();
    }

    init() {
        // Use Icosahedron for low-poly asteroids
        const geometry = new THREE.IcosahedronGeometry(0.5, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.8,
            metalness: 0.2
        });

        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        const dummy = new THREE.Object3D();
        const color = new THREE.Color();

        for (let i = 0; i < this.count; i++) {
            // Position between Mars (355) and Jupiter (600)
            // Let's say 400 - 550 range
            const r = 400 + Math.random() * 150;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 20; // Vertical spread

            dummy.position.set(
                r * Math.cos(theta),
                y,
                r * Math.sin(theta)
            );

            dummy.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            const scale = 0.5 + Math.random() * 2;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            this.mesh.setMatrixAt(i, dummy.matrix);

            // Color variation
            color.setHex(0x888888);
            color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
            this.mesh.setColorAt(i, color);
        }

        this.scene.add(this.mesh);
    }

    update() {
        if (this.mesh) {
            this.mesh.rotation.y += 0.0002;
        }
    }
}
