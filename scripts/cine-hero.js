/* ===========================================================
   Cinematic Hero — "packing the bag"
   Stylized low-poly Three.js scene + GSAP scroll choreography.
   On load: objects burst out of an opening backpack.
   On scroll: objects arc back into the bag → bag closes →
   "Anshad" name reveal → dismiss into the site.
   =========================================================== */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

const hero    = document.getElementById('cine-hero');
const canvas  = document.getElementById('cine-canvas');
const flash   = document.getElementById('cine-flash');
const spacer  = document.getElementById('cine-spacer');
const content = document.getElementById('cine-content');
const kicker  = document.getElementById('cine-kicker');
const nameEl  = document.querySelector('#cine-hook span');
const tag     = document.getElementById('cine-tag');
const signEl  = document.getElementById('cine-sign');
const cue     = document.getElementById('cine-cue');
const skip    = document.getElementById('cine-skip');

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.__cineReady = true;

const ACCENT = 0xff5630;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

/* ---------- graceful fallback ---------- */
function bail() {
  if (gsap && gsap.set) gsap.set([kicker, tag], { opacity: 1, y: 0 });
  if (nameEl) { nameEl.style.clipPath = 'inset(0 0 0 0)'; nameEl.style.filter = 'blur(0)'; nameEl.style.opacity = '1'; }
  if (canvas) canvas.style.display = 'none';
  if (cue) cue.style.opacity = '1';
}
if (!gsap || !ScrollTrigger) { bail(); throw new Error('GSAP missing'); }
gsap.registerPlugin(ScrollTrigger);

/* ---------- smooth kinetic scroll (Lenis) ---------- */
let lenis;
if (window.Lenis && !window.__lenis) {
  lenis = new window.Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 1.0, touchMultiplier: 1.2 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
} else {
  lenis = window.__lenis;
}

/* ===========================================================
   THREE.JS
   =========================================================== */
let renderer, scene, camera, running = true, raf = 0;
let bag, bagFront, bagBack;
const items = [];                 // { group, floatPos, floatRot, bagPos, bagRot, introE, packStart, packDur, spin }
const state = { pack: 0 };        // scroll progress 0..1

try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.8, 9.6);
  camera.lookAt(0, 0.8, 0);   // horizontal framing: bag low (only its top shows), items above

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.AmbientLight(0x404657, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(5, 7, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f8cff, 1.7); rim.position.set(-7, 3, -5); scene.add(rim);
  const warm = new THREE.DirectionalLight(0xff8a5c, 0.8); warm.position.set(0, -4, 6); scene.add(warm);

  buildScene();
  setupScroll();
  if (!reduce) introBurst(); else staticReveal();

  tick(0);
  window.addEventListener('resize', onResize);
  window.__cine = {
    bagTopScreenPct(worldY) {
      const v = new THREE.Vector3(0, worldY == null ? -2.36 : worldY, 0).project(camera);
      return +(((1 - (v.y * 0.5 + 0.5)) * 100).toFixed(1)); // 0 = top of viewport, 100 = bottom
    },
  };
} catch (err) {
  console.error('[cine-hero] init failed:', err);
  bail();
}

/* ---------- materials ---------- */
function mat(color, metal, rough, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, metalness: metal, roughness: rough }, opts || {}));
}

