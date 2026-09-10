/* The signature interaction: a draggable badge on a lanyard, simulated with Rapier.
   A kinematic anchor + a short chain of dynamic links + a card. Grab by raycast,
   flick to throw. TUNE the RIG numbers by eye. See references/physics-hero.md
   NOTE: types are loose (any) so the scaffold compiles before Rapier is installed. */
import * as THREE from 'three';
import { makeFaceTexture } from './face-texture';

export const RIG = {
  gravity: -93, timestep: 1 / 98, substeps: 3, solverIterations: 8,
  segments: 3, ropeLength: 0.9, swingIn: 6, ballRadius: 0.05,
  linearDamping: 3, angularDamping: 4, maxSpeed: 16, throwScale: 0.55,
  // a mounted 35mm slide is roughly square, thin card stock
  cardW: 1.8, cardH: 1.8, cardThickness: 0.06, jointAnchorY: 0.9,
};

export interface Pendulum { step(dt: number, idle: boolean): void; }

export function createPendulum(
  RAPIER: any, scene: THREE.Scene, camera: THREE.PerspectiveCamera, dom: HTMLElement,
): Pendulum {
  const world = new RAPIER.World({ x: 0, y: RIG.gravity, z: 0 });
  world.numSolverIterations = RIG.solverIterations;

  const seg = RIG.ropeLength / RIG.segments;
  const ax = 0, ay = 2;

  // anchor — kinematic; we steer it while dragging
  const anchor = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(ax, ay, 0));

  // links — dynamic chain
  const links: any[] = [];
  for (let i = 0; i < RIG.segments; i++) {
    const b = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(ax, ay - (i + 1) * seg, 0)
        .setLinearDamping(RIG.linearDamping).setAngularDamping(RIG.angularDamping));
    world.createCollider(RAPIER.ColliderDesc.ball(RIG.ballRadius), b);
    links.push(b);
  }
  // card — dynamic
  const card = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(ax, ay - RIG.ropeLength - RIG.cardH / 2, 0)
      .setLinearDamping(RIG.linearDamping).setAngularDamping(RIG.angularDamping));
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(RIG.cardW / 2, RIG.cardH / 2, RIG.cardThickness / 2), card);

  // joints — spherical, chaining anchor → links → card
  const up = { x: 0, y: 0, z: 0 }, down = { x: 0, y: -seg, z: 0 };
  let prev = anchor;
  for (const l of links) { world.createImpulseJoint(RAPIER.JointData.spherical(down, up), prev, l, true); prev = l; }
  world.createImpulseJoint(RAPIER.JointData.spherical(up, { x: 0, y: RIG.jointAnchorY, z: 0 }), prev, card, true);
  card.applyImpulse({ x: RIG.swingIn * card.mass(), y: 0, z: 0 }, true);

  // Three meshes
  const cardMesh = new THREE.Mesh(
    new THREE.BoxGeometry(RIG.cardW, RIG.cardH, RIG.cardThickness),
    new THREE.MeshPhysicalMaterial({
      map: makeFaceTexture(), clearcoat: 0.7, clearcoatRoughness: 0.25,
      roughness: 0.55, emissive: 0xe8842b, emissiveIntensity: 0.18,   // faint backlight
    }));
  scene.add(cardMesh);
  const linkMeshes = links.map(() => {                                 // the cord
    const m = new THREE.Mesh(new THREE.SphereGeometry(RIG.ballRadius),
      new THREE.MeshStandardMaterial({ color: 0x2b2f36 }));
    scene.add(m); return m;
  });

  // Drag-grab via raycast
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let dragging = false;
  const lastPtr = new THREE.Vector2();
  const vel = new THREE.Vector2();

  const ndc = (e: PointerEvent) => {
    const r = dom.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const planeZ = 0;
  function pointerToWorld(): THREE.Vector3 {
    ray.setFromCamera(ptr, camera);
    const t = (planeZ - ray.ray.origin.z) / ray.ray.direction.z;
    return ray.ray.origin.clone().add(ray.ray.direction.clone().multiplyScalar(t));
  }

  dom.addEventListener('pointerdown', (e) => {
    ndc(e); ray.setFromCamera(ptr, camera);
    if (ray.intersectObject(cardMesh, true).length) {
      dragging = true; dom.style.cursor = 'grabbing';
      lastPtr.set(e.clientX, e.clientY);
    }
  });
  addEventListener('pointermove', (e) => {
    ndc(e);
    if (!dragging) {
      ray.setFromCamera(ptr, camera);
      dom.style.cursor = ray.intersectObject(cardMesh, true).length ? 'grab' : '';
      return;
    }
    vel.set(e.clientX - lastPtr.x, e.clientY - lastPtr.y);
    lastPtr.set(e.clientX, e.clientY);
    const w = pointerToWorld();
    anchor.setNextKinematicTranslation({ x: w.x, y: w.y + RIG.ropeLength, z: 0 });
  });
  addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false; dom.style.cursor = '';
    const throwV = { x: vel.x * 0.02 * RIG.throwScale, y: -vel.y * 0.02 * RIG.throwScale, z: 0 };
    const speed = Math.hypot(throwV.x, throwV.y);
    const k = speed > RIG.maxSpeed ? RIG.maxSpeed / speed : 1;
    card.setLinvel({ x: throwV.x * k, y: throwV.y * k, z: 0 }, true);
    anchor.setNextKinematicTranslation({ x: ax, y: ay, z: 0 });   // return anchor home
  });

  let idlePhase = 0;
  const sync = (mesh: THREE.Object3D, body: any) => {
    const t = body.translation(), q = body.rotation();
    mesh.position.set(t.x, t.y, t.z);
    mesh.quaternion.set(q.x, q.y, q.z, q.w);
  };

  return {
    step(dt, idle) {
      if (idle && !dragging) {
        idlePhase += dt;                                   // barely-there ambient sway
        card.applyImpulse({ x: Math.sin(idlePhase * 1.3) * 0.002 * card.mass(), y: 0, z: 0 }, true);
      }
      world.timestep = RIG.timestep;
      for (let i = 0; i < RIG.substeps; i++) world.step();
      linkMeshes.forEach((m, i) => sync(m, links[i]));
      sync(cardMesh, card);
    },
  };
}
