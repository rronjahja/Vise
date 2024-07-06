import { camera, controls, renderer, scene, planeMesh, loader } from './scene.js';

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
                    const response = await fetch('http://localhost:3000/fetch-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: fullUrl })
                    });
                    const orderData = await response.json();

                    const orderDetailsUrl = `${url}/Order_Details?$filter=OrderID eq ${fieldValue}`;
                    const response2 = await fetch('http://localhost:3000/fetch-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch('http://localhost:3000/fetch-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
