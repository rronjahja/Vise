import { animate } from './scene.js';
import './userInteractions.js';
import './messageModule.js';
import { showModal } from './modal.js';

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
    const footerPanel = document.getElementById('footerPanel');
    const footerToggle = document.querySelector('.footer-toggle');
    
    // Check if both the footer panel and toggle button exist before proceeding
    if (footerPanel && footerToggle) {
        // Add a click event listener to the footer toggle button
        footerToggle.addEventListener('click', function () {
            // Manually toggle the 'expanded' class
            if (footerPanel.className.includes('expanded')) {
                footerPanel.className = footerPanel.className.replace('expanded', '').trim();
            } else {
                footerPanel.className += ' expanded';
            }
        });
    } else {
        console.error('Footer panel or toggle button not found!');
    }
});
