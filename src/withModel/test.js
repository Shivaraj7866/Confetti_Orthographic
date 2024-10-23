import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";

// Setup scene, camera, renderer
const frustumSize = 100; // Define the frustum size
const aspect = window.innerWidth / window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  -1000,
  1000
);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Confetti particle count
const particleCount = 100;
const geometry = new THREE.PlaneGeometry(
  frustumSize * 0.01,
  frustumSize * 0.01
);

// Create material for confetti papers
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});

// Create instanced geometry for performance
const instancedGeometry = new THREE.InstancedBufferGeometry().copy(geometry);
const particles = new THREE.InstancedMesh(
  instancedGeometry,
  material,
  particleCount
);

// Store particle data like position and rotation in buffers
const positions = new Float32Array(particleCount * 3);
const rotations = new Float32Array(particleCount);

// Wind parameters
const windStrength = 0.8; // Strength of the wind effect
const windDirection = Math.PI / 4; // Wind direction in radians (e.g., 45 degrees)

// Initialize particle positions and rotations
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = Math.random() * frustumSize - frustumSize / 2; // Scale according to frustumSize
  positions[i * 3 + 1] = Math.random() * frustumSize - frustumSize / 2; // Scale according to frustumSize
  positions[i * 3 + 2] = 0; // z-axis

  rotations[i] = Math.random() * 2 * Math.PI; // Random rotation
}

particles.instanceMatrix.needsUpdate = true;
scene.add(particles);

// Add Stats.js to monitor performance
const stats = new Stats();
stats.showPanel(2); // 0: FPS, 1: ms/frame, 2: memory
document.body.appendChild(stats.dom);

// Custom UI for Draw Calls and Geometries
const infoDiv = document.createElement("div");
infoDiv.style.position = "absolute";
infoDiv.style.top = "0";
infoDiv.style.left = "100px";
infoDiv.style.color = "#fff";
infoDiv.style.padding = "10px";
infoDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
document.body.appendChild(infoDiv);

// Handle window resizing
window.addEventListener("resize", () => {
  const newAspect = window.innerWidth / window.innerHeight;
  camera.left = (-frustumSize * newAspect) / 2;
  camera.right = (frustumSize * newAspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  stats.begin(); // Start measuring

  requestAnimationFrame(animate);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= frustumSize * 0.003; // Make particles fall

    // Apply wind effect
    positions[i * 3] +=
      windStrength *
      Math.sin(Date.now() * 0.001 + i * 0.1) *
      Math.cos(windDirection);

    // Reset particle position
    if (positions[i * 3 + 1] < -frustumSize / 2) {
      positions[i * 3 + 1] = frustumSize / 2; // Reset to top
      positions[i * 3] = Math.random() * frustumSize * aspect; // Randomize x position
    }

    rotations[i] += 0.05; // Rotate confetti particles
  }

  // Update instance positions and rotations
  for (let i = 0; i < particleCount; i++) {
    const dummy = new THREE.Object3D();
    dummy.position.set(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2]
    );
    dummy.rotation.z = rotations[i];
    dummy.updateMatrix();
    particles.setMatrixAt(i, dummy.matrix);
  }
  particles.instanceMatrix.needsUpdate = true;

  renderer.render(scene, camera);

  // Update custom UI for draw calls and geometries
  infoDiv.innerHTML = `
    <strong>Draw Calls:</strong> ${renderer.info.render.calls} <br />
    <strong>Geometries:</strong> ${renderer.info.memory.geometries} <br />
    <strong>Textures:</strong> ${renderer.info.memory.textures}
  `;

  stats.end(); // End measuring
}

animate();
