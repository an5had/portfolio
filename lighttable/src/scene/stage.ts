/* The Three.js stage. Decoration behind the document. Physics is enabled
   separately and lazily (Rapier WASM is heavy). Everything here is guarded by the
   try/catch in main.ts — a failure must leave the document intact. */
import * as THREE from 'three';
import { createPendulum, type Pendulum } from './pendulum';

export async function initScene() {
  const canvas = document.getElementById('gl') as HTMLCanvasElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 3, 4); scene.add(key);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  let pendulum: Pendulum | null = null;
  let idle = false;
  let raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    const dt = Math.min(clock.getDelta(), 1 / 30);   // clamp so a stutter can't explode physics
    pendulum?.step(dt, idle);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  frame();

  // Pause when the tab is hidden — no reason to simulate offscreen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else { clock.getDelta(); frame(); }
  });

  return {
    async enablePhysics() {
      const RAPIER = await import('@dimforge/rapier3d');   // lazy WASM import
      await RAPIER.init();
      pendulum = createPendulum(RAPIER, scene, camera, renderer.domElement);
    },
    startIdle() { idle = true; },
  };
}
