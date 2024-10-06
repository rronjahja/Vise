import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

camera.position.set(0, 250, 400);
scene.background = new THREE.Color(0xdddddd);

const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 1.0, metalness: 0.0, emissive: 0x999999 });
export const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);

// Removed GridHelper
const gridHelper = new THREE.GridHelper(500, 100);
scene.add(gridHelper);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Adding the new Point Light
const pointLight = new THREE.PointLight(0xffffff, 1, 100); // color, intensity, distance
pointLight.position.set(10, 10, 10); // Adjust position as needed
scene.add(pointLight);
export const loader = new GLTFLoader();

loader.load('assets/models/manufacturing.gltf', (gltf) => {
    const hotelModel = gltf.scene;

    // Set position and scale for the hotel
    hotelModel.position.set(65, 0, 32); // You can adjust these values
    hotelModel.scale.set(1, 1, 1);    // Adjust the size if needed

    scene.add(hotelModel);
});


// Removed PointLightHelper
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 1); // size of the helper
// scene.add(pointLightHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // color, intensity
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1); // color, intensity
spotLight.position.set(15, 40, 35); // Adjust position as needed
spotLight.castShadow = true; // Enable shadows
scene.add(spotLight);

// Removed SpotLightHelper
// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);

//Warehouse
loadModel('hangar.glb', {x: -16.60166681378321, y: 0, z: 45}, { x: 2, y: 2, z: 2 }, "hangar");
loadModel('hangar.glb', {x: 65.0346882550666, y: 0, z: 40}, { x: 2, y: 2, z: 2 }, "hangar");

//hotel
loadModel('hotel.glb', {x: -110.57993255587954, y: 0, z: 42.46597334333154}, { x: 2, y: 2, z: 2 }, "hotel");
loadModel('hotel.glb', {x: 15.45891274836319, y: 0, z: -69.41945442354302}, { x: 2, y: 2, z: 2 }, "hotel");
loadModel('hotel.glb', {x: 173.32851756510604, y: 0, z: -79.14178591836946}, { x: 2, y: 2, z: 2 }, "hotel");

//house
loadModel('house.glb', {x: 17.027806314479022, y: 0, z: 162.81631682799264}, { x: 6, y: 6, z: 6 }, "house");
loadModel('house.glb', {x: -92.12565364061959, y: 0, z: 138.80955152195813}, { x: 6, y: 6, z: 6 }, "house");
loadModel('house.glb', {x: -117.51723168324173, y:0, z: -34.904573421742725}, { x: 6, y: 6, z: 6 }, "house");
loadModel('house.glb', {x: -46.94985467434546, y: 0, z: -74.70767058802954}, { x: 6, y: 6, z: 6 }, "house");
loadModel('house.glb', {x: 143.7872581286227, y: 0, z: -7.92848917009519}, { x: 6, y: 6, z: 6 }, "house");
loadModel('house.glb', {x: 145.5686462078985, y: 0, z: 89.65989024929168}, { x: 6, y: 6, z: 6 }, "house");

//manufacturing
loadModel('factory/manufacturing.gltf', {x: -75, y: 0, z: 162.77161988260804}, {  x: 1, y: 1, z: 1  }, "manufacturing");
loadModel('factory/manufacturing.gltf', {x: -160.5143121295169, y: 0, z: -146.97023022013923}, {  x: 1, y: 1, z: 1  }, "manufacturing");
loadModel('factory/manufacturing.gltf', {x: 97.19184873579243, y: 0, z: -119.96841627976325}, {  x: 1, y: 1, z: 1 }, "manufacturing");
loadModel('factory/manufacturing.gltf', {x: 92.10565270882847, y: 0, z: 144.08279554339694}, {  x: 1, y: 1, z: 1  }, "manufacturing");


function loadModel(modelName, position, scale, type) {
    const fullPath = `assets/models/${modelName}`;
    console.log("Loading model from:", fullPath);
    loader.load(fullPath, function (gltf) {
        gltf.scene.position.copy(position);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        gltf.scene.userData.type = type;
        gltf.scene.name = type;  // Ensure the name is set for easy reference
        scene.add(gltf.scene);
        // updateCoordinates();
    }, undefined, function (error) {
        console.error(`An error happened loading the GLTF file from ${fullPath}:`, error);
    });
}

export function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// export const loader = new GLTFLoader();
