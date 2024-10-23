import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import Ribbon1 from "./Ribbon3";

// async function loadTextures(imagArray) {
//     let textureLoader = new THREE.TextureLoader();
//     const promise = imagArray.map((texture) => {
//         return new Promise((resolve, reject) => {
//             textureLoader.load(texture.path, resolve, undefined, reject);
//         });
//     });

//     return Promise.all(promise);
// }

/**
 * Use this loader only while using models
 */
async function gLTFLoader(gltfArr){
    let loader = new GLTFLoader()
    const promise = gltfArr.map((gltf)=>{
        return new Promise((reslove,reject)=>{
            loader.load(gltf.path,reslove,undefined,reject)
        })
    })

    return await Promise.all(promise)

}

function initScene(texture) {

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "100px";
    overlay.style.padding = "10px";
    overlay.style.color = "white";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    document.body.appendChild(overlay);

    let stats = new Stats();
    stats.showPanel(2);
    document.body.appendChild(stats.dom);

    //coding part starts----------------------------

    //Scene
    const scene = new THREE.Scene();
    let width = window.innerWidth;
    let height = window.innerHeight;

    //Camera
    const frustumSize = 10000;
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        -1000,
        1000
    );
    camera.position.z = 5;

    //Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    let controls = new OrbitControls(camera,renderer.domElement)
    controls.enableDamping = true ;

    //Overlay
    function updateOverlay() {
        const memoryInfo = window.performance.memory || {};
        const usedJSHeap = memoryInfo.usedJSHeapSize
          ? (memoryInfo.usedJSHeapSize / 1048576).toFixed(2) // Convert to MB
          : 'N/A';
        const totalJSHeap = memoryInfo.totalJSHeapSize
          ? (memoryInfo.totalJSHeapSize / 1048576).toFixed(2)
          : 'N/A';
        const jsHeapLimit = memoryInfo.jsHeapSizeLimit
          ? (memoryInfo.jsHeapSizeLimit / 1048576).toFixed(2)
          : 'N/A';
      
        overlay.innerHTML = `
          <strong>Draw Calls:</strong> ${renderer.info.render.calls}<br>
          <strong>Frame:</strong> ${renderer.info.render.frame}<br>
          <strong>Textures:</strong> ${renderer.info.memory.textures}<br>
          <strong>Geometries:</strong> ${renderer.info.memory.geometries}<br>
          <strong>JS Heap Used:</strong> ${usedJSHeap} MB<br>
          <strong>Total JS Heap:</strong> ${totalJSHeap} MB<br>
          <strong>JS Heap Limit:</strong> ${jsHeapLimit} MB
        `;
      }
      
    let clock = new THREE.Clock();
    let time = 0;

    //Ribbon class instance 
    let ribbon = new Ribbon1(
        scene,
        frustumSize,
        width,
        height,
        texture[1]
    );

    function animate() {
        stats.begin()

        requestAnimationFrame(animate);
        controls.update()

        const delta = clock.getDelta();
        time += delta;

        // ribbon.animateRibbons(time);
        ribbon.animateConfetti(time)

        ribbon.updateMixer(delta)

        updateOverlay();
        renderer.render(scene, camera);
        stats.end()
    }

    animate();

    // Handle window resize
    window.addEventListener(
        "resize",
        () => {
            width = window.innerWidth;
            height = window.innerHeight;
            const aspect = width / height;
            camera.left = (frustumSize * aspect) / -2;
            camera.right = (frustumSize * aspect) / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / -2;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);  
        },
        false
    );
}

/**
 * 
 */
// const ribbonArray = [
//     {
//         name: "ribbon",
//         path: "Images/Ri_C1.png",
//     },
// ];

// loadTextures(ribbonArray)
// .then((t) => {
//   // Initialize the scene after textures loaded
//   console.log(t)
//   initScene(t)
// })
// .catch((e) => console.log(e));

//Models array
const gltfArr = [
    {
        name: "ribbon_non_idle",
        path: "Models/Ribbon.gltf",
    },
    {
        name:"ribbon_idle",
        path : "Models/Ribbon_Idle.gltf"
    }
];

//Loading 3d models
gLTFLoader(gltfArr)
    .then((t) => {
        console.log("gltf loaded---------------", t);
        initScene(t);
    })
    .catch((e) => console.log("Error in loading Textures:-", e));
