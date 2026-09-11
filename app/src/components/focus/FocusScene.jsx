/* The focus board, in Three.js.
   A dozen dashboard fragments float at different depths. A virtual lens pulls focus: each card's
   blur (circle of confusion) comes from its distance to a moving focal plane, rendered in-shader
   with a Poisson-disc sample over mipmapped textures — real depth-of-field, crisp the moment a card
   sits on the plane. As p advances the fragments travel into a 12-column grid, duplicates collapse
   into their primary, and each card cross-fades from its MESS paint job to its CLEAN one while it's
   still soft.

   Everything is driven imperatively from one useFrame (no React renders per frame). The camera is
   fitted so the finished board fills the layout "slot" the DOM reserves for it, via setViewOffset,
   so the canvas can stay full-bleed behind the copy. */
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BOARD, CARDS, AUDIT, COL, R_CLEAN, paintCard } from './focusCards.js';
import { phases, smooth, lerp, clamp01 } from './focusMath.js';
import { getTheme } from '../../theme.js';

const DEG = Math.PI / 180;
const FOV = 26;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SDF = /* glsl */`
  float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
`;

const CARD_FRAG = /* glsl */`
  uniform sampler2D uMess; uniform sampler2D uClean;
  uniform float uSwap, uCoc, uOpacity, uRadius, uSheen, uHover;
  uniform vec2 uSize, uTexPx;
  varying vec2 vUv;
  ${SDF}
  const vec2 P[12] = vec2[12](
    vec2(-0.326,-0.406), vec2(-0.840,-0.074), vec2(-0.696, 0.457), vec2(-0.203, 0.621),
    vec2( 0.962,-0.195), vec2( 0.473,-0.480), vec2( 0.519, 0.767), vec2( 0.185,-0.893),
    vec2( 0.507, 0.064), vec2( 0.896, 0.412), vec2(-0.322,-0.933), vec2(-0.792,-0.598));
  vec3 lens(sampler2D t, vec2 uv, vec2 r, float lod) {
    if (r.x < 0.0004) return texture(t, uv).rgb;
    vec3 c = textureLod(t, uv, lod).rgb;
    for (int i = 0; i < 12; i++) c += textureLod(t, uv + P[i] * r, lod).rgb;
    return c / 13.0;
  }
  void main() {
    float rw = uCoc * 0.2;                         // blur radius, world units
    vec2 r = vec2(rw / uSize.x, rw / uSize.y);
    float lod = log2(max(1.0, r.x * uTexPx.x * 0.55));
    vec3 cm = uSwap < 0.999 ? lens(uMess, vUv, r, lod) : vec3(0.0);
    vec3 cc = uSwap > 0.001 ? lens(uClean, vUv, r, lod) : vec3(0.0);
    vec3 col = mix(cm, cc, uSwap);

    vec2 p = (vUv - 0.5) * uSize;
    float soft = 0.004 + rw * 0.85;                // edges defocus with the face
    float d = sdRound(p, uSize * 0.5 - soft, max(uRadius - soft, 0.0));
    float a = 1.0 - smoothstep(-soft, soft, d);

    float band = vUv.x * 0.9 + (1.0 - vUv.y) * 0.45 - uSheen;   // one-shot light sweep on focus lock
    col += exp(-band * band * 70.0) * 0.07;
    col += uHover * 0.03;
    gl_FragColor = vec4(col, a * uOpacity);
  }
`;

const SHADOW_FRAG = /* glsl */`
  uniform vec2 uSize, uQuad; uniform float uRadius, uOpacity, uSpread;
  varying vec2 vUv;
  ${SDF}
  void main() {
    vec2 p = (vUv - 0.5) * uQuad;
    float d = sdRound(p, uSize * 0.5, uRadius);
    float a = 1.0 - smoothstep(-uSpread * 0.35, uSpread, d);
    gl_FragColor = vec4(0.0, 0.0, 0.0, a * a * uOpacity);
  }
`;

const BACK_FRAG = /* glsl */`
  uniform vec2 uSize; uniform float uRadius, uOpacity, uGrid, uCoc, uPad, uCol, uGut;
  uniform vec3 uBase; uniform float uEdge; uniform vec3 uAccent;
  varying vec2 vUv;
  ${SDF}
  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float soft = 0.004 + uCoc * 0.17;
    float d = sdRound(p, uSize * 0.5 - soft, uRadius);
    float a = 1.0 - smoothstep(-soft, soft, d);
    vec3 col = uBase + (vUv.y - 0.5) * 0.018;
    col += (1.0 - smoothstep(0.0, 0.016 + soft, abs(d + 0.012))) * uEdge;      // hairline bezel (lighter on dark, darker on light)
    // Figma-style layout grid: 12 translucent red columns
    float gx = p.x + uSize.x * 0.5 - uPad;
    float m = mod(gx, uCol + uGut);
    float colMask = smoothstep(0.0, 0.01, m) * (1.0 - smoothstep(uCol - 0.01, uCol, m));
    colMask *= step(0.0, gx) * step(gx, uSize.x - 2.0 * uPad);
    colMask *= 1.0 - smoothstep(uSize.y * 0.5 - uPad - 0.01, uSize.y * 0.5 - uPad, abs(p.y));
    col = mix(col, uAccent, colMask * uGrid * 0.13);
    gl_FragColor = vec4(col, a * uOpacity);
  }
`;

