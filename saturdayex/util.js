import * as THREE from 'three';

const SPHERE_RADIUS = 100;

export class MusicalBall {
  constructor(scene, roomSize) {
    this.sphereGroup = new THREE.Group();
    this.speed = 15;
    this.pos = new THREE.Vector3(0, 0, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.roomSize = roomSize;


    const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 16);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const meshMaterial = new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });

    // sphereGroup.add(new THREE.LineSegments(sphereGeometry, lineMaterial));
    this.sphereGroup.add(new THREE.Mesh(sphereGeometry, meshMaterial));
    scene.add(this.sphereGroup);
  }

  setVelocity(vec) {
    this.vel = vec;
  }

  setPosition(vec) {
    this.pos = vec;
    this.sphereGroup.position.x = vec.x;
    this.sphereGroup.position.y = vec.y;
    this.sphereGroup.position.z = vec.z;
  }

  update() {
    const boundaryVal = this.roomSize / 2 - SPHERE_RADIUS / 2; // prevents clipping bug for now :(
    if (this.pos.length() >= boundaryVal) {
      this.reflect();
    }

    const start = this.sphereGroup.position.clone();
    const end = start.add(this.vel.clone().multiplyScalar(this.speed));
    this.setPosition(end);
  }

  reflect() {
    this.vel = this.vel.multiplyScalar(-1);
    // this.setPosition(this.pos.add(this.vel.clone().multiplyScalar(2* SPHERE_RADIUS + 10)))
    // play a not here.
    PlayRiff();
  }
}

function PlayRiff() {
  // monophonic
  const synth = new Tone.Synth().toDestination();
  const now = Tone.now();

  // monophonic
  const synthBass = new Tone.Synth().toDestination();

  synthBass.triggerAttackRelease("C2", "8n", now);
  
  Tone.getTransport().start();
}