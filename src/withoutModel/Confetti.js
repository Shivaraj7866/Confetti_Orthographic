import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";

class Confetti {
  constructor(scene, frustumSize, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;
    this.width = width;
    this.height = height;

    this.confettiPapers = [];
    this.confettiCount = 100;
    this.frustumSize = frustumSize;

    this.time = 0;

    // Initialize confetti papers
    // for (let i = 0; i < this.confettiCount; i++) {
    //   this.confettiPapers.push(this.createConfetti());
    // }

    this.confettiPapers.push(this.createConfetti())
    console.log(this.confettiPapers)
  }

  createConfetti() {
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.copy(new THREE.PlaneGeometry(0.15, 0.15));
  
    // Create color attribute for each instance
    const colors = new Float32Array(this.confettiCount * 3); // 3 components per color (r, g, b)
    
    for (let i = 0; i < this.confettiCount; i++) {
      const color = new THREE.Color(this.getRandomColor());
  
      // Set the color for each instance (r, g, b)
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
  
    // Add color attribute to geometry
    geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
  
    // Use ShaderMaterial to support custom color attribute
    const material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        attribute vec3 instanceColor;
        varying vec3 vColor;
  
        void main() {
          vColor = instanceColor;
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
  
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  
    const confetti = new THREE.InstancedMesh(geometry, material, this.confettiCount);
  
    for (let i = 0; i < this.confettiCount; i++) {
      // Randomize position and rotation for each confetti
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * this.aspect * this.frustumSize,
        this.frustumSize / 2,
        0
      );
      const rotation = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
  
      // Apply position and rotation to each instance
      confetti.setMatrixAt(i, new THREE.Matrix4().compose(
        position,
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z)),
        new THREE.Vector3(1, 1, 1)
      ));
  
      // Assign random speeds and rotation data
      confetti.userData[i] = {
        xSpeed: (Math.random() - 0.5) * this.frustumSize * this.aspect * 0.002,
        ySpeed: -(Math.random() * 0.005 * this.frustumSize),
        rotationSpeed: (Math.random() - 0.5) * this.frustumSize * 0.005,
      };
    }
  
    this.scene.add(confetti);
    return confetti;
  }
  
  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  
  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  animateConfetti(elapsedTime) {
    this.confettiPapers.forEach((confetti, index) => {
      for (let i = 0; i < this.confettiCount; i++) {
        // Retrieve userData for this instance
        const userData = confetti.userData[i];

        // Get the current matrix of the instance
        const matrix = new THREE.Matrix4();
        confetti.getMatrixAt(i, matrix);

        // Decompose the matrix to extract position, rotation, and scale
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        matrix.decompose(position, quaternion, scale);

        // Update position (falling effect by adding ySpeed to the current y position)
        position.x += userData.xSpeed; // Apply x-speed (wind-like motion)
        position.y += userData.ySpeed; // Falling down

        // Reset position when confetti crosses the bottom
        if (position.y < -this.frustumSize * 0.5) {
          // Reset to the top with random x position
          position.y = this.frustumSize * 0.5;
          position.x = (Math.random() - 0.5) * this.frustumSize * this.aspect;
        }

        // Add ripple-like rotation using sine waves
        const rippleX = Math.sin(elapsedTime * 3 + i * 0.5) * 0.1; // Adjust for desired ripple speed and amplitude
        const rippleY = Math.cos(elapsedTime * 2 + i * 0.8) * 0.1;
        const rippleZ = Math.cos(elapsedTime * 1.5 + i * 0.3) * 0.5;

        const rotation = new THREE.Euler(
          userData.rotationSpeed + rippleX * 300,
          userData.rotationSpeed + rippleY * 300,
          rippleZ
        );

        scale.set(this.frustumSize * 0.1, this.frustumSize * 0.1, this.frustumSize * 0.1)

        // Compose the updated matrix with new position, rotation, and scale
        matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);

        // Update the matrix of this instance
        confetti.setMatrixAt(i, matrix);
        // confetti.material.setRGB(i, matrix);

        console.log(confetti)

        // Mark the instance matrix as needing an update
        confetti.instanceMatrix.needsUpdate = true;
      }
    });
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default Confetti;