/* ---------- object builders (stylized low-poly) ---------- */
function buildCamera() {
  const g = new THREE.Group();
  const body = mat(0x16181f, 0.7, 0.36), dark = mat(0x07080a, 0.5, 0.5), metal = mat(0xb9c0c9, 1, 0.25);
  const glass = mat(0x0a1733, 1, 0.05, { emissive: 0x14305f, emissiveIntensity: 0.4 });
  g.add(new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.0, 0.6, 5, 0.09), body));
  const prism = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.34, 0.5, 4, 0.06), body); prism.position.set(-0.05, 0.56, 0); g.add(prism);
  const shutter = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.07, 18), metal); shutter.position.set(0.55, 0.55, 0.12); g.add(shutter);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 10, 22), mat(ACCENT, 0.4, 0.4)); ring.rotation.x = Math.PI / 2; ring.position.set(0.55, 0.52, 0.12); g.add(ring);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.7, 36), dark); barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.5; g.add(barrel);
  const fr = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 14, 36), metal); fr.position.z = 0.82; g.add(fr);
  const gl = new THREE.Mesh(new THREE.CircleGeometry(0.37, 36), glass); gl.position.z = 0.8; g.add(gl);
  return g;
}
function buildLaptop() {
  const g = new THREE.Group();
  const shell = mat(0x9aa3ad, 1, 0.28), screen = mat(0x0b0e16, 0.6, 0.25, { emissive: 0x16243f, emissiveIntensity: 0.55 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.09, 1.15, 4, 0.05), shell); g.add(base);
  const lid = new THREE.Group(); lid.position.set(0, 0.04, -0.57);
  const panel = new THREE.Mesh(new RoundedBoxGeometry(1.7, 1.1, 0.07, 4, 0.05), shell); panel.position.y = 0.55; lid.add(panel);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.92), screen); scr.position.set(0, 0.55, 0.04); lid.add(scr);
  lid.rotation.x = -1.15; g.add(lid);
  return g;
}
function buildBooks() {
  const g = new THREE.Group();
  const colors = [0x2f6b5e, ACCENT, 0xe7e2d6];
  colors.forEach((c, i) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(1.35, 0.22, 0.95, 3, 0.03), mat(c, 0.1, 0.7));
    b.position.y = i * 0.24; b.rotation.y = (i - 1) * 0.06; g.add(b);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.18, 0.9), mat(0xf2efe6, 0, 0.9));
    pages.position.set(0.03, i * 0.24, 0); g.add(pages);
  });
  return g;
}
function buildPencils() {
  const g = new THREE.Group();
  const woods = [0xff9f1c, 0xffbf69, 0xf25c54];
  woods.forEach((c, i) => {
    const p = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6), mat(c, 0.2, 0.55)); p.add(body);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), mat(0xe8d5b5, 0.1, 0.6)); tip.position.y = 0.74; p.add(tip);
    const lead = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), mat(0x222, 0.2, 0.6)); lead.position.y = 0.84; p.add(lead);
    p.position.x = (i - 1) * 0.16; p.rotation.z = (i - 1) * 0.14; g.add(p);
  });
  g.rotation.z = 0.5;
  return g;
}
function buildStylus() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 1.5, 20), mat(0xd8dce1, 0.9, 0.25)); g.add(body);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 20), mat(0x2b2b2b, 0.5, 0.4)); tip.position.y = -0.82; g.add(tip);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 20), mat(ACCENT, 0.4, 0.4)); band.position.y = 0.4; g.add(band);
  g.rotation.z = 0.4;
  return g;
}
function buildSwatch() {
  const g = new THREE.Group();
  const card = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.78, 0.06, 4, 0.06), mat(0x14161c, 0.3, 0.5)); g.add(card);
  const dots = [ACCENT, 0x4f8cff, 0x37d39b];
  dots.forEach((c, i) => {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24), mat(c, 0.2, 0.45));
    d.rotation.x = Math.PI / 2; d.position.set(-0.32 + i * 0.32, 0.12, 0.05); g.add(d);
  });
  const bar = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.1, 0.04, 2, 0.04), mat(0x3a3f4b, 0.2, 0.5)); bar.position.set(0, -0.2, 0.05); g.add(bar);
  return g;
}

