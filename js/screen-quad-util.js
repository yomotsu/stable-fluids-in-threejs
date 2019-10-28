import * as THREE from 'https://unpkg.com/three@0.109.0/build/three.module.js';

export const SCREEN_QUAD_GEOMETRY = new THREE.PlaneBufferGeometry( 2, 2 );
export const SCREEN_QUAD_VERTEX_SHADER = `
attribute vec3 position;
attribute vec2 uv;
varying vec2 v_uv;

void main() {

	gl_Position = vec4( position, 1.0 );
	v_uv = uv;

}`;
