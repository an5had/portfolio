/* Where a Lettered margin note goes, and what its arrow looks like.

   Each note rolls its own personality once per page load — which sides it prefers, the arrow's shape
   (loop, arc, swoop or hook), how far it reaches, which way it bends, the tilt of the words — so no two
   notes on the site look stamped from one template. It then tries spots around the word in that order
   (right, above, below, left and the diagonals) and takes the first where neither the words nor the
   arrow touch anything: the heading's other words, nearby copy, buttons, images, or any region marked
   data-note-avoid. Elements inside data-note-ignore don't count. If nothing fits, the note stays
   hidden rather than overlap. */

const SALT = (Math.random() * 2 ** 32) >>> 0;

function seeded(str) {
  let h = (2166136261 ^ SALT) >>> 0;
  for (let i = 0; i < str.length; i += 1) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  return () => {                                          // mulberry32
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// v: which way the note sits from the word · at: the point on the word the arrow aims for · w: how
// often this side comes up first (reading flow favours the right)
const DIRS = [
  { id: 'right', w: 3, v: [1, -0.25], at: (b) => [b.r, b.t + (b.b - b.t) * 0.42] },
  { id: 'up-right', w: 3, v: [0.75, -0.66], at: (b) => [b.r - (b.r - b.l) * 0.12, b.t + (b.b - b.t) * 0.1] },
  { id: 'down-right', w: 2.2, v: [0.72, 0.7], at: (b) => [b.r - (b.r - b.l) * 0.1, b.b - (b.b - b.t) * 0.04] },
  { id: 'up', w: 2, v: [0.22, -1], at: (b) => [b.l + (b.r - b.l) * 0.62, b.t + (b.b - b.t) * 0.06] },
  { id: 'down', w: 2, v: [0.22, 1], at: (b) => [b.l + (b.r - b.l) * 0.58, b.b] },
  { id: 'up-left', w: 1.2, v: [-0.75, -0.66], at: (b) => [b.l + (b.r - b.l) * 0.14, b.t + (b.b - b.t) * 0.1] },
  { id: 'left', w: 1, v: [-1, -0.25], at: (b) => [b.l, b.t + (b.b - b.t) * 0.42] },
  { id: 'down-left', w: 1, v: [-0.72, 0.7], at: (b) => [b.l + (b.r - b.l) * 0.1, b.b] },
];

// Arrow shapes in a local frame: x runs from the note (0) to the word (1), y is sideways; both in units
// of the arrow's length. A start point, then cubic bezier segments of three points each.
const SHAPES = {
  arc: [[0, 0], [0.3, -0.3], [0.72, -0.3], [1, 0]],
  swoop: [[0, 0], [0.34, -0.34], [0.58, 0.26], [1, 0]],
  hook: [[0, 0], [0.5, 0.06], [0.96, -0.36], [1, 0]],
  loop: [[0, 0], [0.26, -0.12], [0.62, -0.18], [0.62, 0.02], [0.62, 0.2], [0.42, 0.19], [0.45, 0.03], [0.48, -0.13], [0.78, -0.1], [1, 0]],
};

export function rollNote(note) {
  const r = seeded(note);
  const pick = (a, b) => a + (b - a) * r();
  const order = DIRS.map((d) => ({ d, key: r() ** (1 / d.w) })).sort((a, b) => b.key - a.key).map((x) => x.d);
  const shape = ['loop', 'arc', 'swoop', 'hook'][Math.floor(r() * 4)];
  return {
    order,
    shape,
    bend: r() < 0.5 ? -1 : 1,
    bendAmt: pick(0.8, 1.15),
    reach: pick(0.6, 1.0) * (shape === 'loop' ? 1.3 : 1),   // arrow length, in em of the heading
    slide: pick(-0.35, 0.35),                                // how far the words slide along their edge
    spin: pick(-16, 16),                                     // the arrow leaves at a slight angle
    tilt: pick(-8, 4),
    head: pick(24, 34),                                      // arrowhead half-angle
  };
}

const unit = ([x, y]) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const rot = ([x, y], deg) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
};
const grow = (b, d) => ({ l: b.l - d, t: b.t - d, r: b.r + d, b: b.b + d });
const hits = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
const inside = ([x, y], b) => x > b.l && x < b.r && y > b.t && y < b.b;
const toBox = (r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom });
const bez = (p0, p1, p2, p3, t) => {
  const m = 1 - t, a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};

function collectObstacles(root, em, zone) {
  const out = [];
  const vpArea = window.innerWidth * window.innerHeight;
  const add = (r) => {
    if (r.width < 1 || r.height < 1) return;
    const b = toBox(r);
    if (hits(b, zone)) out.push(b);
  };
  const skip = (el) => em.contains(el) || el.closest('[data-note-ignore]');

  root.querySelectorAll('[data-note-avoid], img, picture, video, canvas, iframe, input, textarea, select, button').forEach((el) => {
    if (skip(el)) return;
    const r = el.getBoundingClientRect();
    if (!el.hasAttribute('data-note-avoid') && r.width * r.height > vpArea * 0.4) return;   // full-bleed backdrops
    add(r);
  });

  // real line boxes of the text around it, not the (much wider) block boxes
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.trim() && n.parentElement && !skip(n.parentElement)
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const range = document.createRange();
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) add(r);
  }
  return out;
}

