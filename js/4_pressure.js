import * as THREE from 'https://unpkg.com/three@0.109.0/build/three.module.js';
import {
	resolution,
} from './params.js';
import {
	SCREEN_QUAD_GEOMETRY,
	SCREEN_QUAD_VERTEX_SHADER,
} from './screen-quad-util.js';

// 4. 圧力で発散を打ち消す jacobi iteration
const pressureQuad = new THREE.Mesh(
	SCREEN_QUAD_GEOMETRY,
	new THREE.RawShaderMaterial( {
		uniforms: {
			u_resolution       : { value: resolution },
			u_divergenceTexture: { value: null },
			u_pressureTexture  : { value: null },
		},
		vertexShader: SCREEN_QUAD_VERTEX_SHADER,
		fragmentShader: `
			precision highp float;

			uniform vec2 u_resolution;
			uniform sampler2D u_divergenceTexture;
			uniform sampler2D u_pressureTexture;
			varying vec2 v_uv;

			vec2 xOffset = vec2( 1.0 / u_resolution.x, 0.0 );
			vec2 yOffset = vec2( 0.0, 1.0 / u_resolution.y );

			vec2 checkBoundary( vec2 uv ) {

				return uv;

			}

			void main () {

				vec2 uv = v_uv;

				float pTop    = texture2D( u_pressureTexture, checkBoundary( uv + yOffset ) ).r;
				float pBottom = texture2D( u_pressureTexture, checkBoundary( uv - yOffset ) ).r;
				float pRight  = texture2D( u_pressureTexture, checkBoundary( uv + xOffset ) ).r;
				float pLeft   = texture2D( u_pressureTexture, checkBoundary( uv - xOffset ) ).r;
				float divergence = texture2D( u_divergenceTexture, uv ).r;
				
				// ある点に生じる力は、隣り合う点の圧力の差から計算できる
				// 変化前の発散をdとすると、これが変化後に0になってほしいので、
				// -d = 4 * p – {左の圧力} + {右の圧力} + {上の圧力} + {下の圧力}
				// が成り立つ。変形すると
				// p = ( {左の圧力} + {右の圧力} + {上の圧力} + {下の圧力} + d ) * 0.25
				float pressure = ( pLeft + pRight + pTop + pBottom - divergence ) * 0.25;
				gl_FragColor = vec4( pressure, 0.0, 0.0, 1.0 );

			}
		`
	} ),
);

const pressureScene = new THREE.Scene();
pressureScene.add( pressureQuad );

const SOLVER_ITERATION = 32;
export const pressure = ( deltaTime, { velocityFBOs, divergenceFBOs, pressureFBOs } ) => {

	// 繰り返して精度を上げる
	for ( let i = 0; i < SOLVER_ITERATION; i ++ ) {

		// 発散テクスチャを読み込んで結果を圧力テクスチャとして書き出し
		pressureQuad.material.uniforms.u_divergenceTexture.value = divergenceFBOs.readBuffer.texture;
		pressureQuad.material.uniforms.u_pressureTexture.value = pressureFBOs.readBuffer.texture;
		pressureFBOs.render( pressureScene );
		pressureFBOs.swapBuffers();

	}

};
