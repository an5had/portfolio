/* ===========================================================
   Zipper-camera gallery section (replaces "Through my lens")
   Scroll: horizontal zipper opens → camera pushes out →
   8 photos cycle on the camera LCD (with camera UI) → release
   to continue down to Contact.
   Fixed stage (body-level, persists) + spacer (in #main, before
   Contact) — same robust pattern as the hero intro.
   =========================================================== */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const ACCENT = '#ff5630';
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

// Drop 8 image URLs here (any aspect — they're cover-fit on the LCD).
// Leave "" for a styled placeholder frame.
const ZIP_PHOTOS = ['', '', '', '', '', '', '', ''];
const NPHOTOS = ZIP_PHOTOS.length;

// Preload any provided photos
const loaded = ZIP_PHOTOS.map((src) => {
  if (!src) return null;
  const im = new Image();
  im.crossOrigin = 'anonymous';
  im.src = src;
  im.onload = () => { im._ok = true; drawScreen(lastFp); };
  return im;
});

function isHome() {
  const p = location.pathname.replace(/index\.html?$/i, '').replace(/\/+$/, '');
  return p === '';
}

let stage, canvas, zipperTop, zipperBot, zipperPull, cap;
let renderer, scene, camera, cam3d, lcdTex, lcdCanvas, lcdCtx;
let st, running = false, raf = 0, active = false, built = false, curIdx = -1, lastFp = 0;

/* ---------- fixed stage DOM ---------- */
function buildStage() {
  if (stage) return;
  stage = document.createElement('div');
  stage.id = 'pf-zip-stage';
  stage.innerHTML =
    '<canvas id="pf-zip-canvas"></canvas>' +
    '<div id="pf-zip-zipper">' +
      '<div class="pf-zip-half top"><span class="pf-zip-teeth"></span></div>' +
      '<div class="pf-zip-half bottom"><span class="pf-zip-teeth"></span></div>' +
      '<div class="pf-zip-pull"></div>' +
    '</div>' +
    '<div id="pf-zip-cap"><p class="pf-eyebrow">Off the clock</p><h2>Through my lens</h2></div>';
  document.body.appendChild(stage);
  canvas = stage.querySelector('#pf-zip-canvas');
  zipperTop = stage.querySelector('.pf-zip-half.top');
  zipperBot = stage.querySelector('.pf-zip-half.bottom');
  zipperPull = stage.querySelector('.pf-zip-pull');
  cap = stage.querySelector('#pf-zip-cap');
}

/* ---------- Three.js ---------- */
function buildThree() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.AmbientLight(0x404657, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f8cff, 1.6); rim.position.set(-6, 2, -4); scene.add(rim);

  // LCD canvas texture
  lcdCanvas = document.createElement('canvas');
  lcdCanvas.width = 1024; lcdCanvas.height = 640;
  lcdCtx = lcdCanvas.getContext('2d');
  lcdTex = new THREE.CanvasTexture(lcdCanvas);
  lcdTex.colorSpace = THREE.SRGBColorSpace;

  cam3d = buildBackCamera(lcdTex);
  cam3d.scale.setScalar(0.2);
  scene.add(cam3d);
  drawScreen(0);
}

function mat(c, m, r, o) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: m, roughness: r }, o || {})); }

// Camera shown back-to-viewer (we see its LCD)
function buildBackCamera(tex) {
  const g = new THREE.Group();
  const body = mat(0x16181f, 0.7, 0.36), dark = mat(0x07080a, 0.5, 0.5), metal = mat(0xb9c0c9, 1, 0.25);
  g.add(new THREE.Mesh(new RoundedBoxGeometry(3.3, 2.3, 1.0, 6, 0.12), body));
  // grip
  const grip = new THREE.Mesh(new RoundedBoxGeometry(0.7, 2.2, 1.05, 5, 0.22), dark); grip.position.x = -1.7; g.add(grip);
  // pentaprism + dial on top
  const prism = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.55, 0.8, 4, 0.08), body); prism.position.set(0.3, 1.2, 0); g.add(prism);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 28), dark); dial.position.set(-1.1, 1.25, 0); g.add(dial);
  // LCD screen on the back (faces +Z toward viewer)
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.55), new THREE.MeshBasicMaterial({ map: tex }));
  screen.position.set(0.18, 0.0, 0.51); g.add(screen);
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(2.5, 1.72, 0.06, 4, 0.04), dark); bezel.position.set(0.18, 0, 0.48); g.add(bezel);
  // buttons on the right of the screen
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), metal);
    b.rotation.x = Math.PI / 2; b.position.set(1.5, 0.6 - i * 0.4, 0.5); g.add(b);
  }
  // lens pointing away from viewer (-Z)
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.9, 40), dark); barrel.rotation.x = Math.PI / 2; barrel.position.set(0.3, 0, -0.7); g.add(barrel);
  return g;
}