export function placeNote(em, textEl, roll) {
  const fs = parseFloat(getComputedStyle(em).fontSize) || 16;
  const tw = textEl.offsetWidth, th = textEl.offsetHeight;
  if (!tw || fs * 0.36 < 13) return null;                 // too small to read as handwriting

  const W = toBox(em.getBoundingClientRect());
  const root = em.closest('section') || em.closest('header') || document.body;
  const R = root.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const edge = { l: 12, r: vw - 12, t: R.top, b: R.bottom };
  const zone = { l: W.l - fs * 7, r: W.r + fs * 7, t: W.t - fs * 3.5, b: W.b + fs * 3.5 };
  const found = collectObstacles(root, em, zone);
  // the words keep a little air around them: more beside other text than above or below it (line boxes
  // already carry the leading)
  const roomy = found.map((o) => ({ l: o.l - fs * 0.18, r: o.r + fs * 0.18, t: o.t - fs * 0.08, b: o.b + fs * 0.08 }));
  const obstacles = found.map((o) => grow(o, Math.max(3, fs * 0.05)));
  const halo = grow(W, fs * 0.03);

  const tr = (roll.tilt * Math.PI) / 180;
  const bw = tw * Math.abs(Math.cos(tr)) + th * Math.abs(Math.sin(tr));
  const bh = tw * Math.abs(Math.sin(tr)) + th * Math.abs(Math.cos(tr));
  const pad = fs * 0.07;
  const shapes = roll.shape === 'arc' ? ['arc', 'swoop'] : [roll.shape, 'arc'];
  const f = (x) => Math.round(x * 10) / 10;
  const pt = ([x, y]) => `${f(x - W.l)} ${f(y - W.t)}`;

  // on each side: the rolled spot first, then a few nudges (centred, slid either way, reaching further)
  // before moving on to the next side
  const tries = roll.order.flatMap((dir) => [
    { dir, slideK: roll.slide, reach: roll.reach, spin: roll.spin },
    { dir, slideK: 0, reach: roll.reach, spin: 0 },
    { dir, slideK: 0.85, reach: roll.reach * 1.2, spin: -roll.spin },
    { dir, slideK: -0.85, reach: roll.reach * 1.2, spin: -roll.spin },
  ]);

  for (const { dir, slideK, reach, spin } of tries) {
    const v = unit(dir.v);
    const [ax, ay] = dir.at(W);
    const E = [ax + v[0] * fs * 0.12, ay + v[1] * fs * 0.12];
    const va = rot(v, spin);
    const S0 = [E[0] + va[0] * fs * reach, E[1] + va[1] * fs * reach];
    const perp = [-va[1], va[0]];
    const support = (Math.abs(va[0]) * bw) / 2 + (Math.abs(va[1]) * bh) / 2 + pad;
    const slide = slideK * (Math.abs(perp[0]) * bw + Math.abs(perp[1]) * bh) * 0.5;
    const cx = S0[0] + va[0] * support + perp[0] * slide;
    const cy = S0[1] + va[1] * support + perp[1] * slide;
    const T = { l: cx - bw / 2, r: cx + bw / 2, t: cy - bh / 2, b: cy + bh / 2 };
    const Tp = grow(T, fs * 0.05);
    if (Tp.l < edge.l || Tp.r > edge.r || Tp.t < edge.t || Tp.b > edge.b) continue;
    if (hits(Tp, halo) || roomy.some((o) => hits(T, o))) continue;

    // the arrow starts just off the words' nearest edge, so the two never touch
    const Q = [Math.min(Math.max(E[0], T.l), T.r), Math.min(Math.max(E[1], T.t), T.b)];
    if (Math.hypot(E[0] - Q[0], E[1] - Q[1]) < fs * 0.32 + pad) continue;
    const ue = unit([E[0] - Q[0], E[1] - Q[1]]);
    const S = [Q[0] + ue[0] * pad, Q[1] + ue[1] * pad];
    const len = Math.hypot(E[0] - S[0], E[1] - S[1]);
    const u = unit([E[0] - S[0], E[1] - S[1]]);
    const n = [-u[1], u[0]];

    for (const name of shapes) {
      const shape = name === 'loop' && len < 48 ? 'arc' : name;   // a loop needs room to read as one
      for (const sign of [roll.bend, -roll.bend]) {
        const k = sign * roll.bendAmt;
        const pts = SHAPES[shape].map(([x, y]) => [
          S[0] + u[0] * x * len + n[0] * y * len * k,
          S[1] + u[1] * x * len + n[1] * y * len * k,
        ]);
        const segs = (pts.length - 1) / 3;
        let clear = true;
        for (let s = 0; s < segs && clear; s += 1) {
          for (let i = 0; i <= 12; i += 1) {
            const t = i / 12, g = (s + t) / segs;
            const p = bez(pts[3 * s], pts[3 * s + 1], pts[3 * s + 2], pts[3 * s + 3], t);
            if (p[0] < edge.l || p[0] > edge.r
              || (g < 0.8 && inside(p, halo))
              || (g > 0.1 && inside(p, T))
              || obstacles.some((o) => inside(p, o))) { clear = false; break; }
          }
        }
        if (!clear) continue;

        const back = unit([pts[pts.length - 2][0] - E[0], pts[pts.length - 2][1] - E[1]]);
        const h = fs * 0.16;
        const h1 = rot(back, roll.head), h2 = rot(back, -roll.head);
        let body = `M${pt(pts[0])}`;
        for (let i = 1; i < pts.length; i += 3) body += `C${pt(pts[i])} ${pt(pts[i + 1])} ${pt(pts[i + 2])}`;
        return {
          id: dir.id,
          body,
          head: `M${pt([E[0] + h1[0] * h, E[1] + h1[1] * h])}L${pt(E)}L${pt([E[0] + h2[0] * h, E[1] + h2[1] * h])}`,
          x: f(cx - W.l - tw / 2),
          y: f(cy - W.t - th / 2),
          tilt: f(roll.tilt),
          stroke: f(Math.max(1.4, fs * 0.03)),
        };
      }
    }
  }
  return null;
}
