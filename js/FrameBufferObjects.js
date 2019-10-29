import * as THREE from 'https://unpkg.com/three@0.109.0/build/three.module.js';

const _v2 = new THREE.Vector2()

export const FrameBufferObjects = class FrameBufferObjects {

	constructor( renderer ) {

		this._renderer = renderer;
		this._camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

		const size = this._renderer.getSize( _v2 );
		const pixelRatio = this._renderer.getPixelRatio();
		const width = size.width * pixelRatio;
		const height = size.height * pixelRatio;

		const textureType =
			/(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ? THREE.HalfFloatType :
			this._renderer.extensions.get( 'OES_texture_float' ) ? THREE.FloatType :
			THREE.UnsignedByteType;

		this.readBuffer = new THREE.WebGLRenderTarget( width, height, {
			format: THREE.RGBAFormat,
			type: textureType,
			depthBuffer: false,
			stencilBuffer: false,
		} );

		this.writeBuffer = this.readBuffer.clone();

		window.addEventListener( 'resize', () => {

			const size = this._renderer.getSize( _v2 );
			const pixelRatio = this._renderer.getPixelRatio();
			const width = size.width * pixelRatio;
			const height = size.height * pixelRatio;

			this.readBuffer.setSize( width, height );
			this.writeBuffer.setSize( width, height );

		} );

	}

	render( scene ) {

		this._renderer.setRenderTarget( this.writeBuffer );
		this._renderer.render( scene, this._camera );
		this._renderer.setRenderTarget( null );

	}

	swapBuffers() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	}

};
