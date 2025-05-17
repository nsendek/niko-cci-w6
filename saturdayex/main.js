import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import {MusicalBall} from './util.js'

let camera, scene, renderer, raycaster, pointer, controls, composer;

let lastTime = Date.now();
let currentTime = Date.now();

const sceneLights = [];
const sceneBalls = [];
const SPHERE_RADIUS = 100;
const ROOM_SIZE = 2500;

main();

function main() {
  init();
  render();
}

function init() {
  camera = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = ROOM_SIZE/2;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.getElementById('main').appendChild(renderer.domElement);

  document.body.style.touchAction = 'none';

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onPointerClick)

  setupRoom();
  setupEffects();
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
  composer.render();

  updateMusicBalls();


  lastTime = currentTime;
}

function updateMusicBalls() {
  sceneBalls.forEach(ball => {
    ball.update();
  });
}

function addBall(intersection) {
  const ball = new MusicalBall(scene, ROOM_SIZE);
  

  const velVector = (new THREE.Vector3(0,0,0)).sub(intersection.object.position).normalize();
  console.log(velVector);
  ball.setVelocity(velVector);

  const position = intersection.point.add(velVector.clone().multiplyScalar(150));
  ball.setPosition(position);

  sceneBalls.push(ball);
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

  window.addEventListener( 'pointermove', onPointerMove );
}

function setupEffects() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const fisheyePass = new ShaderPass(getDistortionShaderDefinition());
  // composer.addPass(fisheyePass);
  fisheyePass.renderToScreen = true;
  setupDistortionEffect(fisheyePass);
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
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

  const mat1 = new THREE.MeshPhongMaterial({ color: 0xFF5733, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall1 = new THREE.Mesh(geometry, mat1);
  wall1.position.z = -ROOM_SIZE / 2;
  room.add(wall1);

  const mat2 = new THREE.MeshPhongMaterial({ color: 0x3498DB, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall2 = new THREE.Mesh(geometry, mat2);
  wall2.position.x = ROOM_SIZE / 2;
  wall2.rotation.y = Math.PI / 2;
  room.add(wall2);

  const mat3 = new THREE.MeshPhongMaterial({ color: 0x2ECC71, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall3 = new THREE.Mesh(geometry, mat3);
  wall3.position.x = -ROOM_SIZE / 2;
  wall3.rotation.y = Math.PI / 2;
  room.add(wall3);

  const mat4 = new THREE.MeshPhongMaterial({ color: 0x9B59B6, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall4 = new THREE.Mesh(geometry, mat4);
  wall4.position.y = -ROOM_SIZE / 2;
  wall4.rotation.x = Math.PI / 2;
  room.add(wall4);


  const mat5 = new THREE.MeshPhongMaterial({ color: 0xFBBC05, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  const wall5 = new THREE.Mesh(geometry, mat5);
  wall5.position.y = ROOM_SIZE / 2;
  wall5.rotation.x = Math.PI / 2;
  room.add(wall5);

  scene.add(room);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove( event ) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onPointerClick() {
  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects(scene.children);

  intersects.forEach(intersect => {
    if (intersect.object.geometry instanceof THREE.PlaneGeometry) {
      addBall(intersect);
    }
  });
}

// Ripped off https://www.decarpentier.nl/downloads/lensdistortion-webgl/lensdistortion-webgl.html
function getDistortionShaderDefinition() {
  return {
    uniforms: {
      "tDiffuse": { type: "t", value: null },
      "strength": { type: "f", value: 0 },
      "height": { type: "f", value: 1 },
      "aspectRatio": { type: "f", value: 1 },
      "cylindricalRatio": { type: "f", value: 1 }
    },

    vertexShader: [
      "uniform float strength;",          // s: 0 = perspective, 1 = stereographic
      "uniform float height;",            // h: tan(verticalFOVInRadians / 2)
      "uniform float aspectRatio;",       // a: screenWidth / screenHeight
      "uniform float cylindricalRatio;",  // c: cylindrical distortion ratio. 1 = spherical

      "varying vec3 vUV;",                // output to interpolate over screen
      "varying vec2 vUVDot;",             // output to interpolate over screen

      "void main() {",
      "gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));",

      "float scaledHeight = strength * height;",
      "float cylAspectRatio = aspectRatio * cylindricalRatio;",
      "float aspectDiagSq = aspectRatio * aspectRatio + 1.0;",
      "float diagSq = scaledHeight * scaledHeight * aspectDiagSq;",
      "vec2 signedUV = (2.0 * uv + vec2(-1.0, -1.0));",

      "float z = 0.5 * sqrt(diagSq + 1.0) + 0.5;",
      "float ny = (z - 1.0) / (cylAspectRatio * cylAspectRatio + 1.0);",

      "vUVDot = sqrt(ny) * vec2(cylAspectRatio, 1.0) * signedUV;",
      "vUV = vec3(0.5, 0.5, 1.0) * z + vec3(-0.5, -0.5, 0.0);",
      "vUV.xy += uv;",
      "}"
    ].join("\n"),

    fragmentShader: [
      "uniform sampler2D tDiffuse;",      // sampler of rendered scene’s render target
      "varying vec3 vUV;",                // interpolated vertex output data
      "varying vec2 vUVDot;",             // interpolated vertex output data

      "void main() {",
      "vec3 uv = dot(vUVDot, vUVDot) * vec3(-0.5, -0.5, -1.0) + vUV;",
      "gl_FragColor = texture2DProj(tDiffuse, uv);",
      "}"
    ].join("\n")

  };
}

function setupDistortionEffect(effect) {
  let guiParameters = {
    horizontalFOV: 120,
    strength: 1.5,
    cylindricalRatio: 0.85,
  };

  let height = Math.tan(guiParameters.horizontalFOV * Math.PI / 180 / 2) / camera.aspect;
  
  camera.fov = Math.atan(height) * 2 * 180 / 3.1415926535;
  camera.updateProjectionMatrix();

  effect.uniforms["strength"].value = guiParameters.strength;
  effect.uniforms["height"].value = height;
  effect.uniforms["aspectRatio"].value = camera.aspect;
  effect.uniforms["cylindricalRatio"].value = guiParameters.cylindricalRatio;  
}
