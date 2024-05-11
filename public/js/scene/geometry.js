import * as THREE from 'three';
import { scene } from './scene';

const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  roughness: 1.0,
  metalness: 0.0,
  emissive: 0x999999,
  wireframeLinewidth: 5
});
// const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
// planeMesh.rotation.x = -Math.PI / 2;
// scene.add(planeMesh);

export const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);