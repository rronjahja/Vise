// scene/events.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { scene, camera, renderer } from './setup';
import {controls} from './controls';


let isDragging = false;
let selectedObject = null;
const loader = new GLTFLoader();
let dragStartPosition = new THREE.Vector2();
let isSpacebarPressed = false;




function onDrop(event) {
    event.preventDefault();
    const modelType = event.dataTransfer.getData("text");
    console.log(modelType);
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

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

function loadModel(type, position) {
    const modelPath = type === "house" ? '../../assets/models/house.glb' : '../../assets/models/hotel.glb';
    const scale = type === "house" ? { x: 6, y: 6, z: 6 } : { x: 2, y: 2, z: 2 };
    let sType = type;
    loader.load(modelPath, function(gltf) {


        gltf.scene.position.copy(position);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        gltf.scene.userData.type = sType;
        scene.add(gltf.scene);
    }, undefined, function(error) {
        console.error('An error happened:', error);
    });
}

renderer.domElement.addEventListener('mouseup', function(event) {
    if (isDragging) {
        isDragging = false;
        selectedObject = null; // Optionally deselect the object
        controls.enabled = true; // Re-enable OrbitControls
    }
});

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
    console.log(selectedObject);
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
        if (object.userData.type === 'house' || object.userData.type === 'hotel' ||object.userData.type === 'hangar' ) {
            selectedObject = object; // Mark for repositioning
            isDragging = true;
        }
    }
});

renderer.domElement.addEventListener('dragover', function(event) {
    event.preventDefault();
}, false);

renderer.domElement.addEventListener('drop', onDrop, false);

document.getElementById('draggableHouse').addEventListener('dragstart', function(event) {
    event.dataTransfer.setData("text", "house");
    selectedObject = null; // Clear any selection
});

document.getElementById('draggableHotel').addEventListener('dragstart', function(event) {
    event.dataTransfer.setData("text", "hotel");
    selectedObject = null; // Clear any selection
});
// document.getElementById('draggableHangar').addEventListener('dragstart', function(event) {
//     event.dataTransfer.setData("text", "hangar");
//     selectedObject = null; // Clear any selection
// });

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
        
        console.log(selected);
        // Traverse up to find the root object
        while (selected.parent !== null && selected.parent !== scene) {
            selected = selected.parent;
        }

        // Check if the selected object is a house or hotel
        if (selected.userData.type === 'house' || selected.userData.type === 'hotel' || selected.userData.type === 'hangar') {
            // Use the position of the intersected point for more accuracy
            showMessage(selected.userData.type.charAt(0).toUpperCase() + selected.userData.type.slice(1), intersects[0].point);
        }
    }
});


function showMessage(type, position) {
    // Convert the 3D position to 2D screen coordinates
    const vector = position.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;

    // Create a new div element for the message
    // Assuming 'x', 'y', and 'type' variables are defined earlier in your code
// For demonstration, let's assume some values for 'x', 'y', and 'type'



// Create a new div element for the message
const messageDiv = document.createElement('div');
messageDiv.style.position = 'absolute';
messageDiv.style.top = `${y}px`;
messageDiv.style.left = `${x}px`;
messageDiv.style.width = '300px';
messageDiv.style.height = '180px'; // Adjusted to 'auto' for dynamic content height
messageDiv.style.padding = '20px';
messageDiv.style.backgroundColor = '#f9f9f9';
messageDiv.style.border = '1px solid #ccc';
messageDiv.style.borderRadius = '8px';
messageDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
messageDiv.style.display = 'flex';
messageDiv.style.flexDirection = 'column';
messageDiv.style.justifyContent = 'space-between';
messageDiv.style.zIndex = '1000';

// Create a close button
const closeButton = document.createElement('button');
closeButton.innerHTML = '&times;'; // Using HTML entity for 'X'
closeButton.style.position = 'absolute';
closeButton.style.top = '5 px';
closeButton.style.right = '10px';
closeButton.style.border = 'none';
closeButton.style.background = 'none';
closeButton.style.cursor = 'pointer';
closeButton.style.fontSize = '20px';
closeButton.style.fontWeight = 'bold';

// Append the close button to the messageDiv
messageDiv.appendChild(closeButton);

// Close button event listener
closeButton.onclick = function() {
    document.body.removeChild(messageDiv);
};

// Create a form
const form = document.createElement('form');
form.style.display = 'flex';
form.style.flexDirection = 'column';

// Create input fields
const input1 = document.createElement('input');
input1.id = 'urlInput';
input1.type = 'text';
input1.placeholder = 'Url - https://';
input1.style.marginBottom = '10px';
input1.style.top = '10px';

const input2 = document.createElement('input');
input2.id = "endpoint";
input2.type = 'text';
input2.placeholder = 'Endpoint';
input2.style.marginBottom = '10px';

// Create a send button
const sendButton = document.createElement('button');
sendButton.type = 'button';
sendButton.innerText = 'Get';
sendButton.style.marginTop = '10px';


// Append inputs and button to the form
form.appendChild(input1);
form.appendChild(input2);
form.appendChild(sendButton);

// Append the form to the messageDiv
messageDiv.appendChild(form);

// Append the div to the body
document.body.appendChild(messageDiv);

// Send button onclick function
sendButton.onclick = async function() {
    const url = input1.value.trim();
    const endpoint = input2.value.trim();
    const fullUrl = `${url}/${endpoint}`;

    if (url && endpoint) {
        try {
            const response = await fetch('/fetch-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: fullUrl })
            });
            const data = await response.json();
            console.log(data); // Debugging: Log the entire response
            const sidebar = document.getElementById('responseSidebar');

            if (data.value && Array.isArray(data.value)) {
                sidebar.innerHTML = ''; // Clear previous content

                data.value.forEach(item => {
                    const productContainer = document.createElement('div');
                    productContainer.className = 'product-container';

                    const productImage = document.createElement('img');
                    productImage.src = 'Product.png';
                    productImage.className = 'product-image';
                    productContainer.appendChild(productImage);

                    const productName = document.createElement('div');
                    productName.className = 'product-name';
                    productName.textContent = item.ProductName;
                    productContainer.appendChild(productName);

                    sidebar.appendChild(productContainer);
                });

                // Ensure the sidebar is visible
                sidebar.style.width = '250px';
            } else {
                console.log('The response does not contain a value array.');
                // Optionally, update the sidebar to show an error or message
                sidebar.textContent = 'No products found.';
            }
        } catch (error) {
            console.error('Error:', error);
            // Optionally, update the sidebar to show the error
            sidebar.textContent = `Error: ${error}`;
        }
    } else {
        console.log('Both URL and Endpoint are required');
    }
};


// Style adjustments for inputs and button for consistency
[input1, input2, sendButton].forEach(element => {
    element.style.padding = '10px';
    element.style.borderRadius = '4px';
    element.style.border = '1px solid #ddd';
    element.style.width = '100%'; // Ensure full width within the form
});

// Additional styling for the send button
sendButton.style.color = 'white';
sendButton.style.backgroundColor = '#007bff';
sendButton.style.cursor = 'pointer';
sendButton.onmouseover = function() {
    sendButton.style.backgroundColor = '#0056b3';
};
sendButton.onmouseout = function() {
    sendButton.style.backgroundColor = '#007bff';
};

}

