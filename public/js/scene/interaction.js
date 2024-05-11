// interaction.js
import { scene, camera, renderer } from './setup';
import * as THREE from 'three';

let isDragging = false;
let dragStartPosition = new THREE.Vector2();
let selectedObject = null;
let isSpacebarPressed = false;

function enableDragControls() {
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);
}

function disableDragControls() {
    renderer.domElement.removeEventListener('mousedown', onMouseDown, false);
    window.removeEventListener('mousemove', onMouseMove, false);
    window.removeEventListener('mouseup', onMouseUp, false);
    isDragging = false;
    selectedObject = null;
}

function onMouseDown(event) {
    if (!isSpacebarPressed) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0 && intersects[0].object.userData.draggable) {
        selectedObject = intersects[0].object;
        isDragging = true;
        dragStartPosition.set(event.clientX, event.clientY);
    }
}

function onMouseMove(event) {
    if (!isDragging || !selectedObject) return;

    const dx = event.clientX - dragStartPosition.x;
    const dy = event.clientY - dragStartPosition.y;

    selectedObject.position.x += dx * 0.01;
    selectedObject.position.z -= dy * 0.01;

    dragStartPosition.set(event.clientX, event.clientY);
}

function onMouseUp(event) {
    isDragging = false;
}

// Keyboard event listeners to toggle drag controls based on the spacebar
window.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        isSpacebarPressed = true;
        enableDragControls();
    }
});

window.addEventListener('keyup', function(event) {
    if (event.code === 'Space') {
        isSpacebarPressed = false;
        disableDragControls();
    }
});
