// scene/events.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { scene, camera, renderer } from './setup';

let isDragging = false;
let selectedObject = null;
const loader = new GLTFLoader();

function onDrop(event) {
    event.preventDefault();
    const modelType = event.dataTransfer.getData("text");
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        loadModel(modelType, point);
    }
}

function loadModel(type, position) {
    const modelPath = type === "house" ? '../../assets/models/house.glb' : '../../assets/models/hotel.glb';
    const scale = type === "house" ? { x: 6, y: 6, z: 6 } : { x: 2, y: 2, z: 2 };

    loader.load(modelPath, function(gltf) {
        gltf.scene.position.copy(position);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        scene.add(gltf.scene);
    }, undefined, function(error) {
        console.error('An error happened:', error);
    });
}

renderer.domElement.addEventListener('dragover', function(event) {
    event.preventDefault();
}, false);

renderer.domElement.addEventListener('drop', onDrop, false);

document.getElementById('draggableHouse').addEventListener('dragstart', function(event) {
    event.dataTransfer.setData("text", "house");
}, false);

document.getElementById('draggableHotel').addEventListener('dragstart', function(event) {
    event.dataTransfer.setData("text", "hotel");
}, false);
