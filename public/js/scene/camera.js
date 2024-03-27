import * as THREE from 'three';

export const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 250, 400);