import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 500;
    
    this.targetPosition = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    this.isTransitioning = false;
    this.transitionSpeed = 0.02;
    
    // Initial state
    this.defaultPosition = new THREE.Vector3(0, 40, 80);
    this.defaultLookAt = new THREE.Vector3(0, 0, 0);
  }

  update() {
    if (this.isTransitioning) {
      this.camera.position.lerp(this.targetPosition, this.transitionSpeed);
      this.controls.target.lerp(this.targetLookAt, this.transitionSpeed);
      
      if (this.camera.position.distanceTo(this.targetPosition) < 0.1) {
        this.isTransitioning = false;
        this.controls.enabled = true;
      }
    }
    this.controls.update();
  }

  focusOn(object, offset = { x: 10, y: 5, z: 10 }) {
    this.isTransitioning = true;
    // this.controls.enabled = false; // Optional: disable controls during transition
    
    // Calculate target position based on object size and offset
    const objectPos = new THREE.Vector3();
    object.getWorldPosition(objectPos);
    
    this.targetLookAt.copy(objectPos);
    
    // Determine a good viewing distance based on object radius if available
    let distance = 20;
    if (object.geometry && object.geometry.parameters.radius) {
      distance = object.geometry.parameters.radius * 4;
    }
    
    this.targetPosition.copy(objectPos).add(new THREE.Vector3(distance, distance * 0.5, distance));
  }

  reset() {
    this.isTransitioning = true;
    this.targetPosition.copy(this.defaultPosition);
    this.targetLookAt.copy(this.defaultLookAt);
  }
}
