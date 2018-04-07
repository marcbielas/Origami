var camera, scene, renderer;
var geometry, material, mesh;

//from http://mrdoob.com/projects/voxels/#A/
var container, interval, projector, plane, cube, linesMaterial, ray, brush, objectHovered,
	mouse3D, isMouseDown = false, onMouseDownPosition, radious = 1600, theta = 45, 
	onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;

function main() {
	init();
	animate();
}


function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 1;

	scene = new THREE.Scene();

	projector = new THREE.Projector();

	//var dataurl = document.getElementById("user-image").src;

	geometry = new THREE.PlaneGeometry( .6, .4);
	var texture = new THREE.TextureLoader().load('js/rocks.jpg');
	//var texture = new THREE.CanvasTexture('js/rocks.jpg');
	material = new THREE.MeshBasicMaterial({map : texture});//({color: 0xffff00});

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	// geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	// material = new THREE.MeshNormalMaterial();

	// mesh = new THREE.Mesh( geometry, material );
	// scene.add( mesh );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );

}

function animate() {

	requestAnimationFrame( animate );

	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;

	renderer.render( scene, camera );

}

//http://mrdoob.com/projects/voxels/#A/
function onDocumentMouseDown( event ) {

				event.preventDefault();

				isMouseDown = true;

				onMouseDownTheta = theta;
				onMouseDownPhi = phi;
				onMouseDownPosition.x = event.clientX;
				onMouseDownPosition.y = event.clientY;

}
//http://mrdoob.com/projects/voxels/#A/
function onDocumentMouseMove( event ) {

    event.preventDefault();

    if ( isMouseDown ) {

        theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 )
                + onMouseDownTheta;
        phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 )
              + onMouseDownPhi;

        phi = Math.min( 180, Math.max( 0, phi ) );

        camera.position.x = radious * Math.sin( theta * Math.PI / 360 )
                            * Math.cos( phi * Math.PI / 360 );
        camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
        camera.position.z = radious * Math.cos( theta * Math.PI / 360 )
                            * Math.cos( phi * Math.PI / 360 );
        camera.updateMatrix();

    }

    mouse3D = projector.unprojectVector( new THREE.Vector3(( event.clientX / renderer.domElement.width ) * 2 - 1,
     - ( event.clientY / renderer.domElement.height ) * 2 + 1, 0.5), camera );
    //ray.direction = mouse3D.subSelf( camera.position ).normalize();
    ray = new THREE.Ray(camera.position, mouse3D.subSelf(camera.position).normalize());
    interact();
    render();

}
//http://mrdoob.com/projects/voxels/#A/
function onDocumentMouseUp( event ) {

				event.preventDefault();

				isMouseDown = false;

				onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
				onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;

				if ( onMouseDownPosition.length() > 5 ) {

					return;

				}

				var intersect, intersects = ray.intersectScene( scene );

				if ( intersects.length > 0 ) {

					intersect = intersects[ 0 ].object == brush ? intersects[ 1 ] : intersects[ 0 ];

					if ( intersect ) {

						if ( isShiftDown ) {

							if ( intersect.object != plane ) {

								scene.removeObject( intersect.object );

							}

						} else {

							var position = new THREE.Vector3().add( intersect.point, intersect.object.matrixRotation.transform( intersect.face.normal.clone() ) );

							var voxel = new THREE.Mesh( cube, new THREE.MeshColorFillMaterial( colors[ color ] ) );
							voxel.position.x = Math.floor( position.x / 50 ) * 50 + 25;
							voxel.position.y = Math.floor( position.y / 50 ) * 50 + 25;
							voxel.position.z = Math.floor( position.z / 50 ) * 50 + 25;
							voxel.overdraw = true;
							scene.addObject( voxel );

						}

					}

				}

				updateHash();
				interact();
				render();

			}

// function loadImage(){
//     var img = new Image();
//     img.onload = function (){
//       createCanvas(img);
//     }
//     img.src = document.getElementById("user-image").files[0].name;
//  }