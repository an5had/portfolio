/* ============================================================
   an5had portfolio v2 — interaction + 3D engine
   ============================================================ */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- smooth scroll ---------------- */
let lenis;
if (window.Lenis && !reduce) {
  lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // anchor links → smooth
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { offset: 0, duration: 1.2 }); }
    });
  });
}

/* ---------------- custom cursor ---------------- */
(function cursor() {
  const dot = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || window.matchMedia('(hover: none)').matches) return;
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
  (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => { ring.classList.add('is-hover'); if (el.dataset.cursor === 'view') ring.classList.add('is-view'); });
    el.addEventListener('mouseleave', () => { ring.classList.remove('is-hover', 'is-view'); });
  });
})();

/* ---------------- magnetic ---------------- */
document.querySelectorAll('[data-magnetic]').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.5, ease: 'power3.out' });
  });
  el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }));
});

/* ---------------- split words for line reveals ---------------- */
function splitWords(el) {
  const out = [];
  el.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (part.trim() === '') { out.push(document.createTextNode(part)); return; }
        const s = document.createElement('span'); s.className = 'word'; s.textContent = part; out.push(s);
      });
    } else {
      node.classList && node.classList.add('word');
      out.push(node);
    }
  });
  el.textContent = '';
  out.forEach((n) => el.appendChild(n));
  return el.querySelectorAll('.word');
}

/* ---------------- reveal animations ---------------- */
function initReveals() {
  // simple fade-up batches
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  // line-by-line word reveals
  gsap.utils.toArray('.reveal-lines').forEach((el) => {
    const words = splitWords(el);
    gsap.to(words, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.025,
      scrollTrigger: { trigger: el, start: 'top 82%' } });
  });
  // underline sweeps
  gsap.utils.toArray('.u').forEach((u) => {
    gsap.fromTo(u, { '--ux': 0 }, { '--ux': 1, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: u, start: 'top 85%' } });
  });
  // count-ups
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const obj = { v: 0 };
    gsap.to(obj, { v: end, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = pre + Math.round(obj.v) + suf; } });
  });
  // parallax media
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.fromTo(el, { y: 40 }, { y: -40, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ---------------- marquee ---------------- */
function initMarquee() {
  const track = document.getElementById('marquee');
  if (!track) return;
  const w = track.scrollWidth / 2;
  gsap.to(track, { x: -w, duration: 22, ease: 'none', repeat: -1, modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % w) } });
}

/* ---------------- lens horizontal scroll ---------------- */
function initLens() {
  const track = document.getElementById('lens-track');
  if (!track) return;
  const dist = track.scrollWidth - innerWidth + innerWidth * 0.1;
  if (dist <= 0) return;
  gsap.to(track, { x: -dist, ease: 'none',
    scrollTrigger: { trigger: '.lens', start: 'top 65%', end: '+=' + dist, scrub: 0.6 } });
}

