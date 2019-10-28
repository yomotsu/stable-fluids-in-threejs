import {
	RGBAFormat,
	HalfFloatType,
	FloatType,
	UnsignedByteType,
	Vector2,
	OrthographicCamera,
	WebGLRenderTarget,
} from 'https://unpkg.com/three@0.109.0/build/three.module.js';

const THREE = {
	RGBAFormat,
	UnsignedByteType,
	FloatType,
	HalfFloatType,
	Vector2,
	OrthographicCamera,
	WebGLRenderTarget,
};

export const FrameBufferObjects = class FrameBufferObjects {

	constructor( renderer ) {

		this._camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this._renderer = renderer;

		const size = this._renderer.getSize( new THREE.Vector2() );
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