/* ---------- draw the camera screen (image + UI) ---------- */
function drawPhoto(ctx, idx, alpha, xoff) {
  const w = lcdCanvas.width, h = lcdCanvas.height;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(xoff || 0, 0);
  const img = loaded[idx];
  if (img && img._ok) {
    const ir = img.width / img.height, cr = w / h;
    let dw, dh, dx, dy;
    if (ir > cr) { dh = h; dw = h * ir; dx = (w - dw) / 2; dy = 0; }
    else { dw = w; dh = w / ir; dx = 0; dy = (h - dh) / 2; }
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    const hue = (idx / NPHOTOS) * 300;
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'hsl(' + hue + ',38%,18%)');
    g.addColorStop(1, 'hsl(' + ((hue + 40) % 360) + ',30%,9%)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.font = '700 280px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(idx + 1).padStart(2, '0'), w / 2, h / 2 + 20);
  }
  ctx.restore();
}

function drawUI(ctx, counter) {
  const w = lcdCanvas.width, h = lcdCanvas.height;
  ctx.font = '600 26px Inter, monospace'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText('P', 34, 50);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '500 20px Inter, monospace'; ctx.fillText('AUTO  AWB', 70, 48);
  ctx.textAlign = 'right'; ctx.fillStyle = ACCENT;
  ctx.beginPath(); ctx.arc(w - 150, 40, 9, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText('REC', w - 132, 48);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(w - 66, 28, 34, 18); ctx.fillRect(w - 30, 33, 4, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(w - 64, 30, 24, 14);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3;
  const m = 80, L = 46;
  [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(function (c) {
    ctx.beginPath(); ctx.moveTo(c[0], c[1] + L * c[3]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0] + L * c[2], c[1]); ctx.stroke();
  });
  ctx.fillStyle = '#fff'; ctx.font = '600 28px Inter, monospace'; ctx.textAlign = 'left';
  ctx.fillText('f/2.8   1/250   ISO 400', 34, h - 34);
  ctx.textAlign = 'right'; ctx.fillStyle = ACCENT;
  ctx.fillText(String(counter + 1).padStart(2, '0'), w - 92, h - 34);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(' / ' + String(NPHOTOS).padStart(2, '0'), w - 34, h - 34);
}

// fp is a continuous position 0..NPHOTOS-1; crossfades between neighbours
function drawScreen(fp) {
  if (!lcdCtx) return;
  const w = lcdCanvas.width, h = lcdCanvas.height, ctx = lcdCtx;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#05070b'; ctx.fillRect(0, 0, w, h);
  let idx = Math.floor(fp); if (idx < 0) idx = 0; if (idx > NPHOTOS - 1) idx = NPHOTOS - 1;
  const next = Math.min(idx + 1, NPHOTOS - 1);
  const frac = clamp01(fp - idx), e = frac * frac * (3 - 2 * frac);
  const slide = lcdCanvas.width * 0.16;
  // current photo eases out to the left; next eases in from the right (gallery swipe + crossfade)
  drawPhoto(ctx, idx, 1, -e * slide);
  if (next !== idx && e > 0) drawPhoto(ctx, next, e, (1 - e) * slide);
  drawUI(ctx, Math.round(fp));
  if (lcdTex) lcdTex.needsUpdate = true;
}

/* ---------- spacer (scroll length) + ScrollTrigger ---------- */
function ensureSpacer() {
  if (!isHome()) return;
  if (document.getElementById('pf-zip-spacer')) return;
  const contact = document.querySelector('.framer-11v20tp') ||
                  document.querySelector('[data-framer-name="Section - Contact"]');
  if (!contact || !contact.parentNode) return;

  const sp = document.createElement('section');
  sp.id = 'pf-zip-spacer';
  sp.setAttribute('aria-label', 'Photography');
  contact.parentNode.insertBefore(sp, contact);

  if (st) { st.kill(); st = null; }
  st = ScrollTrigger.create({
    trigger: sp, start: 'top top', end: 'bottom bottom', scrub: 0.5,
    onToggle(self) { setActive(self.isActive); },
    onUpdate(self) { drive(self.progress); },
  });
  ScrollTrigger.refresh();
}

function setActive(on) {
  active = on;
  if (!stage) return;
  stage.style.visibility = on ? 'visible' : 'hidden';
  stage.style.pointerEvents = 'none';
  if (on && !running) { running = true; raf = requestAnimationFrame(tick); }
}

/* ---------- scroll choreography ---------- */
function drive(p) {
  // 1) proper zipper — the gap opens progressively BEHIND the moving pull
  const z = smooth(0.0, 0.42, p);
  if (zipperTop) {
    const pull = z * 100;                 // pull x position (%)
    const openTop = 100 - z * 80;         // top half cut-height in the opened (left) region
    const openBot = z * 80;               // bottom half cut from the top in the opened region
    // left of the pull = parted (cut), right of the pull = still closed at the seam
    zipperTop.style.clipPath =
      'polygon(0% 0%, 100% 0%, 100% 100%, ' + pull + '% 100%, ' + pull + '% ' + openTop + '%, 0% ' + openTop + '%)';
    zipperBot.style.clipPath =
      'polygon(0% ' + openBot + '%, ' + pull + '% ' + openBot + '%, ' + pull + '% 0%, 100% 0%, 100% 100%, 0% 100%)';
    // final clearance so no sliver lingers once fully unzipped
    const clear = smooth(0.84, 1, z);
    zipperTop.style.transform = 'translateY(' + (-clear * 55) + '%)';
    zipperBot.style.transform = 'translateY(' + (clear * 55) + '%)';
    zipperPull.style.left = pull + '%';
    zipperPull.style.opacity = String(1 - smooth(0.9, 1, z));
  }
  if (cap) cap.style.opacity = String(1 - smooth(0.02, 0.2, p));

  // 2) camera pushes out — bigger & closer
  const reveal = smooth(0.24, 0.58, p);
  let camZ = lerp(-4.0, 1.4, reveal);     // ends closer to the viewer
  if (cam3d) {
    cam3d.scale.setScalar(lerp(0.25, 1.55, reveal));
    cam3d.rotation.y = lerp(0.6, 0, reveal) + Math.sin(p * 6.28) * 0.03;
    cam3d.rotation.x = lerp(0.35, 0, reveal);
  }

  // 3) cycle photos with a smooth crossfade (continuous fp)
  const ip = smooth(0.52, 0.94, p);
  lastFp = ip * (NPHOTOS - 1);
  drawScreen(lastFp);

  // 4) release
  const rel = smooth(0.93, 1, p);
  camZ -= rel * 3.5;
  if (cam3d) cam3d.position.z = camZ;
  if (stage) stage.style.opacity = String(smooth(0.04, 0.12, p) * (1 - smooth(0.92, 1, p)));
}

/* ---------- render loop ---------- */
function tick(t) {
  if (!active || window.__zipActive === false) { running = false; return; }
  if (cam3d) cam3d.position.y = Math.sin(t * 0.001) * 0.05;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}

function onResize() {
  if (!renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  ScrollTrigger && ScrollTrigger.refresh();
}

/* ---------- public entry (also called by the route controller) ---------- */
function ensureZip() {
  if (!isHome()) { if (stage) stage.style.visibility = 'hidden'; return; }
  buildStage();
  buildThree();
  ensureSpacer();
}
const prevEnsure = window.__pfEnsureLens;
window.__pfEnsureLens = function () { ensureZip(); if (typeof prevEnsure === 'function') {} };

// lightweight debug hook (read-only)
window.__zip = {
  get idx() { return curIdx; },
  get camZ() { return cam3d ? +cam3d.position.z.toFixed(2) : null; },
  get camScale() { return cam3d ? +cam3d.scale.x.toFixed(2) : null; },
  get active() { return active; },
  get rendering() { return running; },
  force(p) {
    active = true;
    if (stage) { stage.style.visibility = 'visible'; stage.style.opacity = '1'; stage.style.zIndex = '10000'; }
    drive(p);
    if (!running) { running = true; requestAnimationFrame(tick); }
  },
};

function boot() {
  if (!gsap || !ScrollTrigger || !window.WebGLRenderingContext) return;
  ensureZip();
  window.addEventListener('resize', onResize);
}
if (document.readyState === 'complete') setTimeout(boot, 300);
else window.addEventListener('load', () => setTimeout(boot, 300));
