import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";

class Ribbon {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.frustumSize = frustumSize;

    this.originalFrustumSize = frustumSize;
    this.ribbonSpeed = 0.00025;
    this.ribbonCount = 55;
    this.deltaTime = 0;
    this.flow = null;

    // Initialize ribbons
    this.ribbonArr = [this.createRibbons()];
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200, 0x0000ff, 0xffff00];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createRibbons() {
    const planeGeometry = new THREE.PlaneGeometry(
      this.frustumSize * 0.015,
      this.frustumSize * 0.2,
      100,
      100
    );
    planeGeometry.rotateX(Math.PI / 2);
    planeGeometry.rotateY(Math.PI / 2);
    // planeGeometry.rotateZ(Math.PI / 2);

    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const points = this.generateStaticPoints();
    const curves = points.map(
      (pnts) => new THREE.CatmullRomCurve3(pnts, true, "centripetal", 0.7)
    );

    this.flow = new InstancedFlow(
      this.ribbonCount,
      curves.length,
      planeGeometry,
      planeMaterial
    );

    curves.forEach((curve, i) => this.flow.updateCurve(i, curve));

    for (let i = 0; i < this.ribbonCount; i++) {
      const curveIndex = i % curves.length;
      this.flow.setCurve(i, curveIndex);
      this.flow.moveIndividualAlongCurve(i, i / this.ribbonCount);
      this.flow.object3D.setColorAt(
        i,
        new THREE.Color(0xffffff * Math.random())
      );
    }

    this.flow.object3D.instanceMatrix.needsUpdate = true;
    this.scene.add(this.flow.object3D);

    return this.flow;
  }

  generateStaticPoints() {
    const topScreen = this.frustumSize / 2 + this.frustumSize * 0.2;
    const bottomScreen = -this.frustumSize / 2 - this.frustumSize * 0.2;
    const totalPoints = 20;
    const yIncrement = (topScreen - bottomScreen) / (totalPoints - 1);
    const xOffsets = [-Math.random() * 0.5, -Math.random() * 0.5, -Math.random() * 0.5, -Math.random() * 0.5, -Math.random() * 0.5, Math.random() * 0.1,Math.random() * 0.5,Math.random() * 0.5,Math.random() * 0.5].map(
      (offset) => offset * this.frustumSize * this.aspect
    );
    // const xOffsets = [-0.4, -0.35, -0.25, -0.02, -0.1, 0.3, 0.2, 0.05, 0.4].map(
    //   (offset) => offset * this.frustumSize * this.aspect
    // );

    const pointsArray = Array(xOffsets.length)
      .fill()
      .map(() => []);


    const scaleFactor = this.frustumSize / this.originalFrustumSize;

    let isPos = true;
    for (let i = 0; i < totalPoints; i++) {
      const y = topScreen - i * yIncrement * scaleFactor * 0.9;
      const z =
        i === 0 || i === totalPoints - 1
          ? -this.frustumSize * 0.5
          : Math.random() < 0.5
            ? -this.frustumSize * 0.05
            : this.frustumSize * 0.05

      xOffsets.forEach((x, j) => {
        pointsArray[j].push(
          new THREE.Vector3(
            isPos ? x + this.frustumSize * 0.02 : x - this.frustumSize * 0.02,
            y,
            z
          )
        );
      });
      isPos = !isPos;
    }

    //Update the xPos of all the ribbons and adjust them according to the frustumSize
    pointsArray.map((points) =>
      points.map((point, i) => {
        if (i === 0) {
          point.x =
            this.frustumSize * this.aspect +
            this.frustumSize * this.aspect * 0.0001;
        } else if (i === points.length - 1) {
          point.x =
            this.frustumSize * this.aspect -
            this.frustumSize * this.aspect * 0.0001;
        }

        point.multiplyScalar(scaleFactor);
      })
    );

    return pointsArray;
  }

  //Make Ribbons animate through the path
  animateRibbons() {
    this.ribbonArr.forEach((flow) => {
      if (flow) {
        flow.moveAlongCurve(this.ribbonSpeed);
      }
    });
  }

  dispose() {
    this.ribbonArr.forEach((flow) => {
      if (flow) {
        // Remove ribbons from scene
        this.scene.remove(flow.object3D);

        // Dispose geometry and material
        flow.object3D.geometry.dispose();
        flow.object3D.material.dispose();

        // Dispose texture if it exists
        if (this.texture) this.texture.dispose();

        // Nullify references for garbage collection
        flow = null;
        this.texture = null;
      }
    });
  }
}

export default Ribbon;
