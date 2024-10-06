import * as THREE from 'three';
import { camera, controls, renderer, scene, planeMesh, loader } from './scene.js';
import { showModal } from './modal.js';
import { animateTruck } from './animate.js';
import { showModal2D } from './modal2D.js';

let isDragging = false;
let selectedObject = null;
let isSpacebarPressed = false;

const view3DCheckbox = document.getElementById('view3DCheckbox');



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
        if (object.userData.type === 'house' || object.userData.type === 'hotel' || object.userData.type === 'hangar' || object.userData.type === 'manufacturing') {
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
        updateCoordinates();
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
            if (view3DCheckbox.checked && selectedObject.userData.type === "hangar") {
                // console.log("Here checked")
            showModal(selectedObject.userData);
        }
        else{
            // console.log("Here")
            if (selectedObject.userData.type === "hangar") {
            showModal2D(selectedObject.userData);
            }
        }
    }

});

function onDrop(event, modelType) {
    console.log("onDrop called with modelType:", modelType);
    let rect = renderer.domElement.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    let y = -((event.clientY / rect.height) * 2 - 1);

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObject(planeMesh);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        console.log(point);
        const modelData = getModelData(modelType);
        console.log("Model data:", modelData);
        if (modelData.fileName) {
            const scale = determineScale(modelData.type);
            loadModel(modelData.fileName, point, scale, modelData.type);
        } else if (selectedObject) {
            selectedObject.position.copy(point);
            selectedObject = null;
        }
        updateCoordinates();
    }
}

function determineScale(modelName) {
    if (modelName.includes("house")) {
        return { x: 6, y: 6, z: 6 };
    } else if (modelName.includes("manufacturing")) {
        return { x: 1, y: 1, z: 1 };
    } else {
        return { x: 2, y: 2, z: 2 };
    }
}

function getModelData(modelType) {
    const baseName = modelType.split('/').pop().split('.')[0];
    let fileName;
    if (baseName.includes("manufacturing")) {
        fileName = 'factory/manufacturing.gltf';
    } else {
        fileName = baseName.endsWith('.glb') ? baseName : `${baseName}.glb`;
    }
    return { fileName, type: baseName };
}

function loadModel(modelName, position, scale, type) {
    const fullPath = `assets/models/${modelName}`;
    console.log("Loading model from:", fullPath);
    loader.load(fullPath, function (gltf) {
        gltf.scene.position.copy(position);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        gltf.scene.userData.type = type;
        gltf.scene.name = type;  // Ensure the name is set for easy reference
        scene.add(gltf.scene);
        updateCoordinates();
    }, undefined, function (error) {
        console.error(`An error happened loading the GLTF file from ${fullPath}:`, error);
    });
}

function updateCoordinates() {
    console.log("Updating coordinates...");
    const hangar = scene.getObjectByName('hangar');
    const hotel = scene.getObjectByName('hotel');
    const house = scene.getObjectByName('house');
    const manufacturing = scene.getObjectByName('manufacturing');

    let coordinates = {
        hangar: null,
        hotel: null,
        house: null,
        manufacturing: null
    };

    if (hangar) {
        coordinates.hangar = new THREE.Vector3(
            hangar.position.x,
            hangar.position.y,
            hangar.position.z
        );
        console.log("Dispatching coordinatesUpdated event for hangar:", coordinates.hangar);
    } else {
        console.log("Hangar not found.");
    }

    if (hotel) {
        coordinates.hotel = new THREE.Vector3(
            hotel.position.x,
            hotel.position.y,
            hotel.position.z
        );
        console.log("Dispatching coordinatesUpdated event for hotel:", coordinates.hotel);
    } else {
        console.log("Hotel not found.");
    }

    if (house) {
        coordinates.house = new THREE.Vector3(
            house.position.x,
            house.position.y,
            house.position.z
        );
        console.log("Dispatching coordinatesUpdated event for house:", coordinates.house);
    } else {
        console.log("House not found.");
    }

    if (manufacturing) {
        coordinates.manufacturing = new THREE.Vector3(
            manufacturing.position.x,
            manufacturing.position.y,
            manufacturing.position.z
        );
        console.log("Dispatching coordinatesUpdated event for manufacturing:", coordinates.manufacturing);
    } else {
        console.log("Manufacturing not found.");
    }

    document.dispatchEvent(new CustomEvent('coordinatesUpdated', {
        detail: coordinates
    }));

    return coordinates;
}

// Listen for the fieldValueExtracted event and start the truck animation
document.addEventListener('fieldValueExtracted', function (event) {
    console.log('fieldValueExtracted event fired.');
    const { fieldNameOrigin, fieldValue } = event.detail;
    console.log(`Field Value Extracted: ${fieldNameOrigin} - ${fieldValue}`);

    const coordinates = updateCoordinates();

    if (coordinates.hangar && coordinates.hotel) {
        animateTruck(coordinates.hangar, coordinates.hotel); // Ensure these are THREE.Vector3 objects
    } else {
        console.error('Coordinates for hangar or hotel are missing.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const closeButton = document.querySelector('.modal-close');
    closeButton.addEventListener('click', function () {
        document.getElementById('infoModal').style.display = 'none';
    });

    document.getElementById('sendButton').addEventListener('click', function () {
        console.log("HEh");
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

        animateTruck(startPoint, endPoint);

        // Fetch and load products after animation
        const urlInput = document.getElementById('urlInputFooter').value.trim();
        const endpointInput = document.getElementById('endpointFooter').value.trim();
        const fullUrl = `${urlInput}/${endpointInput}?$filter=OrderID eq ${fieldValue}`;

        if (urlInput && endpointInput) {
            processFieldValue(fullUrl);
        }
    });
});