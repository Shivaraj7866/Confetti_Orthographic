import * as THREE from "three";

export default class InstancedFlowHelper extends THREE.Object3D {
    constructor(flow, color = 0x00ff00) {
      super();
  
      // Loop through the instances in the flow and create helpers for each
      for (let i = 0; i < flow.count; i++) {
        // Extract the matrix from each instance
        const matrix = new THREE.Matrix4();
        flow.getMatrixAt(i, matrix);
  
        // Create a helper for the instance
        const helperGeometry = new THREE.BoxGeometry(1, 1, 1); // Customize size here
        const helperMaterial = new THREE.MeshBasicMaterial({
          color,
          wireframe: true
        });
  
        const helper = new THREE.Mesh(helperGeometry, helperMaterial);
  
        // Apply the matrix to the helper
        helper.applyMatrix4(matrix);
  
        // Add the helper to the scene
        this.add(helper);
      }
    }
  }
  
  // Assuming 'flow' is your instanced flow object