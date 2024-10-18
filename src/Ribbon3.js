import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";
import gsap from "gsap";

class Ribbon {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.width = width;
    this.height = height;
    // console.log(this.texture)
    this.confettiPapers = [];
    this.ribbons = [];
    this.confettiCount = 100;
    this.frustumSize = frustumSize;
    this.originalFrustumSize = frustumSize; // Store the original frustum size
    this.originalScaleFactor = frustumSize * 0.04; // Original scale factor for ribbons
    this.ribbonSpeed = 0.0005;
    this.ribbonCount = 15;

    this.mixer = null;

    this.setupLighting();

    // for (let i = 0; i < this.ribbonCount; i++) {
    this.ribbons.push(this.createRibbon(this.texture));
    // } // Add zigzag planes

    for (let i = 0; i < this.confettiCount; i++) {
      this.confettiPapers.push(this.createConfetti());
    }
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.scene.add(dLight, ambientLight);
  }

  //Ribbon Creations-----------------------------------------------

  createRibbon(gltf) {
    let model = gltf.scene;

    console.log(model.scale)
    // Position the model at the top of the screen
    model.position.set(0, this.frustumSize / 2, 0);

    model.scale.set(100,100,100)
    // model.scale.set(this.frustumSize * 0.01,this.frustumSize * 0.01,this.frustumSize * 0.01)

    // Add the model to the scene
    this.scene.add(model);

    // Check if the GLTF has animations
    if (gltf.animations && gltf.animations.length > 0) {
        console.log(gltf.animations)
      // Create an animation mixer for the model
      this.mixer = new THREE.AnimationMixer(model);

      // Load the first animation clip (or you can loop through them)
      let action = this.mixer.clipAction(gltf.animations[0]);

      // Play the animation
      action.play();
    }

    // Animate the model from top to bottom using GSAP
    // gsap.to(model.position, {
    //     y: -(this.frustumSize / 2),  // Move to the bottom
    //     duration: 5,                 // Duration of the animation (adjust as needed)
    //     ease: "power1.inOut",         // Optional easing
    //     onComplete: () => {
    //         console.log("Animation complete!");
    //         // Handle what happens after the animation completes, like restarting or removing
    //     }
    // });
  }

  updateMixer(delta) {
    // Update the mixer to animate the model
    if (this.mixer) this.mixer.update(delta);
  }

  // Existing animateRibbons method with added update check
  //    animateRibbons() {
  //     this.ribbons.forEach((flow) => {
  //       if (flow) {
  //         flow.moveAlongCurve(this.ribbonSpeed);

  //         // Adjust scale if frustumSize has changed dynamically
  //         const newScaleFactor = this.originalFrustumSize / this.frustumSize;
  //         flow.object3D.scale.set(
  //           newScaleFactor * flow.object3D.scale.x,
  //           newScaleFactor * flow.object3D.scale.y,
  //           newScaleFactor * flow.object3D.scale.z
  //         );
  //       }
  //     });
  //   }

  // If frustumSize changes, update curve points and ribbons
  updateFrustumSize(newFrustumSize) {
    this.frustumSize = newFrustumSize;

    // Recalculate and update the ribbon curves
    this.updateRibbonCurves();
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
      paper.position.x +=
        Math.sin(elapsedTime + index * 0.8) * 0.01 + paper.userData.xSpeed;
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
