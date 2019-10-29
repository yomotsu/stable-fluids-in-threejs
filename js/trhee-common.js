import * as THREE from 'https://unpkg.com/three@0.109.0/build/three.module.js';
import {
	resolution,
	mouseDirection,
	mousePosition,
	prevMousePosition,
} from './params.js';

const width  = resolution.x;
const height = resolution.y;

export const clock = new THREE.Clock();
export const scene = new THREE.Scene();
export const camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
export const renderer = new THREE.WebGLRenderer( { canvas: document.querySelector( 'canvas' ) } );
renderer.setSize( width, height );
renderer.autoClear = false;
document.body.appendChild( renderer.domElement );

const isTouchEvent = ( event ) => 'TouchEvent' in window && event instanceof TouchEvent;

const dragStart = ( event ) => {

	event.preventDefault();
	dragEnd();
	document.addEventListener( 'mousemove', dragging, { passive: false } );
	document.addEventListener( 'touchmove', dragging, { passive: false } );
	document.addEventListener( 'mouseup', dragEnd );
	document.addEventListener( 'touchend', dragEnd );

};

const dragging = ( event ) => {

	event.preventDefault();
	const _event = isTouchEvent( event ) ? event.touches[ 0 ] : event;

	prevMousePosition.copy( mousePosition );

	const width = resolution.x;
	const height = resolution.y;
	const domRect = renderer.domElement.getBoundingClientRect();
	mousePosition.set(
		THREE.Math.clamp( ( _event.clientX - domRect.x ), 0, width ),
		height - THREE.Math.clamp( ( _event.clientY - domRect.y ), 0, height ),
	);

	mouseDirection.subVectors( mousePosition, prevMousePosition ).normalize();

};

const dragEnd = () => {

	prevMousePosition.copy( mousePosition );
	mouseDirection.set( 0, 0 );
	document.removeEventListener( 'mousemove', dragging, { passive: false } );
	document.removeEventListener( 'touchmove', dragging, { passive: false } );
	document.removeEventListener( 'mouseup', dragEnd );
	document.removeEventListener( 'touchend', dragEnd );

};

renderer.domElement.addEventListener( 'mousedown', dragStart );
renderer.domElement.addEventListener( 'touchstart', dragStart );

window.addEventListener( 'resize', () => {

	const width = window.innerWidth;
	const height = window.innerHeight;
	resolution.set( width, height );
	renderer.setSize( width, height );

} );
