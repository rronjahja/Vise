import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { renderer } from './rendererSetup.js'; 


// Function to load a model into the scene at a specific position and scale
function loadModel(scene, modelPath, position, scale, type) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        gltf.scene.position.copy(position);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        gltf.scene.userData.type = type;
        scene.add(gltf.scene);
    }, undefined, (error) => {
        console.error('An error happened:', error);
    });
}

export function setupModelLoader(scene, camera) {
    // Assuming a horizontal plane for dropping objects
    const planeNormal = new THREE.Vector3(0, 1, 0);
    const plane = new THREE.Plane(planeNormal, 0);

    // Enable dragover event to allow dropping
    renderer.domElement.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    // Handle drop event to create models based on the dragged item
    renderer.domElement.addEventListener('drop', (event) => {
        event.preventDefault();
        const mouse = new THREE.Vector2(
            ((event.clientX / window.innerWidth) * 2 - 1),
            (-(event.clientY / window.innerHeight) * 2 + 1)
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);

        const modelType = event.dataTransfer.getData("text"); // Expecting 'house' or 'hotel'

        if (modelType === "house" || modelType === "hotel") {
            const position = intersectPoint; // The drop location
            const scale = { x: 5, y: 5, z: 5 }; // Example scale, adjust as needed
            loadModel(scene, `${modelType}.glb`, position, scale, modelType);
        }
    });

    // Prepare draggable elements for drag events
    const draggableElements = ['draggableHouse', 'draggableHotel'];
    draggableElements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('dragstart', (event) => {
                // Sets the type of model being dragged
                event.dataTransfer.setData("text", id.replace('draggable', '').toLowerCase());
            });
        }
    });
}
