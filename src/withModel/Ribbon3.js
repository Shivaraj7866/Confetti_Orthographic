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
    this.createConfetti();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.scene.add(dLight, ambientLight);
  }

  createRibbon() {
    for (let i = 0; i < this.ribbonCount; i++) {
      const model = this.model.scene.clone();//clone the model

      // Optimized position and scale setting
      const positionX = (Math.random() - 0.5) * this.frustumSize * this.aspect;
      const positionY = this.frustumSize * 0.7;
      model.position.set(positionX, positionY, 0);
      model.scale.setScalar(this.frustumSize * 0.01);
      console.log(model.children[0].children[0].material.color)
      model.children[0].children[0].material.color.r = Math.random()
      model.children[0].children[0].material.color.g = Math.random()
      model.children[0].children[0].material.color.b = Math.random()

      model.children[0].children[1].material.color.copy(model.children[0].children[0].material.color)
      

      this.scene.add(model);

      if (this.model.animations?.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(this.model.animations[0]);
        action.play();
        this.ribbons[i] = { mixer };
      }

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
          model.position.y = this.frustumSize * 0.5;
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
    const geometry = new THREE.PlaneGeometry(0.15, 0.15);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < this.confettiCount; i++) {
      const confetti = new THREE.Mesh(geometry, material.clone());
      confetti.material.color.set(this.getRandomColor());

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

      confetti.userData = {
        xSpeed: (Math.random() - 0.5) * this.frustumSize * this.aspect * 0.002,
        ySpeed: -(Math.random() * 0.005 * this.frustumSize),
        rotationSpeed: (Math.random() - 0.5) * this.frustumSize * 0.005,
      };

      this.scene.add(confetti);
      this.confettiPapers[i] = confetti;
    }
  }

  animateConfetti(elapsedTime) {
    const scaleFactor = this.frustumSize * 0.1;

    this.confettiPapers.forEach((paper, index) => {
      paper.scale.setScalar(scaleFactor);

      paper.position.x += Math.sin(elapsedTime + index * 0.8) * 0.01 + paper.userData.xSpeed;
      paper.position.y += paper.userData.ySpeed;

      paper.rotation.x += paper.userData.rotationSpeed;
      paper.rotation.y += 0.25;

      if (paper.position.y < -this.frustumSize * 0.5) {
        paper.position.y = this.frustumSize * 0.5;
        paper.position.x = (Math.random() - 0.5) * this.frustumSize * this.aspect;
      }
    });
  }
}

export default Ribbon1;
