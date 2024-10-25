import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";
import InstancedFlowHelper from "./InstancedFlowHelper";

class Ribbon {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.width = width;
    this.height = height;
    this.ribbons = [];

    this.frustumSize = frustumSize;
    this.originalFrustumSize = frustumSize;
    this.originalScaleFactor = frustumSize * 0.04;
    this.ribbonSpeed = 0.0006; // Increased speed to make sure it is noticeable
    this.ribbonCount = 1;

    this.flow = null;
    this.ribbonCount = 25;

    this.createRandomBoxes();
    let testBoxes = this.testBox()
  }

  testBox(){
    const geo =new THREE.BoxGeometry(this.frustumSize * 0.04,this.frustumSize * 0.04,this.frustumSize * 0.04)
    const mat = new THREE.MeshBasicMaterial({color:0xff0000})
    const box = new THREE.Mesh(geo,mat)
    this.scene.add(box)

    return box ;
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200, 0x0000ff, 0xffff00];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createRandomBoxes() {
    // Create plane geometry for ribbons
    let planeGeometry = new THREE.PlaneGeometry(
      this.frustumSize * 0.015,
      this.frustumSize * 0.2,
      100,
      100
    );
    planeGeometry.rotateZ(Math.PI / 2);

    let planeMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    // Generate curve points
    const points = this.generateStaticPoints().map((pnts) => {
      const zigzagCurve = new THREE.CatmullRomCurve3(pnts);
      zigzagCurve.curveType = "centripetal";
      zigzagCurve.tension = 0.7;
      zigzagCurve.closed = true;

      // Visualize the curve with a red line to ensure it's correct
      const curvePoints = zigzagCurve.getPoints(50);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        curvePoints
      );
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const curveLine = new THREE.Line(lineGeometry, lineMaterial);
      this.scene.add(curveLine);

      return zigzagCurve;
    });

    this.flow = new InstancedFlow(
      this.ribbonCount,
      points.length,
      planeGeometry,
      planeMaterial
    );
    console.log(this.flow);

    // // Visualize each curve's bounding box
    // points.forEach((curve, i) => {
    //   // Get bounding box for the curve
    //   const boundingBox = new THREE.Box3().setFromPoints(curve.getPoints(50));

    //   // Create helper for the bounding box
    //   const boxHelper = new THREE.Box3Helper(boundingBox, 0x00ff00);
    //   this.scene.add(boxHelper);
    // });

    // InstancedFlow helper visualization
    const flowHelper = new InstancedFlowHelper(this.flow); // Replace with your actual helper
    flowHelper.visible = true; // Ensure the helper is visible
    this.scene.add(flowHelper);

    // Update curves for each instance and add them to the scene
    points.forEach((curve, i) => {
      this.flow.updateCurve(i, curve);
      this.scene.add(this.flow.object3D);
    });

    // Set up each individual ribbon's initial position and color
    for (let i = 0; i < this.ribbonCount; i++) {
      const curveIndex = i % points.length;
      this.flow.setCurve(i, curveIndex);
      this.flow.moveIndividualAlongCurve(i, (i * 1) / this.ribbonCount);
      this.flow.object3D.setColorAt(i,new THREE.Color(0xffffff * Math.random()));
    }

    // Debug: Log texture and flow object to verify correctness
    console.log("Texture:", this.scene);
    console.log("Flow object3D:", this.flow.object3D);
  }

  generateStaticPoints() {
    let points1 = [];
    let points2 = [];
    let points3 = [];
    let points4 = [];
    let points5 = [];
    const topScreen = this.frustumSize / 2 + this.frustumSize * 0.2;
    const bottomScreen = -this.frustumSize / 2 - this.frustumSize * 0.2;
    const totalPoints = 12;
    let yIncrement = (topScreen - bottomScreen) / (totalPoints - 1);

    let isPos = true;
    for (let i = 0; i < totalPoints; i++) {
      let x1 = this.frustumSize * this.aspect * -0.4; // Regular zigzag pattern on x-axis
      let x2 = this.frustumSize * this.aspect * -0.2; // Regular zigzag pattern on x-axis
      let x3 = this.frustumSize * this.aspect * 0.02; // Regular zigzag pattern on x-axis
      let x4 = this.frustumSize * this.aspect * 0.2; // Regular zigzag pattern on x-axis
      let x5 = this.frustumSize * this.aspect * 0.4; // Regular zigzag pattern on x-axis
      if (i > 0) {
        if (isPos) {
          x1 += this.frustumSize * 0.03;
          x2 += this.frustumSize * 0.07;
          x3 += this.frustumSize * 0.09;
          x4 += this.frustumSize * 0.05;
          x5 += this.frustumSize * 0.11;
          isPos = false;
        } else {
          x1 -= this.frustumSize * 0.02;
          x2 -= this.frustumSize * 0.08;
          x3 -= this.frustumSize * 0.1;
          x4 -= this.frustumSize * 0.08;
          x5 -= this.frustumSize * 0.06;
          isPos = true;
        }
      }

      let y = topScreen - i * yIncrement;
      let z = 0; // Fixed z-value for simplicity

      if (i === 0 || i === totalPoints - 1) z = -this.frustumSize * 3;

      points1.push(new THREE.Vector3(x1, y, z));
      points2.push(new THREE.Vector3(x2, y, z));
      points3.push(new THREE.Vector3(x3, y, z));
      points4.push(new THREE.Vector3(x4, y, z));
      points5.push(new THREE.Vector3(x5, y, z));
    }

    let scaleFactor = this.frustumSize / this.originalFrustumSize;
    points1 = points1.map((point) => point.multiplyScalar(scaleFactor));
    points2 = points2.map((point) => point.multiplyScalar(scaleFactor));
    points3 = points3.map((point) => point.multiplyScalar(scaleFactor));
    points4 = points4.map((point) => point.multiplyScalar(scaleFactor));
    points5 = points5.map((point) => point.multiplyScalar(scaleFactor));

    return [points1, points4, points5, points2, points3];
  }

  animateRibbons() {
    // Move ribbons along the curve (should be called in the render loop)
    this.flow.moveAlongCurve(this.ribbonSpeed);
  }
}

export default Ribbon;
