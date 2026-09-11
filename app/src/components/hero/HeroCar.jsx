/* A toy car that drives across the desk on an interval.
   - Only enters once the iPad has slid into centre (scroll progress ≥ CAR_MIN_P).
   - Runs a diagonal lane across the clear mat below the tablet, chosen to miss
     every prop's DEFAULT position, the tablet, the pencil and the corner mouse.
   - Any prop dragged into the lane gets flattened with a synthesised crunch, then
     respawns at its default spot.
   Sound is generated with Web Audio (no asset) and only after a user gesture. */
import { useEffect, useRef } from 'react';
import { HERO, coverPoint, clamp } from './heroMap.js';

/* Right end stops short of the Apple Pencil, whose tip reaches ~y 0.83 around
   x 0.72–0.75; running to 0.76 drove the car straight through it. The car fades
   in/out at the ends, so a short lane still reads as entering and leaving. */
const LANE = { x0: -0.05, y0: 0.740, x1: 0.655, y1: 0.835 };
const CAR_W = 0.04;        // fraction of video width — a toy
const CROSS_MS = 5200;
const GAP_MS = 5600;
const CAR_MIN_P = 0.56;    // the tablet is centred by here

export default function HeroCar({ progressRef }) {
  const elRef = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = elRef.current;
    if (!el) return;

    let raf = 0, timer = 0, dir = 1, start = 0, audio = null;

    const ensureAudio = () => {
      if (!audio) {
        try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      }
      if (audio && audio.state === 'suspended') audio.resume();
      return audio;
    };
    const onGesture = () => ensureAudio();
    window.addEventListener('pointerdown', onGesture, { passive: true });
    window.addEventListener('wheel', onGesture, { passive: true });

    function crunch() {
      const ctx = audio;
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime, dur = 0.20;
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.6);
      }
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(1600, t);
      bp.frequency.exponentialRampToValueAtTime(320, t + dur);
      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0.30, t);
      g1.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      src.connect(bp).connect(g1).connect(ctx.destination);
      src.start(t); src.stop(t + dur);

      const osc = ctx.createOscillator(); osc.type = 'triangle';
      osc.frequency.setValueAtTime(210, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.13);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.22, t);
      g2.gain.exponentialRampToValueAtTime(0.0008, t + 0.15);
      osc.connect(g2).connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.16);
    }

    // shrink both boxes so only a real overlap counts (both PNGs carry padding)
    const inset = (r, f) => ({
      left: r.left + r.width * f, right: r.right - r.width * f,
      top: r.top + r.height * f, bottom: r.bottom - r.height * f,
    });

    function hitTest() {
      const car = inset(el.getBoundingClientRect(), 0.20);
      document.querySelectorAll('.hero-prop:not(.is-crushed)').forEach((p) => {
        const b = inset(p.getBoundingClientRect(), 0.24);
        if (car.left < b.right && car.right > b.left && car.top < b.bottom && car.bottom > b.top) {
          p.classList.add('is-crushed');
          // HeroProps listens for this and respawns the prop at its default spot
          p.dispatchEvent(new CustomEvent('prop-crushed', { bubbles: true }));
          crunch();
        }
      });
    }

    const at = (u) => ({
      x: LANE.x0 + (LANE.x1 - LANE.x0) * u,
      y: LANE.y0 + (LANE.y1 - LANE.y0) * u,
    });

    function frame(now) {
      // bail out if the visitor scrolled back before the tablet is centred
      if ((progressRef?.current ?? 1) < CAR_MIN_P) {
        el.style.opacity = '0';
        timer = setTimeout(tryStart, 500);
        return;
      }
      const t = Math.min(1, (now - start) / CROSS_MS);
      const u = dir > 0 ? t : 1 - t;
      const sw = document.documentElement.clientWidth, sh = document.documentElement.clientHeight;
      const scale = Math.max(sw / HERO.videoW, sh / HERO.videoH);
      const dw = HERO.videoW * scale;

      const a = at(u);
      const pt = coverPoint(a.x, a.y, sw, sh);
      // heading: sample a step further along the direction of travel
      const b = at(clamp(u + (dir > 0 ? 0.02 : -0.02), 0, 1));
      const pt2 = coverPoint(b.x, b.y, sw, sh);
      // the car art points DOWN, so its nose sits at +90° — subtract that.
      const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI - 90;

      el.style.width = `${CAR_W * dw}px`;
      el.style.left = `${pt.x}px`;
      el.style.top = `${pt.y}px`;
      el.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
      el.style.opacity = String(Math.max(0, Math.min(1, t / 0.07, (1 - t) / 0.07)));

      hitTest();

      if (t < 1) raf = requestAnimationFrame(frame);
      else { el.style.opacity = '0'; timer = setTimeout(tryStart, GAP_MS); }
    }

    function startRun() {
      dir *= -1;                       // alternate direction each pass
      start = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function tryStart() {
      if ((progressRef?.current ?? 1) >= CAR_MIN_P) startRun();
      else timer = setTimeout(tryStart, 500);
    }
    timer = setTimeout(tryStart, 1200);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('wheel', onGesture);
    };
  }, [progressRef]);

  return (
    <div className="hero-car" ref={elRef} aria-hidden="true">
      <img src="/props/toy-car.webp" alt="" draggable="false" />
    </div>
  );
}
