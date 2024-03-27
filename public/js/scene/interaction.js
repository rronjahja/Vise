// scene/interaction.js
import { scene, camera, renderer } from './setup';
let isDragging = false;
let dragStartPosition = new THREE.Vector2();
let selectedObject = null;

function enableDragControls() {
    window.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            renderer.domElement.addEventListener('mousedown', onMouseDown, false);
            window.addEventListener('mouseup', onMouseUp, false);
            window.addEventListener('mousemove', onMouseMove, false);
        }
    });

    window.addEventListener('keyup', function(event) {
        if (event.code === 'Space') {
            renderer.domElement.removeEventListener('mousedown', onMouseDown, false);
            window.removeEventListener('mouseup', onMouseUp, false);
            window.removeEventListener('mousemove', onMouseMove, false);
        }
    });
}

function onMouseDown(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        if (object.userData.draggable) {
            selectedObject = object;
            isDragging = true;
            dragStartPosition.set(event.clientX, event.clientY);
        }
    }
}

function onMouseMove(event) {
    if (!isDragging || !selectedObject) return;

    const dx = event.clientX - dragStartPosition.x;
    const dy = event.clientY - dragStartPosition.y;

    selectedObject.position.x += dx * 0.01;
    selectedObject.position.z -= dy * 0.01; // Assuming the plane is on the XZ axis

    dragStartPosition.set(event.clientX, event.clientY);
}

function onMouseUp(event) {
    isDragging = false;
}

export { enableDragControls };