function buildCap() {
  const g = new THREE.Group();
  const red = mat(0xe23b2e, 0.05, 0.58), redDark = mat(0xbf2c20, 0.05, 0.62);
  // crown (dome)
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.62, 30, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), red);
  crown.scale.set(1, 0.82, 1); g.add(crown);
  // panel seams hint
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.012, 8, 30), redDark);
  seam.rotation.x = Math.PI / 2; seam.position.y = 0.18; seam.scale.set(1, 1, 0.7); g.add(seam);
  // curved brim (front)
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 30, 1, false, -Math.PI / 2, Math.PI), redDark);
  brim.position.set(0, 0.0, 0.34); brim.scale.set(1, 1, 1.55); brim.rotation.x = -0.12; g.add(brim);
  // button on top
  const btn = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), redDark); btn.position.y = 0.52; g.add(btn);
  return g;
}

function buildShades() {
  const g = new THREE.Group();
  const frame = mat(0x23232c, 0.45, 0.35);   // lighter so it reads against black
  const glass = mat(0x2a4a6e, 0.95, 0.08, { emissive: 0x16335e, emissiveIntensity: 0.5 });
  [-0.42, 0.42].forEach((x) => {
    const fr = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.5, 0.09, 4, 0.13), frame);
    fr.position.set(x, 0, 0); fr.rotation.z = -x * 0.1; g.add(fr);
    const ln = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.4, 0.04, 4, 0.1), glass);
    ln.position.set(x, 0, 0.04); ln.rotation.z = -x * 0.1; g.add(ln);
  });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.09), frame); bridge.position.set(0, 0.11, 0.02); g.add(bridge);
  [-0.76, 0.76].forEach((x) => {
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.06, 0.06, 2, 0.03), frame);
    arm.position.set(x, 0.09, -0.3); arm.rotation.y = x > 0 ? -0.55 : 0.55; g.add(arm);
  });
  return g;
}

function buildBag() {
  const g = new THREE.Group();
  const fabric  = mat(0x2c4156, 0.08, 0.82);   // main matte fabric (deep teal-navy)
  const fabric2 = mat(0x213447, 0.08, 0.85);   // darker panels / pockets
  const fabric3 = mat(0x33506a, 0.08, 0.8);    // lighter top section
  const strap   = mat(0x15212e, 0.15, 0.72);
  const interior = mat(0x04060a, 0.0, 1.0);
  const zip     = mat(ACCENT, 0.35, 0.42);     // accent zip tape
  const metal   = mat(0xc9ced6, 0.95, 0.3);    // sliders
  const teeth   = mat(0xd9dde3, 0.9, 0.32);    // zipper teeth

  // ---- body: lower (wider) + upper rounded section ----
  const lower = new THREE.Mesh(new RoundedBoxGeometry(2.7, 2.2, 1.75, 6, 0.5), fabric);
  lower.position.y = -0.55; g.add(lower);
  const upper = new THREE.Mesh(new RoundedBoxGeometry(2.45, 1.55, 1.6, 6, 0.55), fabric3);
  upper.position.y = 1.0; g.add(upper);

  // dark open interior, visible through the unzipped top
  const mouth = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.8, 1.2, 4, 0.16), interior);
  mouth.position.y = 1.5; g.add(mouth);

  // ---- OPEN TOP ZIPPER : two toothed lips that part, + sliders ----
  function buildLip(sign) {                 // sign +1 = front lip, -1 = back lip
    const grp = new THREE.Group();
    const tape = new THREE.Mesh(new RoundedBoxGeometry(2.15, 0.15, 0.16, 3, 0.06), fabric2);
    grp.add(tape);
    const acc = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.05, 0.05), zip);
    acc.position.set(0, 0.06, sign * 0.05); grp.add(acc);
    const n = 18;
    for (let i = 0; i < n; i++) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.13), teeth);
      t.position.set(-1.02 + i * (2.04 / (n - 1)), -0.02, -sign * 0.1);
      grp.add(t);
    }
    return grp;
  }
  bagFront = buildLip(1);  bagFront.position.set(0, 1.8, 0.62);
  bagBack  = buildLip(-1); bagBack.position.set(0, 1.8, -0.62);
  g.add(bagFront); g.add(bagBack);
  // two sliders parked at the open end
  [0.42, -0.42].forEach((z) => {
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.15, 0.24, 2, 0.05), metal);
    body.position.set(1.0, 1.8, z); g.add(body);
    const pull = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.24, 0.05, 2, 0.04), metal);
    pull.position.set(1.13, 1.66, z); g.add(pull);
  });

  // ---- front pocket with curved lid + zipper ----
  const pocket = new THREE.Mesh(new RoundedBoxGeometry(1.95, 1.45, 0.55, 5, 0.32), fabric2);
  pocket.position.set(0, -0.65, 0.78); g.add(pocket);
  const pocketLid = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.6, 0.62, 5, 0.26), fabric);
  pocketLid.position.set(0, 0.02, 0.82); g.add(pocketLid);
  const pz = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.05), zip); pz.position.set(0, -0.28, 1.06); g.add(pz);
  const pzPull = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.18, 0.06, 2, 0.03), metal); pzPull.position.set(0.4, -0.28, 1.08); g.add(pzPull);

  // ---- side pockets ----
  [-1, 1].forEach((s) => {
    const sp = new THREE.Mesh(new RoundedBoxGeometry(0.42, 1.5, 1.05, 4, 0.22), fabric2);
    sp.position.set(s * 1.45, -0.55, 0.12); g.add(sp);
  });

  // ---- top grab handle ----
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.075, 12, 28, Math.PI), strap);
  handle.position.set(0, 2.05, -0.25); g.add(handle);

  // ---- shoulder straps (on the back, peeking over the top) ----
  [-0.62, 0.62].forEach((x) => {
    const st2 = new THREE.Mesh(new RoundedBoxGeometry(0.42, 2.7, 0.16, 4, 0.08), strap);
    st2.position.set(x, 0.0, -0.9); st2.rotation.x = 0.08; g.add(st2);
    const adj = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.18, 0.1, 2, 0.04), metal);
    adj.position.set(x, -0.7, -0.86); g.add(adj);
  });

  return g;
}

