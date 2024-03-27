import * as THREE from 'three';
import { scene } from './scene';

const gridHelper = new THREE.GridHelper(500, 50);
scene.add(gridHelper);