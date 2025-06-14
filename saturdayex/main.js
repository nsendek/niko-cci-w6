import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MusicalBall } from './util.js'
// import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let camera, scene, renderer, raycaster, pointer, controls, composer;

let lastTime = Date.now();
let currentTime = Date.now();

const sceneLights = [];
const sceneBalls = [];
const sceneWalls = [];
const ROOM_SIZE = 2500;
const SCENE_STATE = {
  paused: false
};

main();

function main() {
  init();
  render();
}

function init() {
  camera = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = ROOM_SIZE / 2;
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  scene.background = new THREE.Color(0x000000)
	// renderer.shadowMap.enabled = true;
	// renderer.toneMapping = THREE.CineonToneMapping;
	// renderer.shadowMap.type = THREE.PCFShoftShadowMap;
		const environment = new RoomEnvironment();
		const pmremGenerator = new THREE.PMREMGenerator( renderer );
		scene.environment = pmremGenerator.fromScene( environment ).texture;
    
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.getElementById('main').appendChild(renderer.domElement);

  document.body.style.touchAction = 'none';

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onPointerClick);
  window.addEventListener('keypress', onKeyPressed);

  setupRoom();
  setUpRaycasting();
  // setupDebug();
  setupLights();
}

function render() {
  // Do a little recursing.
  requestAnimationFrame(render);
  currentTime = Date.now();

  camera.lookAt(scene.position);
  if (controls) {
    controls.update();
  }
  renderer.render(scene, camera);

  // if (!SCENE_STATE.paused) {
  //   updateMusicBalls();
  // }

  lastTime = currentTime;
}

// function updateMusicBalls() {
//   sceneBalls.forEach(ball => {
//     ball.update(currentTime - lastTime);
//   });
// }

function addBall(intersection) {
  const note = getNote(intersection.object);
  const ball = new MusicalBall(scene, note, ROOM_SIZE);

  const velVector = (new THREE.Vector3(0, 0, 0)).sub(intersection.object.position).normalize();
  ball.setDirection(velVector);

  const position = intersection.point.add(velVector.clone().multiplyScalar(150));
  ball.setPosition(position);

  sceneBalls.push(ball);
}

function removeBall(intersect) {
  const ballIndex = sceneBalls.findIndex((value) => intersect.object === value.getObject());

  if (ballIndex == -1) {
    return;
  }
  sceneBalls.splice(ballIndex, 1);
  intersect.object.removeFromParent();
}

function getNote(obj) {
  const wallIndex = sceneWalls.findIndex((value) => obj === value);
  if (wallIndex == 0) {
    return "C2";
  } else if (wallIndex == 1) {
    return "D2";
  } else if (wallIndex == 2) {
    return "E2";
  } else if (wallIndex == 3) {
    return "F2";
  } else {
    return "G2";
  }
}

function setupDebug() {
  const axis = new THREE.AxesHelper(1000);
  axis.setColors(0xff0000, 0x00ff00, 0x0000ff); // RGB
  scene.add(axis);

  controls = new OrbitControls(camera, renderer.domElement);
}

function setUpRaycasting() {
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  window.addEventListener('pointermove', onPointerMove);
}

function setupLights() {
  sceneLights[0] = new THREE.DirectionalLight(0xffffff, 3);
  sceneLights[1] = new THREE.DirectionalLight(0xffffff, 3);
  sceneLights[2] = new THREE.DirectionalLight(0xffffff, 3);

  sceneLights[0].position.set(0, 750, 0);
  sceneLights[1].position.set(375, 750, 375);
  sceneLights[2].position.set(-375, -750, -375);

  scene.add(sceneLights[0]);
  scene.add(sceneLights[1]);
  scene.add(sceneLights[2]);
}