/* ---------------- hero title ---------------- */
function heroIntro() {
  const tl = gsap.timeline({ delay: 0.15 });
  tl.to('.hero-title .w', { y: 0, duration: 1, ease: 'power4.out', stagger: 0.06 })
    .fromTo('.hero-kicker', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
    .fromTo(['.hero-sub', '.hero-foot', '.hero-side'], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.5);
}

/* ============================================================
   THREE.JS — floating DSLR camera (hero)
   ============================================================ */
function initThree() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.AmbientLight(0x3a4055, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(5, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f8cff, 1.8); rim.position.set(-7, 2, -5); scene.add(rim);
  const warm = new THREE.PointLight(0xff7a4d, 12, 30); warm.position.set(-3, -2, 4); scene.add(warm);

  const m = (c, me, r, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: me, roughness: r }, o || {}));
  const cam = new THREE.Group();
  const body = m(0x17181e, 0.72, 0.34), dark = m(0x070809, 0.5, 0.5), metal = m(0xb9c0c9, 1, 0.22);
  const glass = m(0x0a1733, 1, 0.04, { emissive: 0x16345f, emissiveIntensity: 0.55 });
  cam.add(new THREE.Mesh(new RoundedBoxGeometry(3.3, 2.1, 1.2, 6, 0.16), body));
  const grip = new THREE.Mesh(new RoundedBoxGeometry(0.72, 2.0, 1.25, 5, 0.24), dark); grip.position.x = 1.65; cam.add(grip);
  const prism = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.7, 0.95, 4, 0.1), body); prism.position.set(-0.15, 1.2, 0); cam.add(prism);
  const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.5), metal); shoe.position.set(-0.15, 1.6, 0); cam.add(shoe);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 36), dark); dial.position.set(-1.2, 1.2, -0.1); cam.add(dial);
  const shutter = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.14, 28), metal); shutter.position.set(1.15, 1.18, 0.25); cam.add(shutter);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 12, 28), m(0xff5630, 0.4, 0.4)); ring.rotation.x = Math.PI / 2; ring.position.set(1.15, 1.12, 0.25); cam.add(ring);
  const lens = new THREE.Group();
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.92, 1.5, 56), dark);
  barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.92; lens.add(barrel);
  [0.66, 1.04].forEach((z) => { const r2 = new THREE.Mesh(new THREE.CylinderGeometry(0.94, 0.94, 0.16, 56), body); r2.rotation.x = Math.PI / 2; r2.position.z = z; lens.add(r2); });
  const fr = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.09, 18, 56), metal); fr.position.z = 1.66; lens.add(fr);
  const gl = new THREE.Mesh(new THREE.SphereGeometry(0.78, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.32), glass); gl.rotation.x = -Math.PI / 2; gl.position.z = 1.62; lens.add(gl);
  cam.add(lens);
  cam.scale.setScalar(0);
  scene.add(cam);

  // position upper-right, away from the bottom-left headline
  const home = new THREE.Vector3(1.7, 1.0, 0);
  cam.position.copy(home);
  cam.rotation.set(0.15, -0.6, 0.05);

  gsap.to(cam.scale, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'power3.out', delay: 0.3 });
  gsap.from(cam.rotation, { y: -Math.PI * 1.2, duration: 1.8, ease: 'power3.out', delay: 0.3 });

  // scroll parallax / spin across the page
  let scrollP = 0;
  if (ScrollTrigger) {
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6,
      onUpdate: (self) => { scrollP = self.progress; } });
  }

  let raf;
  function tick(t) {
    cam.position.y = home.y + Math.sin(t * 0.0008) * 0.12 - scrollP * 2.2;
    cam.position.x = home.x + Math.sin(t * 0.0005) * 0.06;
    cam.rotation.y = -0.6 + Math.sin(t * 0.0004) * 0.12 + scrollP * 1.4;
    cam.rotation.x = 0.15 + scrollP * 0.5;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick(0);
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

/* ---------------- nav fill on scroll dir (subtle) ---------------- */
function initNav() {
  const nav = document.getElementById('nav');
  let last = 0;
  ScrollTrigger.create({ start: 0, end: 'max',
    onUpdate: (self) => { const y = self.scroll(); nav.style.transform = (y > last && y > 300) ? 'translateY(-110%)' : 'translateY(0)'; nav.style.transition = 'transform 0.4s var(--ease)'; last = y; } });
}

/* ---------------- boot ---------------- */
function boot() {
  if (!gsap || !ScrollTrigger) { document.getElementById('loader')?.classList.add('done'); return; }
  initThree();
  initReveals();
  initMarquee();
  initLens();
  initNav();
  heroIntro();
  ScrollTrigger.refresh();
}

// loader → boot
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const bar = document.querySelector('.loader-bar span');
  const finish = () => { loader && loader.classList.add('done'); boot(); };
  if (bar && gsap) {
    gsap.to(bar, { width: '100%', duration: 0.9, ease: 'power2.inOut', onComplete: finish });
  } else { finish(); }
});
