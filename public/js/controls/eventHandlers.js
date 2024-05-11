import * as THREE from 'three';
import { initScene} from '../scene/camera'; // Assuming these are exported from sceneSetup.js

const { scene, camera, renderer } = initScene();
let selectedObject = null;
// Here, add your event handling functions. For example:
export function setupEventHandlers() {
    // Drag and Drop for 3D objects
    renderer.domElement.addEventListener('dragover', event => event.preventDefault());
    renderer.domElement.addEventListener('drop', onDrop);

    // Interaction with 3D objects, e.g., select, move
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // Additional event listeners can be added here
}
// Assuming your renderer's canvas can be identified by renderer.domElement
renderer.domElement.addEventListener('dragover', function(event) {
    event.preventDefault(); // Allow the drop
});

renderer.domElement.addEventListener('drop', function(event) {
    event.preventDefault();
    onDrop(event, event.dataTransfer.getData("text"));
});

let isDragging = false;
let dragStartPosition = new THREE.Vector2();
let isSpacebarPressed = false;

window.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {

        isSpacebarPressed = true;
    }
});

window.addEventListener('keyup', function(event) {
    if (event.code === 'Space') {
        isSpacebarPressed = false;
    }
});


renderer.domElement.addEventListener('mousedown', function(event) {
    if (!isSpacebarPressed) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    if (selectedObject) {
        controls.enabled = false; // Disable OrbitControls
        isDragging = true;
    }
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let object = intersects[0].object;

        // Assuming the object to move is the root object of the clicked mesh
        while (object.parent !== null && object.parent !== scene) {
            object = object.parent;
        }

        // Check if the selected object is movable (house or hotel)
        if (object.userData.type === 'house' || object.userData.type === 'hotel') {
            selectedObject = object; // Mark for repositioning
            isDragging = true;
        }
    }
});

renderer.domElement.addEventListener('mousemove', function(event) {
    if (!isDragging || !selectedObject) return;
    controls.enabled = false;
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Assuming you're moving the object along a plane (e.g., the ground plane)
    const planeNormal = new THREE.Vector3(0, 1, 0); // Adjust this normal to match your plane's orientation
    const plane = new THREE.Plane(planeNormal, 0); // The constant here (0) should be adjusted based on your plane's position
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    selectedObject.position.copy(intersectPoint);
});


renderer.domElement.addEventListener('mouseup', function(event) {
    if (isDragging) {
        isDragging = false;
        selectedObject = null; // Optionally deselect the object
        controls.enabled = true; // Re-enable OrbitControls
    }
});


document.getElementById('draggableHouse').addEventListener('dragstart', function(event) {
    event.dataTransfer.setData("text", "house");
    selectedObject = null; // Clear any selection
});

document.getElementById('draggableHotel').addEventListener('dragstart', function(event) {
    event.dataTransfer.setData("text", "hotel");
    selectedObject = null; // Clear any selection
});

renderer.domElement.addEventListener('dblclick', function(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let selected = intersects[0].object;

        // Traverse up to find the root object
        while (selected.parent !== null && selected.parent !== scene) {
            selected = selected.parent;
        }

        // Check if the selected object is a house or hotel
        if (selected.userData.type === 'house' || selected.userData.type === 'hotel') {
            // Use the position of the intersected point for more accuracy
            showMessage(selected.userData.type.charAt(0).toUpperCase() + selected.userData.type.slice(1), intersects[0].point);
        } 
    }
});


function onDrop(event) {
    event.preventDefault();
    const modelType = event.dataTransfer.getData("text");
    let rect = renderer.domElement.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    let y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObject(planeMesh);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        if (modelType) { // New object creation
            const scale = modelType === "house" ? {x: 6, y: 6, z: 6} : {x: 2, y: 2, z: 2};
            loadModel(`${modelType}.glb`, point, scale, modelType);
        } else if (selectedObject) { // Repositioning existing object
            selectedObject.position.copy(point);
            selectedObject = null; // Clear selection after repositioning
        }
    }
}