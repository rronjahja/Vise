import { renderer } from '../scene/renderer';

renderer.domElement.addEventListener('click', (event) => {
    // Logic for handling clicks on the renderer's canvas
    console.log('Renderer canvas clicked!');
});


document.addEventListener('DOMContentLoaded', function() {
    const draggableHouse = document.getElementById('draggableHouse');
    const draggableHotel = document.getElementById('draggableHotel');

    // Event listener for House
    draggableHouse.addEventListener('click', function() {
        openModal('house');
    });

    // Event listener for Hotel
    draggableHotel.addEventListener('click', function() {
        openModal('hotel');
    });
});

function openModal(type) {
    const modal = document.createElement('iframe');
    modal.src = 'modal.html';
    modal.style.position = 'fixed';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.border = 'none';
    document.body.appendChild(modal);

    modal.onload = function() {
        const doc = modal.contentDocument;
        const closeButton = doc.querySelector('.close-button');
        const urlInput = doc.getElementById('urlInput');
        urlInput.value = type === 'house' ? 'https://example.com/houses' : 'https://example.com/hotels';

        closeButton.onclick = function() {
            document.body.removeChild(modal);
        };

        const sendButton = doc.getElementById('sendButton');
        sendButton.onclick = function() {
            const endpoint = doc.getElementById('endpoint').value;
            fetch(`/fetch-url?endpoint=${endpoint}`)
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));
        };
    };
}
