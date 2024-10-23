import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";
import gsap from "gsap";

class Ribbon {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.width = width;
    this.height = height;

    this.confettiPapers = null; // Change to instanced
    this.ribbons = [];
    this.confettiCount = 100;
    this.frustumSize = frustumSize;
    this.originalFrustumSize = frustumSize;
    this.originalScaleFactor = frustumSize * 0.04;
    this.ribbonSpeed = 0.0005;
    this.ribbonCount = 15;
    this.mixer = null;

    this.setupLighting();
    this.createConfetti();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.scene.add(dLight, ambientLight);
  }

  createRibbon(gltf) {
    let model = gltf.scene;
    model.position.set(0, this.frustumSize / 2, 0);
    model.scale.set(200, 200, 200);
    this.scene.add(model);

    if (gltf.animations && gltf.animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(model);
      let action = this.mixer.clipAction(gltf.animations[0]);
      action.play();
    }
  }

  updateMixer(delta) {
    if (this.mixer) this.mixer.update(delta);
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Optimized Confetti creation using InstancedMesh
  createConfetti() {
    const geometry = new THREE.PlaneGeometry(0.15, 0.15);
    const material = new THREE.MeshBasicMaterial({
      color: this.getRandomColor(),
      side: THREE.DoubleSide,
    });

    // Instanced Mesh for confetti
    const instancedConfetti = new THREE.InstancedMesh(geometry, material, this.confettiCount);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < this.confettiCount; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * this.aspect * this.frustumSize,
        this.frustumSize,
        0
      );
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      dummy.scale.set(this.frustumSize * 0.1, this.frustumSize * 0.1, this.frustumSize * 0.1);
      dummy.updateMatrix();
      instancedConfetti.setMatrixAt(i, dummy.matrix);

      // Store userData for individual confetti
      instancedConfetti.userData = {
        xSpeed: (Math.random() - 0.5) * this.frustumSize * this.aspect * 0.002,
        ySpeed: -(Math.random() * 0.005 * this.frustumSize),
        rotationSpeed: (Math.random() - 0.5) * this.frustumSize * 0.005,
      };
    }

    this.scene.add(instancedConfetti);
    this.confettiPapers = instancedConfetti;
  }

  // Optimized confetti animation using InstancedMesh
  animateConfetti(elapsedTime) {
    const dummy = new THREE.Object3D();

    for (let i = 0; i < this.confettiCount; i++) {
      const userData = this.confettiPapers.userData;

      // Update position and rotation
      dummy.position.set(
        Math.sin(elapsedTime + i * 0.8) * 0.01 + userData.xSpeed,
        userData.ySpeed,
        0
      );

      dummy.rotation.x += userData.rotationSpeed;
      dummy.rotation.y += 0.25;

      if (dummy.position.y < -this.frustumSize * 0.5) {
        dummy.position.y = this.frustumSize * 0.5;
        dummy.position.x = (Math.random() - 0.5) * this.aspect * this.frustumSize;
      }

      dummy.updateMatrix();
      this.confettiPapers.setMatrixAt(i, dummy.matrix);
    }

    this.confettiPapers.instanceMatrix.needsUpdate = true;
  }

  // Dispose of confetti
  disposeConfetti() {
    if (this.confettiPapers) {
      this.scene.remove(this.confettiPapers);
      this.confettiPapers.geometry.dispose();
      this.confettiPapers.material.dispose();
    }
  }

  updateFrustumSize(width, height) {
    this.aspect = width / height;
    this.frustumSize = this.originalFrustumSize * (height / this.height);
    this.confettiPapers.scale.set(this.frustumSize * 0.1, this.frustumSize * 0.1, this.frustumSize * 0.1);
  }
}

export default Ribbon;