function setupRoom() {
  const room = new THREE.Group();
  const geometry = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);

  const mat1 = new THREE.MeshPhongMaterial({ color: 0xFF5733, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall1 = new THREE.Mesh(geometry, mat1);
  wall1.position.z = -ROOM_SIZE / 2;
  sceneWalls.push(wall1);
  room.add(wall1);

  const mat2 = new THREE.MeshPhongMaterial({ color: 0x3498DB, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall2 = new THREE.Mesh(geometry, mat2);
  wall2.position.x = ROOM_SIZE / 2;
  wall2.rotation.y = Math.PI / 2;
  sceneWalls.push(wall2);
  room.add(wall2);

  const mat3 = new THREE.MeshPhongMaterial({ color: 0x2ECC71, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall3 = new THREE.Mesh(geometry, mat3);
  wall3.position.x = -ROOM_SIZE / 2;
  wall3.rotation.y = Math.PI / 2;
  sceneWalls.push(wall3);
  room.add(wall3);

  const mat4 = new THREE.MeshPhongMaterial({ color: 0x9B59B6, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall4 = new THREE.Mesh(geometry, mat4);
  wall4.position.y = -ROOM_SIZE / 2;
  wall4.rotation.x = Math.PI / 2;
  sceneWalls.push(wall4);
  room.add(wall4);


  const mat5 = new THREE.MeshPhongMaterial({ color: 0xFBBC05, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall5 = new THREE.Mesh(geometry, mat5);
  wall5.position.y = ROOM_SIZE / 2;
  wall5.rotation.x = Math.PI / 2;
  sceneWalls.push(wall5);
  room.add(wall5);

  scene.add(room);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onPointerClick() {
  raycaster.setFromCamera(pointer, camera);

  const children = SCENE_STATE.paused ? sceneBalls.map(b => b.getObject()) : sceneWalls;
  const intersects = raycaster.intersectObjects(children);

  intersects.forEach(intersect => {
    if (SCENE_STATE.paused) {
      removeBall(intersect);
    } else {
      addBall(intersect);
    }
  });
}

function onKeyPressed(event) {
  if (event.keyCode == 32) {
    SCENE_STATE.paused = !SCENE_STATE.paused;
  }
}

function RoomEnvironment() {

	const scene = new THREE.Scene();

	const geometry = new THREE.BoxGeometry();
	geometry.deleteAttribute( 'uv' );

	const roomMaterial = new THREE.MeshStandardMaterial( { side: THREE.BackSide } );
	const boxMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000});

	const mainLight = new THREE.PointLight( 0xffffff, 5.0, 28, 2 );
	mainLight.position.set( 0.418, 16.199, 0.300 );
	scene.add( mainLight );

	const room = new THREE.Mesh( geometry, roomMaterial );
	room.position.set( - 0.757, 13.219, 0.717 );
	room.scale.set( 31.713, 28.305, 28.591 );
	scene.add( room );

	const box1 = new THREE.Mesh( geometry, boxMaterial );
	box1.position.set( - 10.906, 2.009, 1.846 );
	box1.rotation.set( 0, - 0.195, 0 );
	box1.scale.set( 2.328, 7.905, 4.651 );
	scene.add( box1 );

	const box2 = new THREE.Mesh( geometry, boxMaterial );
	box2.position.set( - 5.607, - 0.754, - 0.758 );
	box2.rotation.set( 0, 0.994, 0 );
	box2.scale.set( 1.970, 1.534, 3.955 );
	scene.add( box2 );

	const box3 = new THREE.Mesh( geometry, boxMaterial );
	box3.position.set( 6.167, 0.857, 7.803 );
	box3.rotation.set( 0, 0.561, 0 );
	box3.scale.set( 3.927, 6.285, 3.687 );
	scene.add( box3 );

	const box4 = new THREE.Mesh( geometry, boxMaterial );
	box4.position.set( - 2.017, 0.018, 6.124 );
	box4.rotation.set( 0, 0.333, 0 );
	box4.scale.set( 2.002, 4.566, 2.064 );
	scene.add( box4 );

	const box5 = new THREE.Mesh( geometry, boxMaterial );
	box5.position.set( 2.291, - 0.756, - 2.621 );
	box5.rotation.set( 0, - 0.286, 0 );
	box5.scale.set( 1.546, 1.552, 1.496 );
	scene.add( box5 );

	const box6 = new THREE.Mesh( geometry, boxMaterial );
	box6.position.set( - 2.193, - 0.369, - 5.547 );
	box6.rotation.set( 0, 0.516, 0 );
	box6.scale.set( 3.875, 3.487, 2.986 );
	scene.add( box6 );


	// -x right
	const light1 = new THREE.Mesh( geometry, createAreaLightMaterial( 50 ) );
	light1.position.set( - 16.116, 14.37, 8.208 );
	light1.scale.set( 0.1, 2.428, 2.739 );
	scene.add( light1 );

	// -x left
	const light2 = new THREE.Mesh( geometry, createAreaLightMaterial( 50 ) );
	light2.position.set( - 16.109, 18.021, - 8.207 );
	light2.scale.set( 0.1, 2.425, 2.751 );
	scene.add( light2 );

	// +x
	const light3 = new THREE.Mesh( geometry, createAreaLightMaterial( 17 ) );
	light3.position.set( 14.904, 12.198, - 1.832 );
	light3.scale.set( 0.15, 4.265, 6.331 );
	scene.add( light3 );

	// +z
	const light4 = new THREE.Mesh( geometry, createAreaLightMaterial( 43 ) );
	light4.position.set( - 0.462, 8.89, 14.520 );
	light4.scale.set( 4.38, 5.441, 0.088 );
	scene.add( light4 );

	// -z
	const light5 = new THREE.Mesh( geometry, createAreaLightMaterial( 20 ) );
	light5.position.set( 3.235, 11.486, - 12.541 );
	light5.scale.set( 2.5, 2.0, 0.1 );
	scene.add( light5 );

	// +y
	const light6 = new THREE.Mesh( geometry, createAreaLightMaterial( 100 ) );
	light6.position.set( 0.0, 20.0, 0.0 );
	light6.scale.set( 1.0, 0.1, 1.0 );
	scene.add( light6 );

	function createAreaLightMaterial( intensity ) {

		const material = new THREE.MeshBasicMaterial();
		material.color.setScalar( intensity );
		return material;

	}

	return scene;

}
