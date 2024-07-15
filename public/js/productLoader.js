import * as THREE from 'three';
import { loader, scene } from './scene.js';

export function fetchAndLoadProducts(apiEndpoint) {
    fetch(apiEndpoint)
        .then(response => response.json())
        .then(data => {
            data.products.forEach(product => {
                const { modelPath, position, scale, type } = product;
                loadProduct(modelPath, position, scale, type);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function loadProduct(modelPath, position, scale, type) {
    loader.load(modelPath, function (gltf) {
        const product = gltf.scene;
        product.position.copy(new THREE.Vector3(position.x, position.y, position.z));
        product.scale.set(scale.x, scale.y, scale.z);
        product.userData.type = type;
        product.name = type;  // Ensure the name is set for easy reference
        scene.add(product);
    }, undefined, function (error) {
        console.error(`An error happened loading the GLB file from ${modelPath}:`, error);
    });
}
