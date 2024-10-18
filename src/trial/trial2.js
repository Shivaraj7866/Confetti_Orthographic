import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

class ConfettiScene {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.stats = null;
    this.controls = null;
    this.overlay = null;
    this.confettiPapers = [];
    this.ribbons = [];
    this.confettiCount = 100;
    this.ribbonSpeed = 0.0005;
    this.ribbonCount = 15;
    this.texture = null;
    this.clock = new THREE.Clock();
    this.isAnimating = true;
  }

  init(t) {
    this.texture = t[0];
    this.setupStats();
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.setupLighting();
    this.setupOverlay();

    for (let i = 0; i < this.ribbonCount; i++) this.createRibbon(); // Add zigzag planes
    for (let i = 0; i < this.confettiCount; i++) this.createConfetti(); // Create confetti particles

    this.animate();
  }

  calculateFrustumSize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 100; // Adjust this base value as needed
    const frustumWidth = frustumSize * aspect;

    return { frustumWidth, frustumSize };
  }

  setupStats() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
  }

  setupScene() {
    this.scene = new THREE.Scene();
  }

  setupCamera() {
    const { frustumWidth, frustumSize } = this.calculateFrustumSize();

    this.camera = new THREE.OrthographicCamera(
      frustumWidth / -2,
      frustumWidth / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      10
    );
    this.camera.position.set(0, 0, 5);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.scene.add(dLight, ambientLight);
  }

  setupOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.style.position = "absolute";
    this.overlay.style.top = "0";
    this.overlay.style.left = "100px";
    this.overlay.style.padding = "10px";
    this.overlay.style.color = "white";
    this.overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    document.body.appendChild(this.overlay);
  }

  updateOverlay() {
    const memoryInfo = performance.memory || {
      totalJSHeapSize: 0,
      usedJSHeapSize: 0,
    };
    this.overlay.innerHTML = `
      <strong>Draw Calls:</strong> ${this.renderer.info.render.calls}<br>
      <strong>Frame:</strong> ${this.renderer.info.render.frame}<br>
      <strong>Textures:</strong> ${this.renderer.info.memory.textures}<br>
      <strong>Geometries:</strong> ${this.renderer.info.memory.geometries}<br>
      <strong>Memory Usage:</strong> ${(
        memoryInfo.usedJSHeapSize / (1024 * 1024)
      ).toFixed(2)} MB / ${(memoryInfo.totalJSHeapSize / (1024 * 1024)).toFixed(
        2
      )} MB
    `;
  }

  createRibbon() {
    const planeGeometry = new THREE.PlaneGeometry(0.1, 2, 100, 100);
    planeGeometry.rotateZ(Math.PI / 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    let points = this.generateCurvePoints();
    let zigzagCurve1 = new THREE.CatmullRomCurve3(points);
    zigzagCurve1.curveType = "centripetal";
    zigzagCurve1.tension = 0.7;
    zigzagCurve1.closed = true;

    const instanceCount = 1;
    let flow = new InstancedFlow(
      instanceCount,
      1,
      planeGeometry,
      planeMaterial
    );
    flow.object3D.position.x = (Math.random() - 0.5) * 20;
    this.scene.add(flow.object3D);
    this.ribbons.push(flow);

    flow.updateCurve(0, zigzagCurve1);
    flow.setCurve(0, 0);
    flow.moveIndividualAlongCurve(0, Math.random());
    flow.object3D.setColorAt(
      0,
      new THREE.Color(0xffffff * Math.random() * 2)
    );
    flow.curveArray[0].needsUpdate = true;
  }

  generateCurvePoints() {
    let range = [-0.2, 0.3];
    let points = [];
    let waveAmplitude = 0.9; // Adjust amplitude for more rippleness
    let waveFrequency = 2.5; // Adjust frequency for more ripples

    for (let i = 8; i >= -7; i -= 0.5) {
      let xVariation = range[Math.floor(Math.random() * 2)];
      let y = i;
      let z = Math.sin(i * waveFrequency) * waveAmplitude;
      if (i == 8 || i == -7) {
        points.push(new THREE.Vector3(xVariation, i === 8 ? 8 : -7, -3));
      } else {
        points.push(new THREE.Vector3(xVariation, y, z));
      }
    }

    return points;
  }

  createConfetti() {
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.copy(new THREE.PlaneGeometry(0.1, 0.1));
    const material = new THREE.MeshBasicMaterial({
      color: this.getRandomColor(),
      side: THREE.DoubleSide,
    });
    const confetti = new THREE.InstancedMesh(
      geometry,
      material,
      this.confettiCount
    );

    confetti.position.set((Math.random() - 0.5) * 25, 5, -1.5);
    confetti.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    confetti.userData = {
      xSpeed: (Math.random() - 0.5) * 0.04,
      ySpeed: -(Math.random() * 0.03 + 0.01),
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    };

    this.scene.add(confetti);
    this.confettiPapers.push(confetti);
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animate() {
    this.stats.begin();
    this.updateOverlay();

    requestAnimationFrame(() => this.animate());

    let elapsedTime = this.clock.getElapsedTime();

    if (this.isAnimating) {
      this.animateConfetti(elapsedTime);
      this.animateRibbons();
    }

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }

  animateConfetti(elapsedTime) {
    this.confettiPapers.forEach((paper, index) => {
      paper.position.x +=
        Math.sin(elapsedTime + index * 0.8) * 0.01 + paper.userData.xSpeed;
      paper.position.y += paper.userData.ySpeed;
      paper.rotation.x += paper.userData.rotationSpeed;
      paper.rotation.y += 0.25;

      if (paper.position.y < -5) {
        paper.position.y = 5;
        paper.position.x = (Math.random() - 0.5) * 20;
      }
    });
  }

  animateRibbons() {
    this.ribbons.forEach((flow) => {
      if (flow) flow.moveAlongCurve(this.ribbonSpeed);
    });
  }

  adjustObjectSizes(frustumWidth, frustumSize) {
    this.ribbons.forEach((ribbon) => {
      ribbon.object3D.scale.set(frustumWidth * 0.05, frustumSize * 0.05, 1);
    });

    this.confettiPapers.forEach((confetti) => {
      confetti.scale.set(frustumWidth * 0.01, frustumSize * 0.01, 1);
    });
  }

  handleResize() {
    window.addEventListener("resize", () => {
      const { frustumWidth, frustumSize } = this.calculateFrustumSize();

      this.camera.left = frustumWidth / -2;
      this.camera.right = frustumWidth / 2;
      this.camera.top = frustumSize / 2;
      this.camera.bottom = frustumSize / -2;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.adjustObjectSizes(frustumWidth, frustumSize);
    });
  }
}

const ribbonArray = [
  {
    name: "ribbon",
    path: "Images/Ri_C1.png",
  },
];

async function loadTextures(imagArray) {
  let textureLoader = new THREE.TextureLoader();
  const promise = imagArray.map((texture) => {
    console.log(texture);
    return new Promise((resolve, reject) => {
      textureLoader.load(texture.path, resolve, undefined, reject);
    });
  });

  return Promise.all(promise);
}
 loadTextures(ribbonArray)
  .then((t) => {
    // Initialize the scene after textures loaded
    const confettiScene = new ConfettiScene();
    confettiScene.init(t);
    confettiScene.handleResize();
  })
  .catch((e) => console.log(e));

// export default ConfettiScene;
