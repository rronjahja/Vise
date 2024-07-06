import * as THREE from 'three';
import { camera, controls, renderer, scene, planeMesh, loader } from './scene.js';
import { showMessage } from './messageModule.js';

let isDragging = false;
let selectedObject = null;
let isSpacebarPressed = false;

renderer.domElement.addEventListener('dragover', event => event.preventDefault());

renderer.domElement.addEventListener('drop', event => {
    event.preventDefault();
    const modelType = event.dataTransfer.getData("text");
    onDrop(event, modelType);
});

window.addEventListener('keydown', function (event) {
    if (event.code === 'Space' && selectedObject) {
        isSpacebarPressed = true;
        controls.enabled = false;
        console.log("Ready to move selected object.");
    }
});

window.addEventListener('keyup', function (event) {
    if (event.code === 'Space') {
        isSpacebarPressed = false;
        controls.enabled = true;
        console.log("Stopped moving object.");
    }
});

renderer.domElement.addEventListener('mousedown', event => {
    if (!isSpacebarPressed) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        let object = intersects[0].object;
        while (object.parent !== null && object.parent !== scene) {
            object = object.parent;
        }
        if (object.userData.type === 'house' || object.userData.type === 'hotel' || object.userData.type === 'hangar') {
            selectedObject = object;
            controls.enabled = false;
            isDragging = true;
        }
    }
});

renderer.domElement.addEventListener('mousemove', function (event) {
    if (!isSpacebarPressed || !selectedObject) return;
    if (selectedObject.type === "Mesh" || selectedObject.type === "GridHelper") return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
        selectedObject.position.copy(intersectPoint);
    }
});

renderer.domElement.addEventListener('mouseup', function (event) {
    if (isDragging) {
        isDragging = false;
        selectedObject = null;
        controls.enabled = true;
    }
});

renderer.domElement.addEventListener('dblclick', function (event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        while (selectedObject.parent !== null && selectedObject.parent !== scene) {
            selectedObject = selectedObject.parent;
        }
        console.log(selectedObject.userData);
        // if (selectedObject.userData.type === 'house' || selectedObject.userData.type === 'hotel' || selectedObject.userData.type === 'hangar') {
        //     showMessage(selectedObject.userData.type.charAt(0).toUpperCase() + selectedObject.userData.type.slice(1), intersects[0].point);
        // }
    }
});

function onDrop(event, modelType) {
    let rect = renderer.domElement.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    let y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObject(planeMesh);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const modelData = getModelData(modelType);
        if (modelData.fileName) {
            const scale = determineScale(modelData.type);
            loadModel(modelData.fileName, point, scale, modelData.type);
        } else if (selectedObject) {
            selectedObject.position.copy(point);
            selectedObject = null;
        }
    }
}

function determineScale(modelName) {
    return modelName.includes("house") ? { x: 6, y: 6, z: 6 } : { x: 2, y: 2, z: 2 };
}

function getModelData(modelType) {
    const baseName = modelType.split('/').pop().split('.')[0];
    const fileName = baseName.endsWith('.glb') ? baseName : `${baseName}.glb`;
    return { fileName, type: baseName };
}

function loadModel(modelName, position, scale, type) {
    const fullPath = `assets/models/${modelName}`;
    loader.load(fullPath, function (gltf) {
        gltf.scene.position.copy(position);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        gltf.scene.userData.type = type;
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(`An error happened loading the GLB file from ${fullPath}:`, error);
    });
}

function openModal(type, position) {
    const vector = position.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
    const modal = document.getElementById('infoModal');
}

document.addEventListener('DOMContentLoaded', function () {
    const closeButton = document.querySelector('.modal-close');
    closeButton.addEventListener('click', function () {
        document.getElementById('infoModal').style.display = 'none';
    });

    document.getElementById('sendButton').addEventListener('click', function () {
        // Implement what happens when the 'Get' button is clicked
        console.log("HEh")
    });

    let startPoint = null;
    let endPoint = null;

    renderer.domElement.addEventListener('click', function (event) {
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

            if (!startPoint) {
                startPoint = intersects[0].point.clone();
                console.log('Start point set:', startPoint);
            } else if (!endPoint) {
                endPoint = intersects[0].point.clone();
                console.log('End point set:', endPoint);
            } else {
                startPoint = intersects[0].point.clone();
                endPoint = null;
                console.log('Start point reset:', startPoint);
            }
        }
    });

    loader.load('assets/models/truck.glb', function (gltf) {
        gltf.scene.name = 'truck';
        scene.add(gltf.scene);
        gltf.scene.rotation.y = Math.PI;
        gltf.scene.visible = false;
    });

    document.getElementById('simulateButton').addEventListener('click', function () {
        const truck = scene.getObjectByName('truck');
        if (!truck) {
            console.error('Truck model not found in the scene.');
            return;
        }

        truck.scale.set(0.3, 0.3, 0.3);
        truck.position.y = -0.5;
        truck.rotation.y = Math.PI / 2;

        if (!startPoint || !endPoint) {
            console.error('Start point or end point not set.');
            return;
        }

        let traveled = 0;
        const delta = new THREE.Vector3().subVectors(endPoint, startPoint);
        const distance = delta.length();
        const direction = delta.normalize();
        const speed = 0.7;

        truck.visible = true;
        truck.position.set(startPoint.x, startPoint.y, startPoint.z);
        truck.rotation.y = Math.atan2(endPoint.x - startPoint.x, endPoint.z - startPoint.z) - Math.PI / 2 + Math.PI;

        if (window.currentAnimationId) {
            cancelAnimationFrame(window.currentAnimationId);
        }

        function animateTruck() {
            if (traveled < distance) {
                window.currentAnimationId = requestAnimationFrame(animateTruck);
                truck.position.addScaledVector(direction, speed);
                traveled += speed;
            } else {
                cancelAnimationFrame(window.currentAnimationId);
                truck.visible = false;
            }
        }

        animateTruck();
    });
});
