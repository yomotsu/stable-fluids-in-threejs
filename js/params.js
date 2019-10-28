import * as THREE from 'https://unpkg.com/three@0.109.0/build/three.module.js';

// const width  = 512;
// const height = 512;
const width  = window.innerWidth;
const height = window.innerHeight;
export const resolution = new THREE.Vector2( width, height );
export const prevMousePosition = new THREE.Vector2( 0, 0 );
export const mousePosition = new THREE.Vector2( 0, 0 );
export const mouseDirection = new THREE.Vector2( 0, 0 );
