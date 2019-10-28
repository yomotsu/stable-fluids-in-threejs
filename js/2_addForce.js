import {
	Scene,
	Mesh,
	RawShaderMaterial,
} from 'https://unpkg.com/three@0.109.0/build/three.module.js';
import {
	mouseDirection,
	mousePosition,
	prevMousePosition,
} from './params.js';
import {
	SCREEN_QUAD_GEOMETRY,
	SCREEN_QUAD_VERTEX_SHADER,
} from './screen-quad-util.js';

const THREE = {
	Scene,
	Mesh,
	RawShaderMaterial,
};

const addForceQuad = new THREE.Mesh(
	SCREEN_QUAD_GEOMETRY,
	new THREE.RawShaderMaterial( {
		uniforms: {
			u_velocityTexture: { value: null },
			u_mouseCoord     : { value: mousePosition },
			u_mouseDir       : { value: mouseDirection },
			u_forceRadius    : { value: 30 },
			u_addForce       : { value: 0 }, // bool-ish 0 or 1
		},
		vertexShader: SCREEN_QUAD_VERTEX_SHADER,
		fragmentShader: `
			precision highp float;

			uniform sampler2D u_velocityTexture;
			uniform vec2 u_mouseCoord;
			uniform vec2 u_mouseDir;
			uniform float u_forceRadius;
			uniform float u_addForce; // 0 or 1
			varying vec2 v_uv;

			void main() {

				vec2 uv = v_uv;
				vec2 velocity = texture2D( u_velocityTexture, uv ).xy;

				// 力。ドラッグしたポイントをドラッグ方向に応じた色で塗って保存
				//     -g
				//  -r     +r
				//     +g
				//
				vec2 force = vec2( smoothstep( u_forceRadius, 0.0, length( u_mouseCoord - gl_FragCoord.xy ) ) ) * u_mouseDir * u_addForce;

				gl_FragColor = vec4( velocity + force, 0.0, 0.0 );

			}
		`
	} ),
);
const addForceScene = new THREE.Scene();
addForceScene.add( addForceQuad );

export const addForce = ( deltaTime, { velocityFBOs, divergenceFBOs, pressureFBOs } ) => {

	addForceQuad.material.uniforms.u_velocityTexture.value = velocityFBOs.readBuffer.texture;
	addForceQuad.material.uniforms.u_addForce.value = prevMousePosition.equals( mousePosition ) ? 0 : 1;
	velocityFBOs.render( addForceScene );
	velocityFBOs.swapBuffers();

};
