import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";

class Ribbon {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.frustumSize = frustumSize;

    this.originalFrustumSize = frustumSize;
    this.ribbonSpeed = 0.0003;
    this.ribbonCount = 50;
    this.deltaTime = 0;
    this.progress = 0
    // this.flow = null;

    // Initialize ribbons
    this.ribbonArr = [this.createRibbons()];

    // console.log(this.createRibbons())
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
      side:THREE.FrontSide,
      transparent: true,
    });

    const points = this.generateStaticPoints();
    const curves = points.map((pnts) => new THREE.CatmullRomCurve3(pnts, false, "centripetal", 0.7));

  const flow = new InstancedFlow(
      this.ribbonCount,
      curves.length,
      planeGeometry,
      planeMaterial
    );

    curves.forEach((curve, i) => flow.updateCurve(i, curve));

    for (let i = 0; i < this.ribbonCount; i++) {
      const curveIndex = i % curves.length;
      flow.setCurve(i, curveIndex);
      flow.moveIndividualAlongCurve(i, i / this.ribbonCount);
      flow.object3D.setColorAt(
        i,
        new THREE.Color(this.getRandomColor())
      );

      console.log()
    }

    flow.object3D.instanceMatrix.needsUpdate = true;
    this.scene.add(flow.object3D);

    return flow;
  }

  generateStaticPoints() {
    const topScreen = this.frustumSize / 2 + this.frustumSize * 0.2;
    const bottomScreen = -this.frustumSize / 2 - this.frustumSize * 0.2;
    const totalPoints = 20;
    const yIncrement = (topScreen - bottomScreen) / (totalPoints - 1);
    const xOffsets = [-Math.random() * 0.5, Math.random() * 0.5, -Math.random() * 0.5,Math.random() * 0.5,-Math.random() * 0.5].map(
      (offset) => offset * this.frustumSize * this.aspect
    );

    const pointsArray = Array(xOffsets.length)
      .fill()
      .map(() => []);

    const scaleFactor = this.frustumSize / this.originalFrustumSize;

    let isPos = true;
    for (let i = 0; i < totalPoints; i++) {
      const y = topScreen - i * yIncrement * scaleFactor * 1;
      const z = (i === 0 || i === 1 || i === totalPoints - 1 || i === totalPoints - 2) ? -this.frustumSize * 5 : Math.random() < 0.5 ? -this.frustumSize * 0.035 : this.frustumSize * 0.035;

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

    return pointsArray;
  }

  animateRibbons() {
    this.ribbonArr.forEach((flow,i) => {
      if (flow) {
        console.log(flow)
        // Track each instance position
        for (let i = 0; i < this.ribbonCount; i++) {
          flow.moveIndividualAlongCurve(i,this.ribbonSpeed);



        }
      }
    });
  }

  dispose() {
    this.ribbonArr.forEach((flow) => {
      if (flow) {
        this.scene.remove(flow.object3D);
        flow.object3D.geometry.dispose();
        flow.object3D.material.dispose();
        if (this.texture) this.texture.dispose();
        flow = null;
        this.texture = null;
      }
    });
  }
}

export default Ribbon;
