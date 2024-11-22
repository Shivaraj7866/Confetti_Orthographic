import * as THREE from "three";

class Confetti {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.frustumSize = frustumSize;

    this.confettiCount = 150;
    this.ribbonRotation = 150
    this.confettiPapers = [this.createConfetti()];
  }

  createConfetti() {
    const geometry = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(0.15, 0.15));
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const confetti = new THREE.InstancedMesh(
      geometry,
      material,
      this.confettiCount
    );

    for (let i = 0; i < this.confettiCount; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * this.aspect * this.frustumSize,
        this.frustumSize / 2,
        0
      );
      const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      const randomColor = new THREE.Color(this.getRandomColor());

      confetti.setMatrixAt(
        i,
        new THREE.Matrix4().compose(
          position,
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1)
        )
      );
      confetti.setColorAt(i, randomColor);
      confetti.userData[i] = this.getRandomSpeed();
    }

    this.scene.add(confetti);
    return confetti;
  }

  updateSize(frustumSize, aspect) {
    this.frustumSize = frustumSize;
    this.aspect = aspect;

    // Reposition confetti within new frustum size and aspect ratio
    this.confettiPapers.forEach((confetti) => {
      for (let i = 0; i < this.confettiCount; i++) {
        const position = new THREE.Vector3(
          (Math.random() - 0.5) * this.aspect * this.frustumSize,
          this.frustumSize / 2,
          0
        );

        const matrix = new THREE.Matrix4();
        confetti.getMatrixAt(i, matrix);
        matrix.compose(
          position,
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1)
        );
        confetti.setMatrixAt(i, matrix);
      }
      confetti.instanceMatrix.needsUpdate = true;
    });
  }

  getRandomSpeed() {
    return {
      xSpeed: (Math.random() - 0.5) * this.frustumSize * this.aspect * 0.002,
      ySpeed: -(Math.random() * 0.005 * this.frustumSize),
      rotationSpeed: (Math.random() - 0.5) * this.frustumSize * 0.005,
    };
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200, 0x0000ff, 0xffff00];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animateConfetti(elapsedTime) {
    this.confettiPapers.forEach((confetti) => {
      for (let i = 0; i < this.confettiCount; i++) {
        const { xSpeed, ySpeed, rotationSpeed } = confetti.userData[i];
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        confetti.getMatrixAt(i, matrix);
        matrix.decompose(position, quaternion, scale);

        position.x += xSpeed;
        position.y += ySpeed;

        // Check if confetti goes beyond the screen boundaries (horizontal or vertical)
        if (
          position.y < -this.frustumSize * 0.5 ||
          position.x < -this.frustumSize * 0.5 * this.aspect ||
          position.x > this.frustumSize * 0.5 * this.aspect
        ) {
          // Reset to a random x position and top of the screen
          position.set(
            (Math.random() - 0.5) * this.frustumSize * this.aspect,
            this.frustumSize * 0.5,
            0
          );
        }

        const rippleRotation = this.getRippleRotation(
          elapsedTime,
          i,
          rotationSpeed
        );
        matrix.compose(
          position,
          rippleRotation,
          new THREE.Vector3(
            this.frustumSize * 0.12,
            this.frustumSize * 0.12,
            this.frustumSize * 0.12
          )
        );

        confetti.setMatrixAt(i, matrix);
        confetti.instanceMatrix.needsUpdate = true;
      }
    });
  }

  getRippleRotation(elapsedTime, i, rotationSpeed) {
    const rippleX = Math.sin(elapsedTime * 3 + i * 0.5) * 0.1;
    const rippleY = Math.cos(elapsedTime * 2 + i * 0.8) * 0.1;
    const rippleZ = Math.cos(elapsedTime * 1.5 + i * 0.3) * 0.5;

    return new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        rotationSpeed + rippleX * this.ribbonRotation,
        rotationSpeed + rippleY * this.ribbonRotation,
        rippleZ
      )
    );
  }

  dispose() {
    this.confettiPapers.forEach((confetti) => {
      this.scene.remove(confetti);
      confetti.geometry.dispose();
      confetti.material.dispose();
    });
    this.confettiPapers = [];
  }
}

export default Confetti;