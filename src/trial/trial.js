import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Flow,
  InstancedFlow,
} from "three/examples/jsm/modifiers/CurveModifier.js";
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
    this.ribbonCount = 25;
    this.texture=null;
    this.flow = null;
    this.zigzagCurve1 = null;
    this.clock = new THREE.Clock();
    this.isAnimating = true;
  }

  init(t) {
  
    this.texture = t[0]
    this.setupStats();
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.setupLighting();
    this.setupOverlay();

    // this.textureLoader.load("/Images/Ri_C1.png", (texture) => {
      for (let i = 0; i < this.ribbonCount; i++) this.createRibbon(); // Add zigzag planes
    // });

    for (let i = 0; i < this.confettiCount; i++) this.createConfetti(); // Create confetti particles

    this.animate();
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
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -200,
      window.innerWidth / 200,
      window.innerHeight / 200,
      window.innerHeight / -200,
      0.1,
      8.5
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
        memoryInfo.usedJSHeapSize /
        (1024 * 1024)
      ).toFixed(2)} MB / ${(memoryInfo.totalJSHeapSize / (1024 * 1024)).toFixed(
      2
    )} MB
    `;
  }

  createRibbon() {
    const planeGeometry = new THREE.PlaneGeometry(0.1, 2, 100, 100);
    planeGeometry.rotateZ(Math.PI / 2);
    planeGeometry.rotateX(Math.PI / 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    let points = this.generateCurvePoints();
    this.zigzagCurve1 = new THREE.CatmullRomCurve3(points);
    this.zigzagCurve1.curveType = "centripetal";
    this.zigzagCurve1.tension = 0.7;
    this.zigzagCurve1.closed = true;

    const instanceCount = 1;
    this.flow = new InstancedFlow(
      instanceCount,
      1,
      planeGeometry,
      planeMaterial
    );
    this.flow.object3D.position.x = (Math.random() - 0.5) * 20;
    this.scene.add(this.flow.object3D);
    this.ribbons.push(this.flow);

    this.flow.updateCurve(0, this.zigzagCurve1);
    this.flow.setCurve(0, 0);
    this.flow.moveIndividualAlongCurve(0, Math.random());
    this.flow.object3D.setColorAt(
      0,
      new THREE.Color(0xffffff * Math.random() * 2)
    );
    this.flow.curveArray[0].needsUpdate = true;
  }

  generateCurvePoints() {
    return [
      new THREE.Vector3(Math.random() * 1 - 0.2, 8, -3),
      new THREE.Vector3(Math.random() * 1 - 0.2, 7, -2),
      new THREE.Vector3(Math.random() * 1 - 0.2, 6.5, -1.8),
      new THREE.Vector3(Math.random() * 1 - 0.2, 6, -1.2),
      new THREE.Vector3(Math.random() * 1 - 0.2, 5.5, -0.8),
      new THREE.Vector3(Math.random() * 1 - 0.2, 3, -1),
      new THREE.Vector3(Math.random() * 1 - 0.2, 2.5, -1.2),
      new THREE.Vector3(Math.random() * 1 - 0.2, 2, 0.5),
      new THREE.Vector3(Math.random() * 1 - 0.2, 1, 0.7),
      new THREE.Vector3(Math.random() * 1 - 0.2, 1, 0.5),
      new THREE.Vector3(Math.random() * 1 - 0.2, 0.5, 0.7),
      new THREE.Vector3(Math.random() * 1 - 0.2, 0, -0.25),
      // Additional points here...
      new THREE.Vector3(Math.random() * 1 - 0.2, -0.5, -0.5),
      new THREE.Vector3(Math.random() * 1 - 0.2, -1, 0.5),
      new THREE.Vector3(Math.random() * 1 - 0.2, -2.5, -0.5),
      new THREE.Vector3(Math.random() * 1 - 0.2, -4.5, 0.5),
      new THREE.Vector3(Math.random() * 1 - 0.2, -6.5, -1),
      new THREE.Vector3(Math.random() * 1 - 0.2, -6.5, 1),
      new THREE.Vector3(Math.random() * 1 - 0.2, -7, -5),
    ];
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
    this.controls.update();

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
      //add wind effect for confetti papers
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

  handleResize() {
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.left = window.innerWidth / -200;
      this.camera.right = window.innerWidth / 200;
      this.camera.top = window.innerHeight / 200;
      this.camera.bottom = window.innerHeight / -200;
      this.camera.updateProjectionMatrix();
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
