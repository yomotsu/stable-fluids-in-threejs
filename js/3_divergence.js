import * as THREE from 'https://unpkg.com/three@0.109.0/build/three.module.js';
import {
	resolution,
} from './params.js';
import {
	SCREEN_QUAD_GEOMETRY,
	SCREEN_QUAD_VERTEX_SHADER,
} from './screen-quad-util.js';

// 3. divergence 速度の発散
const divergenceQuad = new THREE.Mesh(
	SCREEN_QUAD_GEOMETRY,
	new THREE.RawShaderMaterial( {
		uniforms: {
			u_resolution     : { value: resolution },
			u_velocityTexture: { value: null },
		},
		vertexShader: SCREEN_QUAD_VERTEX_SHADER,
		fragmentShader: `
			precision highp float;

			uniform vec2 u_resolution;
			uniform sampler2D u_velocityTexture;
			varying vec2 v_uv;

			vec2 xOffset = vec2( 1.0 / u_resolution.x, 0.0 );
			vec2 yOffset = vec2( 0.0, 1.0 / u_resolution.y );

			void main () {

				vec2 uv = v_uv;

				float velocityRight  = texture2D( u_velocityTexture, uv + xOffset ).x;
				float velocityLeft   = texture2D( u_velocityTexture, uv - xOffset ).x;
				float velocityBottom = texture2D( u_velocityTexture, uv - yOffset ).y;
				float velocityTop    = texture2D( u_velocityTexture, uv + yOffset ).y;

				// 発散がプラスなら湧き出し、マイナスなら吸い込み
				// ある点での発散は、x軸プラスを右、y軸プラスを下として、
				// {右の点の速度のx成分} – {左の点の速度のx成分} + {下の点の速度のy成分} – {上の点の速度のy成分}
				// ただしここではy軸のプラスは上方向なので...
				float divergence = ( ( velocityRight - velocityLeft ) + ( velocityTop - velocityBottom ) ) * 0.5;
				gl_FragColor = vec4( divergence, 0.0, 0.0, 1.0 );
				// gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.0 );

			}
		`
	} ),
);
const divergenceScene = new THREE.Scene();
divergenceScene.add( divergenceQuad );

export const divergence = ( deltaTime, { velocityFBOs, divergenceFBOs, pressureFBOs } ) => {

	// 速度テクスチャを読み込んで結果を発散テクスチャとして書き出し
	divergenceQuad.material.uniforms.u_velocityTexture.value = velocityFBOs.readBuffer.texture;
	divergenceFBOs.render( divergenceScene );
	divergenceFBOs.swapBuffers();

};
