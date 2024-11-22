import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";

class Ribbon {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.width = width;
    this.height = height;

    this.confettiPapers = [];
    this.ribbons = [];
    this.confettiCount = 100;  // Number of confetti papers
    this.frustumSize = frustumSize;
    this.originalFrustumSize = frustumSize;
    this.ribbonSpeed = 0.0005;
    this.ribbonCount = 15;

    this.setupLighting();
    this.createConfetti();  // Call confetti creation once for optimized draw calls
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.scene.add(dLight, ambientLight);
  }

  // Ribbon Creations (unchanged for now) -----------------------------------------------

  createRibbon() {
    const planeGeometry = new THREE.PlaneGeometry(0.08, 1, 100, 100);
    planeGeometry.rotateZ(Math.PI / 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    let points = this.generateCurvePoints();
    const zigzagCurve1 = new THREE.CatmullRomCurve3(points);
    zigzagCurve1.curveType = "centripetal";
    zigzagCurve1.tension = 0.7;
    zigzagCurve1.closed = true;

    const instanceCount = 1;
    let flow = new InstancedFlow(instanceCount, 1, planeGeometry, planeMaterial);
    flow.object3D.position.x = (Math.random() - 0.5) * this.frustumSize * this.aspect;
    flow.object3D.scale.set(this.frustumSize * 0.1, this.frustumSize * 0.1, this.frustumSize * 0.1);

    this.scene.add(flow.object3D);
    flow.updateCurve(0, zigzagCurve1);
    flow.moveIndividualAlongCurve(0, Math.random());

    return flow;
  }

  generateCurvePoints() {
    let points = [];
    const baseFrustumSize = this.originalFrustumSize;
    const waveAmplitude = baseFrustumSize * 0.01;
    const waveFrequency = baseFrustumSize * 0.18;
    const topScreen = this.width / 2;
    const bottomScreen = -this.width / 2;
    const totalPoints = 25;

    let yIncrement = (topScreen - bottomScreen) / (totalPoints - 1);

    for (let i = 0; i < totalPoints; i++) {
      let xVariation = Math.sin((i / totalPoints) * waveFrequency) * waveAmplitude;
      let y = (topScreen - i * yIncrement) * 0.03;
      let z = 0;

      if (i === 0 || i === totalPoints - 1) {
        z = -100;
      }

      points.push(new THREE.Vector3(xVariation, y, z));
    }

    return points;
  }

  // Confetti Papers Optimization -----------------------------------------------

  createConfetti() {
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.copy(new THREE.PlaneGeometry(0.15, 0.15));

    const material = new THREE.MeshBasicMaterial({
      color: this.getRandomColor(),
      side: THREE.DoubleSide,
    });

    const confetti = new THREE.InstancedMesh(geometry, material, this.confettiCount);

    for (let i = 0; i < this.confettiCount; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * this.aspect * this.frustumSize,
        this.frustumSize,
        0
      );
      confetti.setMatrixAt(i, new THREE.Matrix4().makeTranslation(position.x, position.y, position.z));
      
      // Store each paper's rotation speed and velocity
      confetti.userData[i] = {
        xSpeed: (Math.random() - 0.5) * this.frustumSize * this.aspect * 0.002,
        ySpeed: -(Math.random() * 0.005 * this.frustumSize),
        rotationSpeed: (Math.random() - 0.5) * this.frustumSize * 0.005,
      };
    }

    this.scene.add(confetti);
    this.confettiPapers.push(confetti);
  }

  // Confetti Animation Optimization -----------------------------------------------
  animateConfetti(elapsedTime) {
    this.confettiPapers.forEach((confetti) => {
      const scaleFactor = this.frustumSize * 0.1;

      for (let i = 0; i < this.confettiCount; i++) {
        let { xSpeed, ySpeed, rotationSpeed } = confetti.userData[i];

        // Update position and apply movement
        let position = new THREE.Vector3();
        confetti.getMatrixAt(i, position);
        position.x += Math.sin(elapsedTime + i * 0.8) * 0.01 + xSpeed;
        position.y += 0.25;

        // Reset confetti position if it goes out of bounds
        if (position.y < -this.frustumSize * 0.5) {
          position.y = this.frustumSize * 0.5;
          position.x = (Math.random() - 0.5) * this.frustumSize * this.aspect;
        }

        confetti.setMatrixAt(i, new THREE.Matrix4().makeTranslation(position.x, position.y, position.z));

        // Add rotation animation for a more dynamic effect
        confetti.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          rotationSpeed
        );
      }

      confetti.instanceMatrix.needsUpdate = true; // Flag for updating instance matrix
    });
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default Ribbon;