function makeTexture(card, variant, ppu, aniso, theme) {
  const dw = card.w * 100, dh = card.h * 100;
  let k = Math.max(1, ppu / 100);
  k = Math.min(k, 1800 / Math.max(dw, dh));
  const cv = document.createElement('canvas');
  cv.width = Math.round(dw * k);
  cv.height = Math.round(dh * k);
  const ctx = cv.getContext('2d');
  ctx.scale(cv.width / dw, cv.height / dh);
  paintCard(card.id, variant, ctx, dw, dh, theme);
  const t = new THREE.CanvasTexture(cv);
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = aniso;
  return { tex: t, w: cv.width, h: cv.height };
}

function buildWorld(ppu, aniso, theme) {
  const light = theme === 'light';
  const root = new THREE.Group();
  const board = new THREE.Group();
  root.add(board);
  const quad = new THREE.PlaneGeometry(1, 1);

  const backMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: BACK_FRAG, transparent: true, depthWrite: false,
    uniforms: {
      uSize: { value: new THREE.Vector2(BOARD.W, BOARD.H) }, uRadius: { value: BOARD.R }, uOpacity: { value: 0 },
      uGrid: { value: 0 }, uCoc: { value: 1 }, uPad: { value: BOARD.PAD }, uCol: { value: COL }, uGut: { value: BOARD.GUT },
      // board surface: near-black app chrome in dark, warm stone (#f2efed) in light
      uBase: { value: light ? new THREE.Vector3(0.949, 0.937, 0.929) : new THREE.Vector3(0.043, 0.049, 0.066) },
      uEdge: { value: light ? -0.06 : 0.07 },
      uAccent: { value: light ? new THREE.Vector3(0.184, 0.271, 0.878) : new THREE.Vector3(0.455, 0.525, 1.0) },
    },
  });
  const back = new THREE.Mesh(quad, backMat);
  back.scale.set(BOARD.W, BOARD.H, 1);
  back.position.z = -0.1;
  board.add(back);

  const textures = [];
  const byId = {};
  const items = CARDS.map((c, i) => {
    const mess = makeTexture(c, 'mess', ppu, aniso, theme);
    const clean = makeTexture(c, 'clean', ppu, aniso, theme);
    textures.push(mess.tex, clean.tex);
    const g = new THREE.Group();
    const spread = 0.3;
    const shadowMat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: SHADOW_FRAG, transparent: true, depthWrite: false,
      uniforms: {
        uSize: { value: new THREE.Vector2(c.w, c.h) }, uQuad: { value: new THREE.Vector2(c.w + spread * 2.4, c.h + spread * 2.4) },
        uRadius: { value: c.rMess }, uOpacity: { value: 0.5 }, uSpread: { value: spread },
      },
    });
    const shadow = new THREE.Mesh(quad, shadowMat);
    shadow.scale.set(c.w + spread * 2.4, c.h + spread * 2.4, 1);
    shadow.position.set(0.03, -0.1, -0.05);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: CARD_FRAG, transparent: true, depthWrite: false,
      uniforms: {
        uMess: { value: mess.tex }, uClean: { value: clean.tex }, uSwap: { value: 0 }, uCoc: { value: 1 },
        uOpacity: { value: 1 }, uRadius: { value: c.rMess }, uSheen: { value: -2 }, uHover: { value: 0 },
        uSize: { value: new THREE.Vector2(c.w, c.h) }, uTexPx: { value: new THREE.Vector2(mess.w, mess.h) },
      },
    });
    const mesh = new THREE.Mesh(quad, mat);
    mesh.scale.set(c.w, c.h, 1);
    mesh.userData.card = i;
    g.add(shadow, mesh);
    board.add(g);
    const it = { c, g, mesh, mat, shadowMat, hover: 0 };
    byId[c.id] = it;
    return it;
  });

  const dispose = () => {
    textures.forEach((t) => t.dispose());
    items.forEach((it) => { it.mat.dispose(); it.shadowMat.dispose(); });
    backMat.dispose(); quad.dispose();
  };
  // drop shadows read heavier on a light page, so soften them there
  return { root, board, backMat, items, byId, dispose, shadowK: light ? 0.45 : 1 };
}

