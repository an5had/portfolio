/* The lens focus ring — the control for the focus section.
   Drawn on a 2D canvas as a real cylinder seen side-on: a knurled rubber grip and an engraved
   distance scale whose ticks and stop names wrap around the barrel (projected with sin/cos, so they
   compress and fade toward the edges). Grab and drag it like a lens: pull left to rack focus
   forward. Crossing a stop gives a tiny detent click (and a haptic tick where supported); release
   settles on the nearest stop. Also a proper slider for keyboard + screen readers. */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ringFeedback, listenForAudioUnlock } from './ringFeedback.js';

const THROW = 150;          // degrees of barrel rotation from the first stop to the last
const STEP = 3.2;           // knurl pitch, degrees
const DEG = Math.PI / 180;

const lit = (a) => 0.12 + 0.62 * Math.pow(Math.max(0, Math.cos(a + 0.42)), 1.2) + 0.5 * Math.pow(Math.max(0, Math.cos(a + 0.6)), 34);

const TICK = 5;             // engraved tick pitch, degrees — one ratchet click per tick passed

function spacedWidth(ctx, s, sp) { let w = 0; for (const ch of s) w += ctx.measureText(ch).width + sp; return w - sp; }

const FocusRing = forwardRef(function FocusRing({ stops, onScrubStart, onScrub, onRelease, onStop }, ref) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const st = useRef({ w: 0, h: 0, dpr: 1, cache: null, v: 0, drawn: -1, drag: null });

  const paint = () => {
    const s = st.current, cv = canvasRef.current;
    if (!cv || !s.w || !s.cache) return;
    const ctx = cv.getContext('2d');
    const { w, h, dpr } = s;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(s.cache, 0, 0, w, h);

    const cx = w / 2, R = w / 2, theta = s.v * THROW;
    const bandH = Math.round(h * 0.42), gripTop = bandH + 2, gripBot = h;

    // knurling
    for (let k = -32; k <= 80; k++) {
      const a = (k * STEP - theta) * DEG;
      if (Math.abs(a) > Math.PI / 2 - 0.03) continue;
      const x = cx + R * Math.sin(a), c = Math.cos(a), L = lit(a);
      const rw = Math.max(0.5, 3.1 * c);
      ctx.fillStyle = `rgba(255,255,255,${(0.04 + 0.2 * L) * c})`;
      ctx.fillRect(x - rw * 0.9, gripTop + 4, rw * 0.55, gripBot - gripTop - 8);
      ctx.fillStyle = `rgba(0,0,0,${0.6 * c})`;
      ctx.fillRect(x - rw * 0.2, gripTop + 4, rw * 0.9, gripBot - gripTop - 8);
    }

    // engraved scale
    for (let d = -20; d <= THROW + 35; d += 5) {
      const a = (d - theta) * DEG;
      if (Math.abs(a) > 1.5) continue;
      const x = cx + R * Math.sin(a), c = Math.cos(a);
      const major = d % 25 === 0;
      ctx.fillStyle = `rgba(226,229,236,${(major ? 0.55 : 0.3) * c * c})`;
      ctx.fillRect(x - 0.5 * c, 5, Math.max(0.6, c), major ? 7 : 4);
    }
    ctx.font = `600 ${h < 60 ? 9.5 : 10.5}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'alphabetic';
    const labelY = bandH - 5;
    const marks = [...stops.map((stop) => ({ s: stop.label, d: stop.at * THROW })), { s: '∞', d: THROW + 24 }];
    marks.forEach(({ s: label, d }) => {
      const a = (d - theta) * DEG;
      if (Math.abs(a) > 1.45) return;
      const x = cx + R * Math.sin(a), c = Math.cos(a);
      const near = 1 - Math.min(1, Math.abs(a) / (11 * DEG));
      const sp = 1.9;
      ctx.save();
      ctx.translate(x, labelY);
      ctx.scale(Math.max(0.05, c), 1);
      const tw = spacedWidth(ctx, label, sp);
      ctx.globalAlpha = 0.2 + 0.8 * c * c;
      ctx.fillStyle = near > 0.35 ? '#ff6a47' : '#c9ccd4';
      let lx = -tw / 2;
      for (const ch of label) { ctx.fillText(ch, lx, 0); lx += ctx.measureText(ch).width + sp; }
      ctx.restore();
    });
  };

  const buildCache = () => {
    const s = st.current;
    const cache = document.createElement('canvas');
    cache.width = Math.round(s.w * s.dpr);
    cache.height = Math.round(s.h * s.dpr);
    const ctx = cache.getContext('2d');
    ctx.scale(s.dpr, s.dpr);
    const { w, h } = s, cx = w / 2, R = w / 2;
    const bandH = Math.round(h * 0.42);
    for (let x = 0; x < w; x++) {
      const a = Math.asin(Math.max(-1, Math.min(1, (x + 0.5 - cx) / R)));
      const L = lit(a), c = Math.cos(a);
      const e = Math.round(10 + 34 * L), g = Math.round(7 + 20 * L), m = Math.round(40 + 190 * L * c);
      ctx.fillStyle = `rgb(${e},${e + 1},${e + 4})`; ctx.fillRect(x, 0, 1, bandH);
      ctx.fillStyle = `rgb(${m},${m},${m + 5})`; ctx.fillRect(x, bandH, 1, 2);
      ctx.fillStyle = `rgb(${g},${g},${g + 2})`; ctx.fillRect(x, bandH + 2, 1, h - bandH - 2);
      ctx.fillStyle = `rgba(255,255,255,${0.18 * L * c})`; ctx.fillRect(x, 0, 1, 1);
    }
    const vg = ctx.createLinearGradient(0, bandH + 2, 0, h);
    vg.addColorStop(0, 'rgba(255,255,255,0.05)'); vg.addColorStop(0.5, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vg; ctx.fillRect(0, bandH + 2, w, h - bandH - 2);
    const eg = ctx.createLinearGradient(0, 0, w, 0);
    eg.addColorStop(0, 'rgba(0,0,0,0.85)'); eg.addColorStop(0.1, 'rgba(0,0,0,0)'); eg.addColorStop(0.9, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = eg; ctx.fillRect(0, 0, w, h);
    s.cache = cache;
  };

  useEffect(() => {
    const wrap = wrapRef.current, cv = canvasRef.current;
    const fit = () => {
      const s = st.current;
      s.w = wrap.clientWidth; s.h = wrap.clientHeight;
      s.dpr = Math.min(3, window.devicePixelRatio || 1);
      cv.width = Math.round(s.w * s.dpr); cv.height = Math.round(s.h * s.dpr);
      buildCache();
      paint();
    };
    fit();
    listenForAudioUnlock();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    document.fonts?.ready?.then(() => paint());
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    draw(v) {
      const s = st.current;
      if (Math.abs(v - s.drawn) < 0.00015) return;
      /* feedback from the barrel's actual motion, so drag, scroll, snapping and keyboard all tick
         alike: a detent when a stop is reached or passed, otherwise a click per tick mark crossed */
      if (s.drawn >= 0) {
        const prev = s.drawn;
        const hitStop = stops.some((stop) => (prev < stop.at && v >= stop.at) || (prev > stop.at && v <= stop.at));
        const tick = Math.floor((v * THROW) / TICK + 1e-6);
        if (hitStop) ringFeedback('stop');
        else if (tick !== s.tick) ringFeedback(tick % 5 === 0 ? 'major' : 'minor');
        s.tick = tick;
      } else {
        s.tick = Math.floor((v * THROW) / TICK + 1e-6);
      }
      s.v = v; s.drawn = v;
      paint();
      wrapRef.current?.setAttribute('aria-valuenow', String(Math.round(v * 100)));
      const idx = stops.reduce((b, stop, i) => (Math.abs(stop.at - v) < Math.abs(stops[b].at - v) ? i : b), 0);
      wrapRef.current?.setAttribute('aria-valuetext', stops[idx].label.toLowerCase());
    },
  }));

  const pxPerUnit = () => (st.current.w / 2) * THROW * DEG;

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const s = st.current;
    wrapRef.current.setPointerCapture?.(e.pointerId);
    s.drag = { x0: e.clientX, v0: s.v, v: s.v, lastX: e.clientX, lastT: performance.now(), vel: 0, moved: 0 };
    onScrubStart?.();
  };
  const onPointerMove = (e) => {
    const s = st.current, d = s.drag;
    if (!d) return;
    const now = performance.now();
    const v = Math.max(0, Math.min(1, d.v0 - (e.clientX - d.x0) / pxPerUnit()));
    const dtt = Math.max(1, now - d.lastT);
    d.vel = d.vel * 0.6 + (-(e.clientX - d.lastX) / pxPerUnit() / (dtt / 1000)) * 0.4;
    d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x0));
    d.v = v; d.lastX = e.clientX; d.lastT = now;
    onScrub?.(v);
  };
  const onPointerUp = (e) => {
    const s = st.current, d = s.drag;
    if (!d) return;
    s.drag = null;
    if (d.moved < 4) {
      // a tap: jump to the stop label under the finger, if any
      const rect = wrapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left, cx = s.w / 2, R = s.w / 2;
      let best = -1, bestD = 46;
      stops.forEach((stop, i) => {
        const a = (stop.at * THROW - s.v * THROW) * DEG;
        if (Math.abs(a) > 1.4) return;
        const dx = Math.abs(cx + R * Math.sin(a) - x);
        if (dx < bestD) { bestD = dx; best = i; }
      });
      if (best >= 0) { onStop?.(best); return; }
    }
    onRelease?.(d.v, Math.abs(d.vel) > 0.05 ? d.vel : 0);
  };

  const onKeyDown = (e) => {
    const cur = stops.reduce((b, stop, i) => (Math.abs(stop.at - st.current.v) < Math.abs(stops[b].at - st.current.v) ? i : b), 0);
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageDown') next = Math.min(stops.length - 1, cur + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageUp') next = Math.max(0, cur - 1);
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = stops.length - 1;
    if (next !== null) { e.preventDefault(); onStop?.(next); }
  };

  return (
    <div
      ref={wrapRef}
      className="fring"
      role="slider"
      tabIndex={0}
      aria-label="Focus ring: turn to bring the dashboard into focus"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-valuetext="mess"
      data-cursor="link"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <span className="fring-index" aria-hidden="true" />
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
});

export default FocusRing;
