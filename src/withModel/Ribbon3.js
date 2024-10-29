import * as THREE from "three";
import gsap from "gsap";

class Ribbon1 {
  constructor(scene, frustumSize, width, height, model) {
    this.scene = scene;
    this.model = model;
    this.aspect = width / height;
    this.width = width;
    this.height = height;
    this.frustumSize = frustumSize;
    this.originalFrustumSize = frustumSize;
    this.originalScaleFactor = frustumSize * 0.04;
    this.ribbonSpeed = 0.0005;
    this.ribbonCount = 10;
    this.confettiCount = 100;

    this.mixer = null;

    this.confettiPapers = new Array(this.confettiCount);
    this.ribbons = new Array(this.ribbonCount);

    this.setupLighting();
    this.createRibbon();
    this.confettiPapers = [this.createConfetti()];
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.scene.add(dLight, ambientLight);
  }

  createRibbon() {
    for (let i = 0; i < this.ribbonCount; i++) {
      const model = this.model.scene.clone(); // Clone the model

      // Optimized position and scale setting
      const positionX = (Math.random() - 0.5) * this.frustumSize * this.aspect;
      const positionY = this.frustumSize * 0.7;
      model.position.set(positionX, positionY, 0);
      model.scale.setScalar(this.frustumSize * 0.01);

      // Generate a random color
      const randomColor = new THREE.Color(Math.random() * 0xffffff);

      // Traverse the model to change the material color on both sides
      model.traverse((child) => {
        if (child.isMesh) {
          // Clone the material to avoid affecting the original model's material
          child.material = child.material.clone();

          // Apply the same random color on both sides
          child.material.color.set(randomColor);
          child.material.side = THREE.DoubleSide; // Set the material to render both sides
        }
      });

      console.log(model);

      // Add the model to the scene
      this.scene.add(model);

      // Play animation if it has any
      if (this.model.animations?.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(this.model.animations[0]);
        action.play();
        this.ribbons[i] = { mixer };
      }

      // Animate the model down
      this.animateModelDown(model);
    }
  }


  animateModelDown(model) {
    const animateDown = () => {
      gsap.to(model.position, {
        y: -this.frustumSize * 0.5,
        duration: Math.floor(Math.random() * 5) + 4,
        ease: "power1.inOut",
        onComplete: () => {
          model.position.y = this.frustumSize * 0.5 + this.frustumSize * 0.2;
          animateDown();
        },
      });
    };
    model.position.y = Math.random() * this.frustumSize;
    animateDown();
  }

  updateMixer(delta) {
    this.ribbons.forEach((ribbon) => {
      if (ribbon?.mixer) ribbon.mixer.update(delta);
    });
  }

  updateFrustumSize(newFrustumSize) {
    this.frustumSize = newFrustumSize;
    this.updateRibbonCurves();
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createConfetti() {
    const geometry = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(0.15, 0.15));
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const confetti = new THREE.InstancedMesh(geometry, material, this.confettiCount);

    for (let i = 0; i < this.confettiCount; i++) {
      const position = new THREE.Vector3((Math.random() - 0.5) * this.aspect * this.frustumSize, this.frustumSize / 2, 0);
      const rotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const randomColor = new THREE.Color(this.getRandomColor());

      confetti.setMatrixAt(i, new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), new THREE.Vector3(1, 1, 1)));
      confetti.setColorAt(i, randomColor);
      confetti.userData[i] = this.getRandomSpeed();
    }

    this.scene.add(confetti);
    return confetti;
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

        if (position.y < -this.frustumSize * 0.5) {
          position.set((Math.random() - 0.5) * this.frustumSize * this.aspect, this.frustumSize * 0.5, 0);
        }

        const rippleRotation = this.getRippleRotation(elapsedTime, i, rotationSpeed);
        matrix.compose(position, rippleRotation, new THREE.Vector3(this.frustumSize * 0.12, this.frustumSize * 0.12, this.frustumSize * 0.12));

        confetti.setMatrixAt(i, matrix);
        confetti.instanceMatrix.needsUpdate = true;
      }
    });
  }

  getRippleRotation(elapsedTime, i, rotationSpeed) {
    const rippleX = Math.sin(elapsedTime * 3 + i * 0.5) * 0.1;
    const rippleY = Math.cos(elapsedTime * 2 + i * 0.8) * 0.1;
    const rippleZ = Math.cos(elapsedTime * 1.5 + i * 0.3) * 0.5;

    return new THREE.Quaternion().setFromEuler(new THREE.Euler(rotationSpeed + rippleX * 300, rotationSpeed + rippleY * 300, rippleZ));
  }

}

export default Ribbon1;
