import * as THREE from 'three';
import { camera,  renderer } from './scene.js';

// Function to open the modal based on 3D object position
function openModal(type, position) {
    const vector = position.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;

    const modal = document.getElementById('infoModal');
    modal.style.top = `${y}px`;
    modal.style.left = `${x}px`;
    modal.style.display = 'block';
}

// Setup event listeners for modal close and form submission
document.addEventListener('DOMContentLoaded', function() {
    const closeButton = document.querySelector('.modal-close');
    closeButton.addEventListener('click', function() {
        document.getElementById('infoModal').style.display = 'none';
    });

    document.getElementById('sendButton').addEventListener('click', function() {
        // Implement what happens when the 'Get' button is clicked
    });
});

// Integrate this openModal function with your existing 3D object interaction logic
