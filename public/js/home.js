
const scene = new THREE.Scene();
const loader = new THREE.GLTFLoader();
// const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let selectedObject = null;

// Create a plane geometry for the ground
const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide,
                                                        roughness : 1.0,metalness :0.0,
                                                        emissive : 0x999999, wireframeLinewidth  :5 });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
planeMesh.receiveShadow = false; // Optional, for receiving shadows
scene.add(planeMesh);
scene.background = new THREE.Color(0xdddddd); // Set background to white

// Camera setup
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 250, 400); // Adjust camera position as needed

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grid helper (size: 500x500, divisions: 50)
const gridHelper = new THREE.GridHelper(500, 50);
scene.add(gridHelper);

// OrbitControls setup
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: for smoother drag interactions
controls.dampingFactor = 0.05;

// Resize listener
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
    renderer.render(scene, camera);
}
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.75); // Increase ambient light intensity
// scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Increase directional light intensity
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);


animate();






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

function loadModel(modelPath, position, scale, type) {
    loader.load(modelPath, function(gltf) {
        gltf.scene.position.copy(position);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        gltf.scene.userData.type = type; // Ensure this is set
        scene.add(gltf.scene);
    }, undefined, function(error) {
        console.error('An error happened:', error);
    });
}



var sidebarToggleButton = document.getElementById('toggle-sidebar');
if (sidebarToggleButton) {
    sidebarToggleButton.addEventListener('click', function () {

        console.log("hi")
        var sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');

        if (sidebar.classList.contains('collapsed')) {
            this.innerHTML = "&#x3e;"; // Unicode for >
        } else {
            this.innerHTML = "&#x3c;"; // Unicode for <
        }
    });
} else {
    console.error('toggle-sidebar button not found.');
}


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



let startPoint = null;
let endPoint = null;

renderer.domElement.addEventListener('click', function(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let selected = intersects[0].object;

        while (selected.parent !== null && selected.parent !== scene) {
            selected = selected.parent;
        }

        // Toggle between setting start and end points
        if (!startPoint) {
            startPoint = intersects[0].point.clone(); // Set startPoint to the intersection point
            console.log('Start point set:', startPoint);
        } else if (!endPoint) {
            endPoint = intersects[0].point.clone(); // Set endPoint to the intersection point
            console.log('End point set:', endPoint);
        } else {
            startPoint = intersects[0].point.clone(); // Reset startPoint to the new intersection point
            endPoint = null; // Clear endPoint
            console.log('Start point reset:', startPoint);
        }
    }
});


loader.load('truck.glb', function(gltf) {
    gltf.scene.name = 'truck';
    scene.add(gltf.scene);
    gltf.scene.rotation.y = Math.PI; // Rotate 180 degrees to face the opposite direction
    gltf.scene.visible = false;
    
});



// Example of setting startPoint and endPoint. Ensure they are THREE.Vector3 instances
// Assuming startPoint and endPoint are already defined in your context as THREE.Vector3 objects
// If they are not, you might need to instantiate them as new THREE.Vector3(x, y, z) based on your application's logic
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('simulateButton').addEventListener('click', function() {

        const truck = scene.getObjectByName('truck');

        if (!truck) {
            console.error('Truck model not found in the scene.');
            return;
        }
        
        // Scale the truck down if it's too large
        truck.scale.set(0.3, 0.3, 0.3); // Adjust scale values as needed, smaller values mean a smaller model
        
        // Adjust the truck's vertical position if it's floating
        // This is just an example; the exact value depends on your scene's scale
        truck.position.y = -0.5; // Adjust this value so the truck sits on the ground plane
        
        // Rotate the truck to face the correct direction
        // Rotates 90 degrees counterclockwise around the y-axis
        truck.rotation.y = Math.PI / 2;
        
        // Update truck's position and start the animation towards the endpoint
        document.getElementById('simulateButton').addEventListener('click', function() {
            const truck = scene.getObjectByName('truck');
            if (!truck || !startPoint || !endPoint) {
                console.error('Required elements are not correctly set up.');
                return;
            }
        
            // Reset traveled distance for this simulation
            let traveled = 0;
            const delta = new THREE.Vector3().subVectors(endPoint, startPoint); // Difference between end and start
            const distance = delta.length(); // Total distance to travel
            const direction = delta.normalize(); // Direction vector
            const speed = 0.7; // Constant speed
        
            // Ensure the truck is visible and located at the startPoint
            truck.visible = true;
            truck.position.set(startPoint.x, startPoint.y, startPoint.z); // Adjust y as needed to align with your ground plane
            truck.rotation.y = Math.atan2(endPoint.x - startPoint.x, endPoint.z - startPoint.z) - Math.PI / 2 + Math.PI;
        
            // Cancel any existing animation loop to ensure only one runs at a time
            if (window.currentAnimationId) {
                cancelAnimationFrame(window.currentAnimationId);
            }
        
            // Define the animation function
            function animateTruck() {
                if (traveled < distance) {
                    window.currentAnimationId = requestAnimationFrame(animateTruck);
                    truck.position.addScaledVector(direction, speed);
                    traveled += speed;
                } else {
                    cancelAnimationFrame(window.currentAnimationId); // Stop the animation loop
                    truck.visible = false; // Hide the truck at the end of the simulation
                }
            }
        
            // Start the animation
            animateTruck();
        });
        
});
});