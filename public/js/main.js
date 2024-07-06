import { animate } from './scene.js';
import './userInteractions.js'; // this script will automatically execute and bind event listeners

document.addEventListener('DOMContentLoaded', () => {
    animate(); // Start the animation loop when the DOM is fully loaded
});

// This could be in a JS file that runs on page load


function setupModal() {
    const modal = document.getElementById('infoModal');
    const closeButton = document.querySelector('.modal-close');
    const sendButton = document.getElementById('sendButton');

    closeButton.onclick = () => modal.style.display = 'none';
    sendButton.onclick = () => submitModalData();
}

function submitModalData() {
    const urlInput = document.getElementById('urlInput').value.trim();
    const endpoint = document.getElementById('endpoint').value.trim();
    // Add further logic for what happens when the data is submitted
}

document.addEventListener('DOMContentLoaded', function () {
    const footerPanel = document.getElementById('footerConfigPanel');
    const footerToggle = document.getElementById('footerToggle');
    const footerClose = document.getElementById('footerClose');
    const configButton = document.getElementById('configButton');

    footerToggle.addEventListener('click', function () {
        footerPanel.classList.toggle('expanded');
    });

    footerClose.addEventListener('click', function () {
        footerPanel.classList.remove('expanded');
    });

    configButton.addEventListener('click', function () {
        footerPanel.classList.add('expanded');
    });
});
