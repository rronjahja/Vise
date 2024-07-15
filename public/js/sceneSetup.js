import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { createCustomControls } from './controls.js';

export function renderModelInModal(warehousePath, goods, canvas) {
    const modalRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    modalRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const modalScene = new THREE.Scene();
    const modalCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    modalCamera.position.set(0, 2, 15); // Lowered the camera position to be closer to the ground

    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Brighter ambient light
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(5, 10, 7.5).normalize();
    directionalLight2.position.set(-5, -10, -7.5).normalize();

    modalScene.add(ambientLight);
    modalScene.add(directionalLight1);
    modalScene.add(directionalLight2);

    const controls = createCustomControls(modalCamera, modalRenderer.domElement);

    const loader = new GLTFLoader();
    const fontLoader = new FontLoader();
    let goods8;

    // Load the built-in font
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {

        // Load the warehouse model
        loader.load(warehousePath, function (gltf) {
            const warehouse = gltf.scene;
            modalScene.add(warehouse);

            // Function to load a good model
            const loadGood = (path, position) => {
                return new Promise((resolve, reject) => {
                    loader.load(path, function (gltf) {
                        const good = gltf.scene;
                        good.position.copy(position);
                        warehouse.add(good);

                        // Check if this is goods8
                        if (path.includes('goods8.glb')) {
                            goods8 = good;
                            // Create text geometry for the label
                            const textGeometry = new TextGeometry('Product4', {
                                font: font,
                                size: 0.5,
                                height: 0.1,
                            });

                            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

                            // Position the text above the goods8 model
                            textMesh.position.set(0, 1, 0); // Adjust as needed
                            goods8.add(textMesh);
                        }

                        resolve();
                    }, undefined, function (error) {
                        console.error(`An error happened loading the model from ${path}:`, error);
                        reject(error);
                    });
                });
            };

            // Load all goods and add them to the warehouse
            Promise.all(goods.map(g => loadGood(g.path, g.position)))
                .then(() => {
                    // Animation loop
                    const animate = function () {
                        requestAnimationFrame(animate);
                        controls.update(); // Update controls for interactions
                        modalRenderer.render(modalScene, modalCamera);
                    };
                    animate();
                })
                .catch(error => console.error('An error happened loading one of the goods:', error));
        }, undefined, function (error) {
            console.error('An error happened loading the warehouse:', error);
        });
    });
}
