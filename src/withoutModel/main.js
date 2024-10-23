import * as THREE from "three";
import Ribbon from "./Ribbon"
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import Confetti from "./confetti";

async function loadTextures(imagArray) {
    let textureLoader = new THREE.TextureLoader();
    const promise = imagArray.map((texture) => {
        return new Promise((resolve, reject) => {
            textureLoader.load(texture.path, resolve, undefined, reject);
        });
    });

    return Promise.all(promise);
}

/**
 * Use this loader only while using models
 */
// async function gLTFLoader(gltfArr){
//     let loader = new GLTFLoader()
//     const promise = gltfArr.map((gltf)=>{
//         return new Promise((reslove,reject)=>{
//             loader.load(gltf.path,reslove,undefined,reject)
//         })
//     })

//     return await Promise.all(promise)

// }

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
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    //coding part starts----------------------------

    //Scene
    const scene = new THREE.Scene();
    let width = window.innerWidth;
    let height = window.innerHeight;

    //Camera
    const frustumSize = 10;
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    scene.add(dLight, ambientLight);

    let controls = new OrbitControls(camera,renderer.domElement)
    controls.enableDamping = true ;

    //Overlay
    function updateOverlay() {
        overlay.innerHTML = `
      <strong>Draw Calls:</strong> ${renderer.info.render.calls}<br>
      <strong>Frame:</strong> ${renderer.info.render.frame}<br>
      <strong>Textures:</strong> ${renderer.info.memory.textures}<br>
      <strong>Geometries:</strong> ${renderer.info.memory.geometries}
    `;
    }

    let clock = new THREE.Clock();
    let time = 0;

    //Ribbon class instance 
    let ribbon = new Ribbon(
        scene,
        frustumSize,
        width,
        height,
        texture[0]
    );
    let confetti = new Confetti(
        scene,
        frustumSize,
        width,
        height,
        texture[0]
    );

    function animate() {
        stats.begin()

        requestAnimationFrame(animate);
        controls.update()

        const delta = clock.getDelta();
        time += delta;

        ribbon.animateRibbons(time);
        confetti.animateConfetti(time)

        // ribbon.updateMixer(delta)

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

const ribbonArray = [
    {
        name: "ribbon",
        path: "Images/Ri_C1.png",
    },
];

loadTextures(ribbonArray)
.then((t) => {
  // Initialize the scene after textures loaded
  console.log(t)
  initScene(t)
})
.catch((e) => console.log(e));

//Models array
// const gltfArr = [
//     {
//         name: "ribbon",
//         path: "Models/Ribbon.gltf",
//     },
// ];

//Loading 3d models
// gLTFLoader(gltfArr)
//     .then((t) => {
//         console.log("gltf loaded---------------", t);
//         initScene(t);
//     })
//     .catch((e) => console.log("Error in loading Textures:-", e));