import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


document.addEventListener('DOMContentLoaded', function () {
    // Elements from the footer form
    const urlInput = document.getElementById('urlInputFooter');
    const endpointInput = document.getElementById('endpointFooter');
    const sidebar = document.getElementById('responseSidebar');

    // Footer panel elements
    const footerPanel = document.getElementById('footerConfigPanel');
    const footerClose = document.getElementById('footerClose');
    const configButton = document.getElementById('configButton');

    // Show the footer configuration panel on config button click
    configButton.addEventListener('click', function () {
        footerPanel.classList.add('expanded');
    });

    // Close the footer panel
    footerClose.addEventListener('click', function () {
        footerPanel.classList.remove('expanded');
    });

    let extractedFieldValue = '';
    let extractedFieldName = '';

    document.addEventListener('fieldValueExtracted', async function (event) {
        extractedFieldValue = event.detail.fieldValue;
        extractedFieldName = event.detail.fieldNameOrigin;
        await processFieldValue(extractedFieldValue, extractedFieldName);
    });

    async function processFieldValue(fieldValue, fieldName) {
        const url = urlInput.value.trim();
        const endpoint = endpointInput.value.trim();
        const fullUrl = `${url}/${endpoint}?$filter=OrderID eq ${fieldValue}`;

        if (url && endpoint) {
            if (fieldName.trim() === 'Order') {
                try {
                    const response = await fetch('https://vise-backend-sleepy-leopard-to.cfapps.eu20-001.hana.ondemand.com/fetch-url', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Test123'
                        },
                        body: JSON.stringify({ url: fullUrl })
                    });
                    const orderData = await response.json();

                    const orderDetailsUrl = `${url}/Order_Details?$filter=OrderID eq ${fieldValue}`;
                    const response2 = await fetch('https://vise-backend-sleepy-leopard-to.cfapps.eu20-001.hana.ondemand.com/fetch-url', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Test123'
                        },
                        body: JSON.stringify({ url: orderDetailsUrl })
                    });
                    const orderDetailsData = await response2.json();

                    const productsData = await fetchProductDetails(url, orderDetailsData.value);

                    displayProducts(productsData);
                } catch (error) {
                    console.error('Error:', error);
                    sidebar.textContent = `Error: ${error}`;
                }
            } else {
                console.log('Both URL and Endpoint are required');
            }
        }
    }

    async function fetchProductDetails(baseUrl, orderDetails) {
        const productDetailsPromises = orderDetails.map(async item => {
            const productUrl = `${baseUrl}/Products?$filter=ProductID eq ${item.ProductID}`;
            const response = await fetch('https://vise-backend-sleepy-leopard-to.cfapps.eu20-001.hana.ondemand.com/fetch-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Test123'
                },
                body: JSON.stringify({ url: productUrl })
            });
            const productData = await response.json();
            return {
                ...item,
                ProductName: productData.value[0].ProductName
            };
        });

        return Promise.all(productDetailsPromises);
    }

    function displayProducts(productsData) {
        sidebar.innerHTML = ''; // Clear previous content

        productsData.forEach(item => {
            const productContainer = document.createElement('div');
            productContainer.className = 'product-container';

            const productImage = document.createElement('img');
            productImage.src = '/assets/images/Product.png';
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
    }
});

function showMessage(type, position) {
    // Convert the 3D position to 2D screen coordinates
    const vector = position.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;

    const footerPanel = document.getElementById('footerConfigPanel');
    footerPanel.style.position = 'absolute';
    footerPanel.style.top = `${y}px`;
    footerPanel.style.left = `${x}px`;

    // Show the footer configuration panel
    footerPanel.classList.add('expanded');
}

export { showMessage };


export function showModal(userData) {
    const modal = document.getElementById('infoModal');
    const modalCanvas = document.getElementById('modalCanvas');

    if (userData && userData.type === "hangar") {
        // Display the modal
        modal.style.display = 'block';

        // Close modal when clicking on the close button
        const closeButton = document.querySelector('.model-modal .modal-close');
        closeButton.onclick = () => modal.style.display = 'none';

        // Close modal when clicking outside of the modal content
        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };

        // Render the warehouse model in the modal's canvas
        // renderModelInModal('assets/models/warehouse/scene.gltf', modalCanvas);
    }
}

function renderModelInModal(modelPath, canvas) {
    const modalRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    modalRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const modalScene = new THREE.Scene();
    const modalCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    modalCamera.position.set(0, 2, 10); // Adjust the camera position as needed

    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();

    modalScene.add(ambientLight);
    modalScene.add(directionalLight);

    const modalControls = new OrbitControls(modalCamera, modalRenderer.domElement);
    modalControls.enableDamping = true;
    modalControls.dampingFactor = 0.05;

    const modalLoader = new GLTFLoader();
    modalLoader.load(modelPath, function (gltf) {
        modalScene.add(gltf.scene);

        // Adjust the model's position and scale to fit the canvas
        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());

        gltf.scene.position.x += (gltf.scene.position.x - center.x);
        gltf.scene.position.y += (gltf.scene.position.y - center.y);
        gltf.scene.position.z += (gltf.scene.position.z - center.z);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = modalCamera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Zoom out a bit further
        modalCamera.position.z = cameraZ;

        const minZ = bbox.min.z;
        const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

        modalCamera.far = cameraToFarEdge * 3;
        modalCamera.updateProjectionMatrix();

        // Animation loop
        const animate = function () {
            requestAnimationFrame(animate);
            modalControls.update(); // Update controls for interactions
            modalRenderer.render(modalScene, modalCamera);
        };
        animate();
    }, undefined, function (error) {
        console.error('An error happened', error);
    });
}
