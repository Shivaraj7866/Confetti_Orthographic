import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";

class Confetti {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.width = width;
    this.height = height;

    this.confettiPapers = [];
    this.confettiCount = 100;
    this.frustumSize = frustumSize;

    this.time = 0;

    // Initialize confetti papers
    // for (let i = 0; i < this.confettiCount; i++) {
    //   this.confettiPapers.push(this.createConfetti());
    // }

    this.createConfetti()
  }

  // Confetti Creation and Animation methods
  createConfetti() {
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.copy(new THREE.PlaneGeometry(0.15, 0.15));
    const material = new THREE.MeshBasicMaterial({
      color: this.getRandomColor(),
      side: THREE.DoubleSide,
    });
    const confetti = new THREE.InstancedMesh(
      geometry,
      material,
      this.confettiCount
    );

    for (let i = 0; i < this.confettiCount; i++) {
      
      confetti.position.set(
        (Math.random() - 0.5) * this.aspect * this.frustumSize,
        this.frustumSize,
        0
      );
      confetti.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
  
      // This userData contains paper's rotation speed while falling along x, y, and z axis
      confetti.userData = {
        xSpeed: (Math.random() - 0.5) * this.frustumSize * this.aspect * 0.002,
        ySpeed: -(Math.random() * 0.005 * this.frustumSize),
        rotationSpeed: (Math.random() - 0.5) * this.frustumSize * 0.005,
      };

      this.confettiPapers.push(confetti)
  
      this.scene.add(confetti);
    }

  }

  animateConfetti(elapsedTime) {
    this.confettiPapers.forEach((paper, index) => {
      const scaleFactor = this.frustumSize * 0.1;

      // Change scale according to the frustumSize
      paper.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Papers falling from top to bottom
      paper.position.x += Math.sin(elapsedTime + index * 0.8) * 0.01 + paper.userData.xSpeed;
      paper.position.y += paper.userData.ySpeed;

      // Adding wind Effect to the papers
      paper.rotation.x += paper.userData.rotationSpeed;
      paper.rotation.y += 0.25;

      // If the paper reaches the bottom, it should start from the top again
      if (paper.position.y < -this.frustumSize * 0.5) {
        paper.position.y = this.frustumSize * 0.5;
        paper.position.x =
          (Math.random() - 0.5) * this.frustumSize * this.aspect;
      }
    });
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default Confetti;
