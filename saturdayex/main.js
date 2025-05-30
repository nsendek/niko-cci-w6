import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MusicalBall } from './util.js'

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

  if (!SCENE_STATE.paused) {
    updateMusicBalls();
  }

  lastTime = currentTime;
}

function updateMusicBalls() {
  sceneBalls.forEach(ball => {
    ball.update(currentTime - lastTime);
  });
}

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