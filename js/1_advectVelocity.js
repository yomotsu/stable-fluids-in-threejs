import * as THREE from 'https://unpkg.com/three@0.109.0/build/three.module.js';
import {
	resolution,
} from './params.js';
import {
	SCREEN_QUAD_GEOMETRY,
	SCREEN_QUAD_VERTEX_SHADER,
} from './screen-quad-util.js';

// 1. advectVelocity: 移流
// 発生しているvelocity分ずらす
const advectVelocityQuad = new THREE.Mesh(
	SCREEN_QUAD_GEOMETRY,
	new THREE.RawShaderMaterial( {
		uniforms: {
			u_resolution     : { value: resolution },
			u_velocityTexture: { value: null },
			u_deltaTime      : { value: 0 },
		},
		vertexShader: SCREEN_QUAD_VERTEX_SHADER,
		fragmentShader: `
			precision highp float;

			uniform sampler2D u_velocityTexture;
			uniform float u_deltaTime;
			varying vec2 v_uv;

			void main( void ) {

				vec2 uv = v_uv;
				gl_FragColor = texture2D( u_velocityTexture, uv - texture2D( u_velocityTexture, uv ).xy * u_deltaTime );

			}
		`
	} ),
);
const advectVelocityScene = new THREE.Scene();
advectVelocityScene.add( advectVelocityQuad );

export const advectVelocity = ( deltaTime, { velocityFBOs, divergenceFBOs, pressureFBOs } ) => {

	advectVelocityQuad.material.uniforms.u_velocityTexture.value = velocityFBOs.readBuffer.texture;
	advectVelocityQuad.material.uniforms.u_deltaTime.value = deltaTime;
	velocityFBOs.render( advectVelocityScene );
	velocityFBOs.swapBuffers();

};
