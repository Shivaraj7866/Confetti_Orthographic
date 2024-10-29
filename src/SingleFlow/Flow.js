import * as THREE from "three";
import { Flow } from "three/examples/jsm/modifiers/CurveModifier.js";

class SingleFlow {
    constructor(scene, frustumSize, width, height, texture) {
        this.scene = scene;
        this.texture = texture;
        this.aspect = width / height;
        this.width = width;
        this.height = height;
        this.ribbon = null;
        this.box = null;

        this.frustumSize = frustumSize;
        this.originalFrustumSize = frustumSize;
        this.originalScaleFactor = frustumSize * 0.04;
        this.ribbonSpeed = 0.0006; // Control ribbon speed

        this.deltaTime = 0;
        this.boxDeltaTime = 0 ;

        this.createRibbonAndBox();
    }

    createRibbonAndBox() {
        // Create a single curve for the ribbon to follow
        const points = this.generateStaticPoints();
        const ribbonCurve = new THREE.CatmullRomCurve3(points);
        ribbonCurve.curveType = "centripetal";
        ribbonCurve.tension = 0.7;
        ribbonCurve.closed = true; // Open curve

        const curvePoints = ribbonCurve.getPoints(50)
        const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints)
        const lineMat = new THREE.LineBasicMaterial({color:0xffffff})
        const line = new THREE.Line(lineGeo,lineMat)
        this.scene.add(line)
    
        // Create plane geometry for the ribbon
        const planeGeometry = new THREE.PlaneGeometry(
            0.1 * this.frustumSize * 0.1, // Adjust based on frustum size to maintain consistent size
            0.8 * this.frustumSize * 0.1,
            100,
            100
        );
        planeGeometry.rotateZ(Math.PI / 2);
    
        // Material for the ribbon
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: this.texture,
            side: THREE.DoubleSide,
            transparent: true,
            color: 0xff0000
        });
    
        // Create Flow to move ribbon along the curve
        this.ribbon = new Flow(new THREE.Mesh(planeGeometry, planeMaterial));
        this.ribbon.object3D.scale.set(1, 1, 1);  // Keep the scale consistent
        this.ribbon.updateCurve(0, ribbonCurve);
        this.scene.add(this.ribbon.object3D);
    
        // Create a box to move along the curve
        const boxGeometry = new THREE.BoxGeometry(0.015 * this.frustumSize, 0.015 * this.frustumSize, 0.015 * this.frustumSize);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.box = new THREE.Mesh(boxGeometry, boxMaterial);
        this.scene.add(this.box);
    }
    

    generateStaticPoints() {
        const points = [];
        const topScreen = this.frustumSize / 2 + this.frustumSize * 0.2;
        const bottomScreen = -this.frustumSize / 2 - this.frustumSize * 0.2;
        const totalPoints = 12;
        const yIncrement = (topScreen - bottomScreen) / (totalPoints - 1);

        let isPos = true;
        for (let i = 0; i < totalPoints; i++) {

            let x1 = this.frustumSize * this.aspect * -0.4; // Regular zigzag pattern on x-axis
            if (i > 0) {
                if (isPos) {
                    x1 += this.frustumSize * 0.02;
                    isPos = false;
                } 
                else {
                    x1 -= this.frustumSize * 0.02;
                    isPos = true;
                }
            }

            let y = topScreen - i * yIncrement;
            let z = 0; // Fixed z-value for simplicity

            if (i === 0 || i === totalPoints - 1) {
                z = -this.frustumSize * 1;
            }
            // else { z = [-5, 5, -2, 2][Math.floor(Math.random() * 4)]; }

            points.push(new THREE.Vector3(x1, y, z));
        }

        // Scale the points according to frustum size
        const scaleFactor = this.frustumSize / this.originalFrustumSize;
        return points.map((point) => point.multiplyScalar(scaleFactor));
    }

    animateRibbon() {
        // Move the ribbon along the curve
        this.ribbon.moveAlongCurve(this.ribbonSpeed);
    
        // Increment deltaTime for animation, ensuring smooth movement
        this.deltaTime += this.ribbonSpeed;
    
        // Reset deltaTime if it exceeds 1 to loop the animation along the curve
        if (this.deltaTime > 1) {
            this.deltaTime = 0;
        }
    
        // Calculate boxDeltaTime to create an offset between the box and the ribbon
        this.boxDeltaTime = this.deltaTime - (this.frustumSize * 0.0067); // Offset to position the box slightly ahead
    
        // Wrap boxDeltaTime to keep it in the [0, 1] range
        if (this.boxDeltaTime < 0) {
            this.boxDeltaTime += 1;
        } else if (this.boxDeltaTime > 1) {
            this.boxDeltaTime -= 1;
        }
    
        // Access the curve stored in the Flow instance
        const ribbonCurve = this.ribbon.curveArray[0];
    
        // Check if the curve is defined
        if (!ribbonCurve) {
            console.error("Ribbon curve is undefined.");
            return;
        }
    
        // Get the position of the ribbon at the current point along the curve
        const ribbonPosition = new THREE.Vector3();
        ribbonCurve.getPointAt(this.deltaTime, ribbonPosition);
    
        // Get the position of the box ahead of the ribbon along the curve
        const boxPosition = new THREE.Vector3();
        ribbonCurve.getPointAt(this.boxDeltaTime, boxPosition);
    
        // Set the box's position
        this.box.position.set(boxPosition.x, boxPosition.y, boxPosition.z);
    
        // Ensure the orientation of the box aligns with the ribbon's flow direction
        const ribbonTangent = new THREE.Vector3();
        ribbonCurve.getTangentAt(this.boxDeltaTime, ribbonTangent);
        this.box.lookAt(boxPosition.clone().add(ribbonTangent));
    }
    
}

export default SingleFlow;
