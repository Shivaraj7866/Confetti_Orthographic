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
    this.confettiCount = 100;
    this.frustumSize = frustumSize;
    this.originalFrustumSize = frustumSize; // Store the original frustum size
    this.originalScaleFactor = frustumSize * 0.04; // Original scale factor for ribbons
    this.ribbonSpeed = 0.0005;
    this.ribbonCount = 15;

    this.time = 0 ;

    this.setupLighting();

    for (let i = 0; i < this.ribbonCount; i++) {
      this.ribbons.push(this.createRibbon());
    } // Add zigzag planes

    for (let i = 0; i < this.confettiCount; i++) {
      // this.confettiPapers.push(this.createConfetti())
    }
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.scene.add(dLight, ambientLight);
  }

  //Ribbon Creations-----------------------------------------------

  createRibbon() {
    const planeGeometry = new THREE.PlaneGeometry(0.08, 1, 100, 100);
    // planeGeometry.rotateX(Math.PI / 2);
    // planeGeometry.rotateY(Math.PI / 2);
    planeGeometry.rotateZ(Math.PI / 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    let points = this.generateCurvePoints();

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);

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
    flow.object3D.position.x = (Math.random() - 0.5) * this.frustumSize * this.aspect;

    // Set scale based on original frustum size
    flow.object3D.scale.set(this.frustumSize * 0.1, this.frustumSize * 0.1, this.frustumSize * 0.1);
    // console.log(flow.object3D.scale);

    flow.updateCurve(0, zigzagCurve1);
    this.scene.add(flow.object3D);

    // flow.setCurve(0, 0);
    flow.moveIndividualAlongCurve(0, Math.random());
    flow.object3D.setColorAt(0, new THREE.Color(0xffffff * Math.random() * 2));
    flow.curveArray[0].needsUpdate = true;

    return flow;
  }

  generateCurvePoints() {
    let points = [];

    let baseFrustumSize = this.originalFrustumSize; // Use original frustum size for curve consistency
    let waveAmplitude = baseFrustumSize * 0.01; // Keep this consistent with original size
    let waveFrequency = baseFrustumSize * 0.18;

    // Use original width/height to calculate start and end positions
    const topScreen = this.frustumSize  ; // Top of the screen
    const bottomScreen = -this.frustumSize ; // Bottom of the screen
    const totalPoints = 25; // Number of points to generate
    
    let yIncrement = (topScreen - bottomScreen) / (totalPoints - 1); // Equal space along y-axis
    // console.log(yIncrement,topScreen,bottomScreen)
    for (let i = 0; i < totalPoints; i++) {
      // Normalize xVariation with respect to original frustum size to avoid distortion
      // let xVariation =  Math.random() * this.aspect * this.frustumSize * 0.003;
      let xVariation = Math.sin((i / (totalPoints)) * waveFrequency) * waveAmplitude;
      let y = (topScreen - i * yIncrement) * 0.03;
      let z = 0;

      if (i === 0 || i === totalPoints - 1) {
        z = -100; // Ensure the first and last points have z = -100
      }

      points.push(new THREE.Vector3(xVariation, y, z));
    }

    return points;
  }
  
   // Existing animateRibbons method with added update check
   animateRibbons() {
    this.ribbons.forEach((flow) => {
      if (flow) {
        flow.moveAlongCurve(this.ribbonSpeed);

        
        if(this.time > 0) {
          this.time += 0.01
        }
        const currentProgress = flow.curveArray[0].getPoint(this.time)
        console.log(currentProgress)

        // Adjust scale if frustumSize has changed dynamically
        const newScaleFactor = this.originalFrustumSize / this.frustumSize;
        flow.object3D.scale.set(
          newScaleFactor * flow.object3D.scale.x,
          newScaleFactor * flow.object3D.scale.y,
          newScaleFactor * flow.object3D.scale.z
        );
      }
    });
  }

  
  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  // Creating Confetti Papers-----------------------------------------------
  createConfetti() {
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.copy(new THREE.PlaneGeometry(0.15, 0.15));
    const material = new THREE.MeshBasicMaterial({
      color: this.getRandomColor(),
      side: THREE.DoubleSide,
    });
    const confetti = new THREE.InstancedMesh(
      geometry,
      material,
      this.confettiCount
    );

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

    //this userData contains paper's rotation speed while falling along x,y and z axis
    confetti.userData = {
      xSpeed: (Math.random() - 0.5) * this.frustumSize * this.aspect * 0.002,
      ySpeed: -(Math.random() * 0.005 * this.frustumSize),
      rotationSpeed: (Math.random() - 0.5) * this.frustumSize * 0.005,
    };

    this.scene.add(confetti);

    return confetti;
  }

  //Animate confetti papers
  animateConfetti(elapsedTime) {
    this.confettiPapers.forEach((paper, index) => {
      const scaleFactor = this.frustumSize * 0.1;

      //change scale according to the frustumSize
      paper.scale.set(scaleFactor, scaleFactor, scaleFactor);

      //Papers falling from top to bottom
      paper.position.x += Math.sin(elapsedTime + index * 0.8) * 0.01 + paper.userData.xSpeed;
      paper.position.y += paper.userData.ySpeed;

      //Adding wind Effect to the papers
      paper.rotation.x += paper.userData.rotationSpeed;
      paper.rotation.y += 0.25;

      //if the paper reaches bottom then again it should start from top of the scene
      if (paper.position.y < -this.frustumSize * 0.5) {
        paper.position.y = this.frustumSize * 0.5;
        paper.position.x =
          (Math.random() - 0.5) * this.frustumSize * this.aspect;
      }
    });
  }
}

export default Ribbon;
