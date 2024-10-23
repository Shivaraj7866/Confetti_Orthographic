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
    this.ribbonSpeed = this.frustumSize * 0.0001; // Increased speed to make sure it is noticeable
    this.ribbonCount = 1;
    this.time = 0;

  

    this.createRibbon(); // Create the ribbon(s)

  }
  
  createRibbon() {

    let planeGeometry = new THREE.PlaneGeometry(0.1, 0.5, 100, 100);
     planeGeometry.rotateX(Math.PI / 2);
     planeGeometry.rotateY(Math.PI / 2);
    //  planeGeometry.rotateZ(Math.PI / 2);
    let planeMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    // Generate points for the curve
    let points = this.generateCurvePoints();
  
    // Create the curve
    let zigzagCurve1 = new THREE.CatmullRomCurve3(points);
    zigzagCurve1.curveType = "centripetal";
    zigzagCurve1.tension = 0.7;
    zigzagCurve1.closed = true;
  
    const instanceCount = 10; // Define how many instances (ribbons)
  
    // Instantiate the InstancedFlow
    let flow = new InstancedFlow(instanceCount, instanceCount, planeGeometry, planeMaterial);
    flow.object3D.scale.set(this.frustumSize * 0.1, this.frustumSize * 0.1, this.frustumSize * 0.1);

    
    
    // Update the curve for each instance and move it along the curve
    for (let i = 0; i < instanceCount; i++) {
      flow.object3D.position.x = 0
      flow.updateCurve(i, zigzagCurve1); // Assign the curve to each instance
      this.scene.add(flow.object3D);
      flow.moveIndividualAlongCurve(i, Math.random()); // Move each instance randomly along the curve
      flow.object3D.setColorAt( i, new THREE.Color( 0xffffff * Math.random() ) );
    }

    // Add the flow object to the scene
  
    // Store the flow instance for animation later
    this.ribbons.push(flow);
  }
  
  generateCurvePoints() {
    let points = [];
    const topScreen = this.height / 2;
    const bottomScreen = -this.height / 2;
    const totalPoints = 20;
    let yIncrement = (topScreen - bottomScreen) / (totalPoints - 1);

    for (let i = 0; i < totalPoints; i++) {
      let x = (Math.random() - 0.5) * this.frustumSize * this.aspect * 0.1; // Regular zigzag pattern on x-axis
      let y = (topScreen - i * yIncrement) * 0.03;
      let z = 0; // Fixed z-value for simplicity

      points.push(new THREE.Vector3(x, y, z));
    }

    let scaleFactor = this.frustumSize / this.originalFrustumSize;
    points = points.map((point) => point.multiplyScalar(scaleFactor));

    return points;
  }

  animateRibbons() {
    this.ribbons.forEach((flow) => {
      if (flow) {
        // flow.object3D.position.x = (Math.random() - 0.5) * this.frustumSize * this.aspect
        flow.moveAlongCurve(this.ribbonSpeed); // Move the ribbon along the curve
      }
    });
  }
}

export default Ribbon;
