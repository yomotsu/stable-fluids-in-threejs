import * as THREE from 'https://unpkg.com/three@0.109.0/build/three.module.js';
import {
	resolution,
} from './params.js';
import {
	SCREEN_QUAD_GEOMETRY,
	SCREEN_QUAD_VERTEX_SHADER,
} from './screen-quad-util.js';

// 5. subtractPressureGradient
const subtractPressureGradientQuad = new THREE.Mesh(
	SCREEN_QUAD_GEOMETRY,
	new THREE.RawShaderMaterial( {
		uniforms: {
			u_resolution     : { value: resolution },
			u_velocityTexture: { value: null },
			u_pressureTexture: { value: null },
			u_deltaTime      : { value: 0 },
		},
		vertexShader: SCREEN_QUAD_VERTEX_SHADER,
		fragmentShader: `
			precision highp float;
			
			uniform vec2 u_resolution;
			uniform sampler2D u_pressureTexture;
			uniform sampler2D u_velocityTexture;
			uniform float u_deltaTime;
			varying vec2 v_uv;
	
			float damping =  0.99;
			vec2 xOffset = vec2( 1.0 / u_resolution.x, 0.0 );
			vec2 yOffset = vec2( 0.0, 1.0 / u_resolution.y );

			vec2 checkBoundary( vec2 uv ) {

				return uv;

			}

			void main(){

				vec2 uv = v_uv;

				// (速度のx成分) += ( {左の点の圧力} – {右の点の圧力} ) * 0.5
				// (速度のy成分) += ( {上の点の圧力} – {下の点の圧力} ) * 0.5
				float pTop    = texture2D( u_pressureTexture, uv + yOffset ).r;
				float pBottom = texture2D( u_pressureTexture, uv - yOffset ).r;
				float pRight  = texture2D( u_pressureTexture, uv + xOffset ).r;
				float pLeft   = texture2D( u_pressureTexture, uv - xOffset ).r;
				vec2 grad = vec2( pRight - pLeft, pTop - pBottom ) * 0.5;

				vec2 velocity = texture2D( u_velocityTexture, uv ).xy * damping;

				gl_FragColor = vec4( velocity - grad, 0.0, 1.0 );
			}
		`
	} ),
);
const subtractPressureGradientScene = new THREE.Scene();
subtractPressureGradientScene.add( subtractPressureGradientQuad );

export const subtractPressureGradient = ( deltaTime, { velocityFBOs, divergenceFBOs, pressureFBOs } ) => {

	// 速度テクスチャを読み込んで結果を最終結果速度テクスチャとして書き出し
	subtractPressureGradientQuad.material.uniforms.u_velocityTexture.value = velocityFBOs.readBuffer.texture;
	subtractPressureGradientQuad.material.uniforms.u_pressureTexture.value = pressureFBOs.readBuffer.texture;
	subtractPressureGradientQuad.material.uniforms.u_deltaTime.value = deltaTime;
	velocityFBOs.render( subtractPressureGradientScene );
	velocityFBOs.swapBuffers();

};
