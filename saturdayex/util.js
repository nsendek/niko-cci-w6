import * as THREE from 'three';

const SPHERE_RADIUS = 100;

export class MusicalBall {
  constructor(scene, note, roomSize) {
    this.speed = roomSize; // 100% of room length traveled per second.
    this.pos = new THREE.Vector3(0, 0, 0);
    this.direction = new THREE.Vector3(0, 0, 0);
    this.roomSize = roomSize;
    this.note = note;

    const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const meshMaterial = new THREE.MeshStandardMaterial({ roughness: 0, color: 0x666666,  metalness: 0.9, flatShading: false });

    // sphereGroup.add(new THREE.LineSegments(sphereGeometry, lineMaterial));
    this.object = new THREE.Mesh(sphereGeometry, meshMaterial);
    scene.add(this.object);

    this.synth = new Tone.Synth().toDestination();
    this.playNote();
  }

  getObject() {
    return this.object;
  }

  setDirection(vec) {
    this.direction = vec;
  }

  setPosition(vec) {
    this.pos = vec;
    this.object.position.x = vec.x;
    this.object.position.y = vec.y;
    this.object.position.z = vec.z;
  }

  update(delta) {
    const boundaryVal = this.roomSize / 2 - SPHERE_RADIUS / 2; // prevents clipping bug for now :(
    const axisDistance = this.pos.dot(this.direction);

    if (axisDistance >= boundaryVal) {
      this.bounce();
    }

    const offset = this.direction.clone();
    offset.multiplyScalar(this.speed);
    offset.multiplyScalar(delta / 1000);
    const start = this.object.position.clone();
    this.setPosition(start.add(offset));
  }

  bounce() {
    this.direction.multiplyScalar(-1);
    this.playNote();
  }

  playNote() {
    const now = Tone.now();
    this.synth.triggerAttackRelease(this.note, "16n", now);
  }
}