/* Fit the finished board into the DOM slot: distance from the slot's size, centre via view offset. */
function Rig({ slotRef }) {
  const { camera, size } = useThree();
  const last = useRef('');
  useFrame(() => {
    const s = slotRef.current;
    if (!s || !s.w || !s.h) return;
    const key = `${size.width}|${size.height}|${s.x}|${s.y}|${s.w}|${s.h}`;
    if (key === last.current) return;
    last.current = key;
    const t = Math.tan((FOV * DEG) / 2);
    // share of the slot the board fills — roomy on desktop, full on phones (where the slot is small).
    // Keep in step with the .vf box in index.css (box = fill + 0.08 margin).
    const fill = size.width < 900 ? 0.9 : 0.74;
    const d = Math.max(
      (BOARD.H * size.height) / (2 * t * s.h * fill),
      (BOARD.W * size.height) / (2 * t * s.w * fill),
    );
    camera.fov = FOV;
    camera.near = 0.1;
    camera.far = d + 60;
    camera.position.set(0, 0, d);
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(size.width, size.height, size.width / 2 - (s.x + s.w / 2), size.height / 2 - (s.y + s.h / 2), size.width, size.height);
    camera.updateProjectionMatrix();
  });
  return null;
}

const v3 = new THREE.Vector3();
function projectCard(it, camera, size, pad) {
  const px = 0.5 + pad / it.c.w, py = 0.5 + pad / it.c.h;
  const out = [];
  for (const [sx, sy] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
    v3.set(sx * px, sy * py, 0).applyMatrix4(it.mesh.matrixWorld).project(camera);
    out.push([(v3.x * 0.5 + 0.5) * size.width, (-v3.y * 0.5 + 0.5) * size.height]);
  }
  return out;
}

