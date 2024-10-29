import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";

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
    this.ribbonSpeed = 0.0005; // Increased speed to make sure it is noticeable

    this.flow = null;
    this.ribbonCount = 45;

    this.deltaTime = 0;

    this.createRibbons();
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200, 0x0000ff, 0xffff00];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createRibbons() {
    // Create plane geometry for ribbons
    let planeGeometry = new THREE.PlaneGeometry(
      this.frustumSize * 0.015,
      this.frustumSize * 0.2,
      100,
      100
    );
    planeGeometry.rotateX(Math.PI / 2);
    planeGeometry.rotateY(Math.PI / 2);

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
      return zigzagCurve;
    });
    
    this.flow = new InstancedFlow(
      this.ribbonCount,
      points.length,
      planeGeometry,
      planeMaterial
    );
    
    // Update curves for each instance and add them to the scene
    points.forEach((curve, i) => {
      console.log(curve)

      let curvePoints = curve.getPoints(50)
      let lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints)
      let lineMat = new THREE.LineBasicMaterial({ color: 0xff00ff })
      let line = new THREE.Line(lineGeo, lineMat)
      // this.scene.add(line)

      this.flow.updateCurve(i, curve);
      this.scene.add(this.flow.object3D);
    });

    // Set up each individual ribbon's initial position and color
    for (let i = 0; i < this.ribbonCount; i++) {
      const curveIndex = i % points.length;
      this.flow.setCurve(i, curveIndex);
      this.flow.moveIndividualAlongCurve(i, (i * 1) / this.ribbonCount);
      this.flow.object3D.setColorAt(
        i,
        new THREE.Color(0xffffff * Math.random())
      );
    }

    // Update the instance matrix to reflect changes
    this.flow.object3D.instanceMatrix.needsUpdate = true;

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
    let points6 = [];
    let points7 = [];
    const topScreen = this.frustumSize / 2 + this.frustumSize * 0.2;
    const bottomScreen = -this.frustumSize / 2 - this.frustumSize * 0.2;
    const totalPoints = 12;
    let yIncrement = (topScreen - bottomScreen) / (totalPoints - Math.random() * 2);

    let isPos = true;
    for (let i = 0; i < totalPoints; i++) {
      let x1 = this.frustumSize * this.aspect * -0.4; // Regular zigzag pattern on x-axis
      let x2 = this.frustumSize * this.aspect * -0.2; // Regular zigzag pattern on x-axis
      let x3 = this.frustumSize * this.aspect * -0.02; // Regular zigzag pattern on x-axis
      let x4 = this.frustumSize * this.aspect * -0.1; // Regular zigzag pattern on x-axis
      let x5 = this.frustumSize * this.aspect * 0.3; // Regular zigzag pattern on x-axis
      let x6 = this.frustumSize * this.aspect * 0.4; // Regular zigzag pattern on x-axis
      let x7 = this.frustumSize * this.aspect * 0.2; // Regular zigzag pattern on x-axis
      if (i > 0) {
        if (isPos) {
          x1 += this.frustumSize * 0.02;
          x2 += this.frustumSize * 0.04;
          x3 += this.frustumSize * 0.025;
          x4 += this.frustumSize * 0.03;
          x5 += this.frustumSize * 0.05;
          x6 += this.frustumSize * 0.01;
          x7 += this.frustumSize * 0.0125;
          isPos = false;
        } else {
          x1 -= this.frustumSize * 0.02;
          x2 -= this.frustumSize * 0.04;
          x3 -= this.frustumSize * 0.025;
          x4 -= this.frustumSize * 0.03;
          x5 -= this.frustumSize * 0.05;
          x6 -= this.frustumSize * 0.01;
          x7 -= this.frustumSize * 0.0125;
          isPos = true;
        }
      }

      let y = topScreen - i * yIncrement;
      let z = 0; // Fixed z-value for simplicity

      if (i === 0 || i === totalPoints - 1) {
        x1 = this.frustumSize * this.aspect + this.frustumSize * this.aspect * 0.06
        x2 = this.frustumSize * this.aspect + this.frustumSize * this.aspect * 0.06
        x3 = this.frustumSize * this.aspect + this.frustumSize * this.aspect * 0.08
        x4 = this.frustumSize * this.aspect - this.frustumSize * this.aspect * 0.06
        x5 = -this.frustumSize * this.aspect - this.frustumSize * this.aspect * 0.06
        x6 = -this.frustumSize * this.aspect - this.frustumSize * this.aspect * 0.06
        x7 = -this.frustumSize * this.aspect - this.frustumSize * this.aspect * 0.06
        z = -this.frustumSize * 3;
      }
      else { z = [-1, 1, -1, 1][Math.floor(Math.random() * 4)]; }

      points1.push(new THREE.Vector3(x1, y, z));
      points2.push(new THREE.Vector3(x2, y, z));
      points3.push(new THREE.Vector3(x3, y, z));
      points4.push(new THREE.Vector3(x4, y, z));
      points5.push(new THREE.Vector3(x5, y, z));
      points6.push(new THREE.Vector3(x6, y, z));
      points7.push(new THREE.Vector3(x7, y, z));
    }

    let scaleFactor = this.frustumSize / this.originalFrustumSize;
    points1 = points1.map((point) => point.multiplyScalar(scaleFactor));
    points2 = points2.map((point) => point.multiplyScalar(scaleFactor));
    points3 = points3.map((point) => point.multiplyScalar(scaleFactor));
    points4 = points4.map((point) => point.multiplyScalar(scaleFactor));
    points5 = points5.map((point) => point.multiplyScalar(scaleFactor));
    points6 = points6.map((point) => point.multiplyScalar(scaleFactor));
    points7 = points7.map((point) => point.multiplyScalar(scaleFactor));

    return [points6, points4, points5, points2, points3, points1, points7];
  }

  animateRibbons(time) {
    // Move ribbons along the curve (should be called in the render loop)
    this.flow.moveAlongCurve(this.ribbonSpeed);

    // Update deltaTime on each frame
    this.deltaTime += 0.001;

    // Reset deltaTime if it exceeds 1 second
    if (this.deltaTime > 1) {
      this.deltaTime = 0;
    }
    // console.log("Delta time exceeded 1 second. Resetting...",this.deltaTime);
    for (let i = 0; i < 5; i++) {
      // console.log("------------------index-----------------",i,this.flow.curveArray[i])

      // if (this.flow.curveArray[i].getPoint(this.deltaTime).y < -this.frustumSize / 2) {
      //   console.log(this.flow.curveArray[i])
      //   this.flow.object3D.visible = false;
      // }
      // else if (this.flow.curveArray[i].getPoint(this.deltaTime).y >= this.frustumSize / 2) {
      //   this.flow.object3D.visible = true;
      // }

    }

    // Ensure the instance matrix is updated after moving ribbons
    this.flow.object3D.instanceMatrix.needsUpdate = true;
  }

}

export default Ribbon;
