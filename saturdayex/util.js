import * as THREE from 'three';

const SPHERE_RADIUS = 100;

export class MusicalBall {
  constructor(scene, note, roomSize) {
    this.speed = 15;
    this.pos = new THREE.Vector3(0, 0, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.roomSize = roomSize;
    this.note = note;


    const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const meshMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });

    // sphereGroup.add(new THREE.LineSegments(sphereGeometry, lineMaterial));
    this.object = new THREE.Mesh(sphereGeometry, meshMaterial);

    scene.add(this.object);

    this.synth = new Tone.Synth().toDestination();

    this.playNote();
  }

  setVelocity(vec) {
    this.vel = vec;
  }

  setPosition(vec) {
    this.pos = vec;
    this.object.position.x = vec.x;
    this.object.position.y = vec.y;
    this.object.position.z = vec.z;
  }

  update() {
    const boundaryVal = this.roomSize / 2 - SPHERE_RADIUS / 2; // prevents clipping bug for now :(
    const axisDistance = this.pos.dot(this.vel);

    if (axisDistance >= boundaryVal) {
      this.reflect();
    }

    const start = this.object.position.clone();
    const end = start.add(this.vel.clone().multiplyScalar(this.speed));
    this.setPosition(end);
  }

  reflect() {
    this.vel = this.vel.multiplyScalar(-1);
    // this.setPosition(this.pos.add(this.vel.clone().multiplyScalar(2* SPHERE_RADIUS + 10)))
    // play a not here.
    this.playNote();
  }

  playNote() {
    const now = Tone.now();

    this.synth.triggerAttackRelease(this.note, "8n", now);

    Tone.getTransport().start();
  }
}