function World({ pRef, slotRef, auditRefs }) {
  const { gl, camera, size } = useThree();
  const [world, setWorld] = useState(null);
  const hover = useRef(-1);
  const par = useRef({ x: 0, y: 0 });
  const sweep = useRef(-1);
  const auditShown = useRef(true);
  const canHover = useRef(typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  // the board follows the site theme: repaint the textures + surface whenever it flips
  const [theme, setThemeState] = useState(getTheme);
  useEffect(() => {
    const on = (e) => setThemeState(e.detail);
    window.addEventListener('themechange', on);
    return () => window.removeEventListener('themechange', on);
  }, []);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        await Promise.all(['400', '500', '600'].map((w) => document.fonts.load(`${w} 16px "Google Sans Flex"`)));
      } catch { /* fall back to system fonts */ }
      if (dead) return;
      const slotW = slotRef.current?.w || 720;
      const ppu = (slotW / BOARD.W) * Math.min(2, window.devicePixelRatio || 1) * 1.25;
      setWorld(buildWorld(ppu, Math.min(8, gl.capabilities.getMaxAnisotropy()), theme));
    })();
    return () => { dead = true; };
  }, [gl, slotRef, theme]);

  // free a world only once its replacement is on screen, so a theme flip never shows a blank frame
  const shown = useRef(null);
  useEffect(() => {
    const old = shown.current;
    shown.current = world;
    if (old && old !== world) old.dispose();
  }, [world]);
  useEffect(() => () => shown.current?.dispose(), []);

  useFrame((state, dt) => {
    if (!world) return;
    const p = pRef.current;
    const ph = phases(p);
    const t = state.clock.elapsedTime;
    const S = ph.settle;

    if (canHover.current) {
      par.current.x += (state.pointer.x - par.current.x) * Math.min(1, dt * 2.5);
      par.current.y += (state.pointer.y - par.current.y) * Math.min(1, dt * 2.5);
    }
    const loose = 1 - 0.65 * S;
    world.board.rotation.set(
      lerp(-0.2, 0, S) - par.current.y * 0.05 * loose,
      lerp(0.26, 0, S) + par.current.x * 0.07 * loose,
      lerp(-0.03, 0, S),
    );

    const coc = (z) => clamp01(Math.abs(z - ph.focusZ) * 0.22 + ph.haze * 0.08);

    const bu = world.backMat.uniforms;
    bu.uOpacity.value = smooth(0.42, 0.88, p);
    bu.uGrid.value = ph.grid;
    bu.uCoc.value = coc(-0.1);

    // focus-lock light sweep, once per arrival
    if (ph.lock > 0.98 && sweep.current < 0) sweep.current = t;
    if (p < 0.9) sweep.current = -1;
    const sheen = sweep.current < 0 ? -2 : lerp(-0.7, 2.0, clamp01((t - sweep.current) / 1.15));

    for (let i = 0; i < world.items.length; i++) {
      const it = world.items[i];
      const { c } = it;
      const m = c.mess;
      const target = c.into ? world.byId[c.into].c : c;
      const si = ease(smooth(0.3 + c.delay * 0.12, 0.78 + c.delay * 0.06, p));
      const ri = 1 - Math.pow(1 - si, 2);
      const bob = Math.sin(t * 0.6 + i * 1.7) * 0.05 * (1 - si);

      const hovered = hover.current === i && S > 0.92 && !c.into;
      it.hover += ((hovered ? 1 : 0) - it.hover) * Math.min(1, dt * 10);

      let z = lerp(m.z, 0, si) + Math.sin(si * Math.PI) * 0.45 + it.hover * 0.12;
      if (c.into) z -= 0.04 * si;
      it.g.position.set(lerp(m.x, target.cx, si), lerp(m.y, target.cy, si) + bob, z);
      it.g.rotation.set(lerp(m.rx, 0, ri) * DEG, lerp(m.ry, 0, ri) * DEG, lerp(m.rz, 0, ri) * DEG);

      let scale = lerp(m.s, 1, si);
      let opacity = 1;
      if (c.into) {
        scale *= lerp(1, 0.5, ph.merge);
        opacity = 1 - smooth(0.15, 0.9, ph.merge);
      }
      it.g.scale.setScalar(scale);
      it.g.visible = opacity > 0.003;

      const swap = smooth(0.5 + c.delay * 0.05, 0.64 + c.delay * 0.05, p);
      const u = it.mat.uniforms;
      const k = coc(z);
      u.uCoc.value = k;
      u.uSwap.value = swap;
      u.uRadius.value = lerp(c.rMess, R_CLEAN, swap);
      u.uOpacity.value = opacity;
      u.uSheen.value = sheen - (c.delay * 0.5);
      u.uHover.value = it.hover;
      const su = it.shadowMat.uniforms;
      su.uOpacity.value = opacity * lerp(0.55, 0.3, si) * (1 - k * 0.4) * world.shadowK;
      su.uRadius.value = u.uRadius.value;
      su.uSpread.value = 0.18 + k * 0.12 + (1 - si) * 0.1;
    }

    // MAP: dashed outlines + tags, projected from the live card corners
    const refs = auditRefs.current;
    if (ph.audit > 0.002 && refs.svg) {
      world.root.updateMatrixWorld(true);
      const placed = [];
      AUDIT.forEach((grp, gi) => {
        for (const id of grp.ids) {
          const el = refs.polys[`${grp.n}|${id}`];
          const it = world.byId[id];
          if (!el) continue;
          if (!it.g.visible) { el.setAttribute('points', ''); continue; }
          el.setAttribute('points', projectCard(it, camera, size, 0.07).map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' '));
        }
        const tag = refs.tags[gi];
        if (tag) {
          const pts = projectCard(world.byId[grp.anchor], camera, size, 0.07);
          const x = Math.min(...pts.map((q) => q[0])), y = Math.min(...pts.map((q) => q[1]));
          const tw = tag.offsetWidth, th = tag.offsetHeight;
          const tx = Math.max(10, Math.min(size.width - tw - 10, x));
          let ty = Math.max(70, y - th - 8);
          // keep tags from stacking on each other when their cards overlap
          for (let guard = 0; guard < 4; guard++) {
            const hit = placed.find((q) => tx < q.x + q.w + 8 && tx + tw + 8 > q.x && ty < q.y + q.h + 5 && ty + th + 5 > q.y);
            if (!hit) break;
            ty = hit.y + hit.h + 6;
          }
          placed.push({ x: tx, y: ty, w: tw, h: th });
          tag.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
          tag.style.opacity = clamp01((ph.audit - gi * 0.08) / 0.7).toFixed(3);
        }
      });
      refs.svg.style.opacity = ph.audit.toFixed(3);
      auditShown.current = true;
    } else if (auditShown.current && refs.svg) {
      refs.svg.style.opacity = '0';
      refs.tags.forEach((tag) => { if (tag) tag.style.opacity = '0'; });
      auditShown.current = false;
    }
  });

  if (!world) return null;
  return (
    <primitive
      object={world.root}
      onPointerMove={(e) => {
        if (!canHover.current) return;
        const i = e.object?.userData?.card;
        hover.current = typeof i === 'number' ? i : -1;
      }}
      onPointerOut={() => { hover.current = -1; }}
    />
  );
}

export default function FocusScene({ live, pRef, slotRef, auditRefs }) {
  return (
    <Canvas
      className="focus-gl"
      dpr={[1, 2]}
      flat
      linear
      frameloop={live ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: FOV, near: 0.1, far: 200, position: [0, 0, 22] }}
      style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Rig slotRef={slotRef} />
      <World pRef={pRef} slotRef={slotRef} auditRefs={auditRefs} />
    </Canvas>
  );
}
