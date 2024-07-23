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

export const loader = new GLTFLoader();