// 0 = zipped/closed, 1 = fully open (lips parted, interior shows)
function setBagOpen(t) {
  if (!bagFront) return;
  bagFront.position.z = 0.62 + t * 0.5;
  bagBack.position.z = -0.62 - t * 0.5;
  bagFront.position.y = 1.8 + t * 0.06;
  bagBack.position.y = 1.8 + t * 0.06;
}

/* ---------- assemble scene ---------- */
function buildScene() {
  bag = buildBag();
  bag.position.set(0, -3.2, 0);   // large, grounded at the bottom
  bag.scale.setScalar(1.35);
  bag.rotation.x = 0.34;          // tilt the open top toward the viewer so the zipper shows
  scene.add(bag);

  const defs = [
    { make: buildCamera,  float: [-2.7, 1.5, 0.2],   rot: [0.2, -0.5, 0.05],  scale: 1.0 },
    { make: buildLaptop,  float: [ 2.75, 1.05, -0.3], rot: [0.25, 0.6, 0.0],  scale: 0.95 },
    { make: buildBooks,   float: [-1.55, 2.85, 0.0],  rot: [0.1, 0.3, 0.2],   scale: 0.8 },
    { make: buildPencils, float: [ 1.35, 2.9, 0.3],   rot: [0.3, 0.0, 0.4],   scale: 1.0 },
    { make: buildStylus,  float: [-0.35, 2.25, 0.7],  rot: [0.2, 0.2, 0.5],   scale: 0.9 },
    { make: buildSwatch,  float: [ 2.6, 2.45, 0.3],   rot: [0.1, -0.5, -0.1], scale: 0.95 },
    { make: buildCap,     float: [-2.5, 0.45, 0.8],   rot: [0.25, 0.35, 0.1], scale: 1.15 },
    { make: buildShades,  float: [ 0.55, 0.85, 1.15], rot: [0.3, -0.3, 0.08], scale: 1.3 },
  ];

  defs.forEach((d, i) => {
    const group = d.make();
    group.scale.setScalar(0);
    scene.add(group);
    items.push({
      group,
      floatPos: new THREE.Vector3(d.float[0], d.float[1], d.float[2]),
      floatRot: new THREE.Euler(d.rot[0], d.rot[1], d.rot[2]),
      bagPos: new THREE.Vector3((Math.random() - 0.5) * 0.6, -0.9, 0.3),  // into the bag's open mouth
      baseScale: d.scale,
      introE: 0,
      packStart: i * 0.07,          // stagger order of falling in
      packDur: 0.42,
      spin: (i % 2 ? 1 : -1) * (2 + Math.random()),
      seed: Math.random() * 6.28,
    });
  });
}

