import * as THREE from 'three';
import { scene } from './scene.js';

export function animateTruck(startPoint, endPoint) {
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
    const speed = 0.5;

    truck.visible = true;
    truck.position.set(startPoint.x, startPoint.y, startPoint.z);
    truck.rotation.y = Math.atan2(endPoint.x - startPoint.x, endPoint.z - startPoint.z) - Math.PI / 2 + Math.PI;

    if (window.currentAnimationId) {
        cancelAnimationFrame(window.currentAnimationId);
    }

    function animate() {
        if (traveled < distance) {
            window.currentAnimationId = requestAnimationFrame(animate);
            truck.position.addScaledVector(direction, speed);
            traveled += speed;
        } else {
            cancelAnimationFrame(window.currentAnimationId);
            truck.visible = false;
        }
    }

    animate();
}