/* ---------- intro burst (autoplay) ---------- */
function introBurst() {
  const bs = { o: 0 };
  gsap.to(bs, { o: 1, duration: 1.1, ease: 'power3.out', delay: 0.15, onUpdate: () => setBagOpen(bs.o) }); // unzip the top
  items.forEach((it, i) => {
    gsap.to(it, { introE: 1, duration: 1.2, ease: 'back.out(1.5)', delay: 0.25 + i * 0.1 });
  });
  gsap.fromTo(cue, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.7 });
}

function staticReveal() {
  setBagOpen(1);
  items.forEach((it) => { it.introE = 1; });
  gsap.set([kicker, tag, signEl], { opacity: 1, y: 0 });
  if (nameEl) { nameEl.style.clipPath = 'inset(0 0 0 0)'; nameEl.style.filter = 'blur(0)'; nameEl.style.opacity = '1'; }
  if (cue) cue.style.opacity = '1';
}

/* ---------- scroll choreography ---------- */
function setupScroll() {
  ScrollTrigger.create({
    trigger: spacer, start: 'top top', end: 'bottom top', scrub: 0.5,
    onUpdate(self) {
      state.pack = self.progress;
      const p = self.progress;

      // zipper closes back up as things go in
      setBagOpen(1 - smooth(0.5, 0.72, p));

      // shutter-style flash as the name appears
      const fl = Math.exp(-Math.pow((p - 0.6) / 0.028, 2));
      flash.style.opacity = String(fl * 0.85);

      // name + copy reveal
      const nr = smooth(0.6, 0.78, p);
      if (nameEl) {
        nameEl.style.clipPath = 'inset(0 ' + (100 - nr * 100) + '% 0 0)';
        nameEl.style.filter = 'blur(' + (1 - nr) * 14 + 'px)';
        nameEl.style.opacity = String(nr);
      }
      kicker.style.opacity = String(smooth(0.56, 0.66, p));
      kicker.style.transform = 'translateY(' + (1 - smooth(0.56, 0.66, p)) * 12 + 'px)';
      tag.style.opacity = String(smooth(0.72, 0.84, p));
      tag.style.transform = 'translateY(' + (1 - smooth(0.72, 0.84, p)) * 14 + 'px)';
      if (signEl) signEl.style.opacity = String(smooth(0.8, 0.9, p));
      cue.style.opacity = String(1 - smooth(0.55, 0.7, p));

      // dismiss whole hero
      const fade = smooth(0.84, 1, p);
      hero.style.opacity = String(1 - fade);
      content.style.transform = 'translateY(' + -p * 40 + 'px)';
      const done = p >= 0.999;
      hero.style.pointerEvents = done ? 'none' : '';
      if (!done && !running) { running = true; tick(performance.now()); }
      if (done) running = false;
    },
  });
}

/* ---------- per-frame object update ---------- */
const _v = new THREE.Vector3();
function updateItems(time) {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const e = it.introE;                              // 0..1 burst-out
    const lp = clamp01((state.pack - it.packStart) / it.packDur); // 0..1 fall into bag
    const idle = (state.pack < 0.04 ? 1 : 0) * e;     // idle only at rest

    // float anchor (with gentle bob when idle)
    const fx = it.floatPos.x;
    const fy = it.floatPos.y + Math.sin(time * 0.0012 + it.seed) * 0.12 * idle;
    const fz = it.floatPos.z;

    // start point = bag mouth (pre-burst)
    const sx = 0, sy = -0.9, sz = 0.3;
    // current floating position after burst
    const cx = lerp(sx, fx, e), cy = lerp(sy, fy, e), cz = lerp(sz, fz, e);

    // descend into the bag (gentle arc — reads as "dropping in")
    const px = lerp(cx, it.bagPos.x, lp);
    const py = lerp(cy, it.bagPos.y, lp) + Math.sin(lp * Math.PI) * 0.35;
    const pz = lerp(cz, it.bagPos.z, lp);
    it.group.position.set(px, py, pz);

    // rotation: float pose → tumble as it drops in, plus idle spin
    it.group.rotation.set(
      it.floatRot.x + lp * it.spin * 1.2 + Math.sin(time * 0.0009 + it.seed) * 0.05 * idle,
      it.floatRot.y + lp * it.spin + time * 0.00015 * idle,
      it.floatRot.z + lp * it.spin * 0.6
    );

    const s = it.baseScale * e * lerp(1, 0.55, lp);
    it.group.scale.setScalar(s);
  }
}

/* ---------- render loop ---------- */
function tick(t) {
  if (window.__cineActive === false) { raf = requestAnimationFrame(tick); return; }
  updateItems(t);
  if (bag) bag.position.y = -3.2 + Math.sin(t * 0.0008) * 0.04;
  renderer.render(scene, camera);
  if (running) raf = requestAnimationFrame(tick);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  ScrollTrigger && ScrollTrigger.refresh();
}

/* ---------- skip ---------- */
skip && skip.addEventListener('click', () => {
  const y = spacer.offsetHeight + 4;
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
});

/* ===========================================================
   Route control — show the intro ONLY on the home route
   (Framer SPA-navigates and keeps body-level DOM around).
   =========================================================== */
function routeIsHome() {
  const p = location.pathname.replace(/index\.html?$/i, '').replace(/\/+$/, '');
  return p === '';
}
function setHomeActive(home) {
  window.__cineActive = home;
  ['cine-hero', 'cine-spacer', 'pf-intro'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = home ? '' : 'none';
  });
  if (home) {
    if (renderer && !running) { running = true; requestAnimationFrame(tick); }
    if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
    const ensure = window.__pfEnsureLens;
    if (ensure) { ensure(); setTimeout(ensure, 400); setTimeout(ensure, 1000); }
  }
}
function applyRoute() { setHomeActive(routeIsHome()); }

// debug (read-only)
window.__cine = {
  get count() { return items.length; },
  list() { return items.map((it, i) => ({ i, e: +it.introE.toFixed(2), x: +it.group.position.x.toFixed(1), y: +it.group.position.y.toFixed(1), z: +it.group.position.z.toFixed(1), s: +it.group.scale.x.toFixed(2), kids: it.group.children.length })); },
};
['pushState', 'replaceState'].forEach((m) => {
  const orig = history[m];
  history[m] = function () { const r = orig.apply(this, arguments); setTimeout(applyRoute, 0); return r; };
});
window.addEventListener('popstate', () => setTimeout(applyRoute, 0));
window.addEventListener('hashchange', () => setTimeout(applyRoute, 0));
document.addEventListener('click', (e) => {
  const a = e.target && e.target.closest && e.target.closest('a[href]');
  if (a) [80, 300, 700, 1200].forEach((t) => setTimeout(applyRoute, t));
}, true);
applyRoute();
