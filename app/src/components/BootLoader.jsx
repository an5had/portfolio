/* First-load screen.
   A grain-textured, noise-displaced ultramarine blob (BootBlob); the red an5had mark in the centre, shaking left
   and right; and — on the home page — the desk props floating around it, each popping in as its
   image decodes. When the hero's frames, the props and the fonts are ready, the mesh and mark fade
   away and the props fly (FLIP) from their orbit straight onto their default spots on the desk,
   where the real, draggable props take over.

   Shown once per page load. Scroll is locked until it leaves. Readiness comes from Hero via
   window events ('hero-progress', 'hero-ready'); a hard timeout means it can never trap anyone. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PROPS } from './hero/HeroProps.jsx';
import BootBlob from './BootBlob.jsx';

const MIN_MS = 1600;
const MAX_MS = 14000;
const FLY_MS = 1150;

// where each prop floats around the mark: angle (0° = right, clockwise), size, tilt
const ORBIT = [
  { id: 'asterisk', a: -145, s: 0.6, r: -14, d: '0s' },
  { id: 'camera', a: -24, s: 1.0, r: 9, d: '-0.8s' },
  { id: 'blocks', a: 36, s: 0.64, r: 12, d: '-1.6s' },
  { id: 'builder', a: 164, s: 1.12, r: -9, d: '-2.4s' },
];

function Mark() {
  return (
    <svg className="boot-logo" viewBox="0 0 262 261" role="img" aria-label="an5had">
      <rect width="262" height="261" rx="60" fill="#FF0000" />
      <path d="M103.711 54H138.605L80.8947 207H46L103.711 54Z" fill="#fff" />
      <path d="M91.6318 147.947L91.6318 113.053L199 113.053L199 147.947L91.6318 147.947Z" fill="#fff" />
      <path d="M108.632 207L121.784 172.105L199 172.105L199 207L108.632 207Z" fill="#fff" />
      <path d="M199 207L163.211 207L163.211 113.053L199 113.053L199 207Z" fill="#fff" />
      <path d="M166.342 54L153.18 88.8945H139.053V54H166.342Z" fill="#fff" />
    </svg>
  );
}

export default function BootLoader() {
  const { pathname } = useLocation();
  const home = useRef(pathname === '/').current;
  const [phase, setPhase] = useState('loading');      // loading → leaving → gone
  const [pct, setPct] = useState(0);
  const [inView, setInView] = useState({});
  const propEls = useRef({});

  // orbit layout (px, around the viewport centre)
  const layout = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const R = Math.min(vw * (vw < 700 ? 0.34 : 0.25), vh * 0.3, 330);
    const base = Math.min(160, Math.max(78, vw * 0.105));
    for (const o of ORBIT) {
      const el = propEls.current[o.id];
      if (!el || el.classList.contains('is-flying')) continue;
      const rad = (o.a * Math.PI) / 180;
      el.style.left = `${vw / 2 + Math.cos(rad) * R}px`;
      el.style.top = `${vh / 2 + Math.sin(rad) * R * 0.86}px`;
      el.style.width = `${base * o.s}px`;
    }
  };
  useLayoutEffect(() => {
    if (!home) return undefined;
    layout();
    window.addEventListener('resize', layout);
    return () => window.removeEventListener('resize', layout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('is-booting');
    if (home) window.__propsLanded = false;

    // hold smooth scroll while booting (the instance can be replaced in dev, so keep checking)
    let lenis = null;
    const holdScroll = setInterval(() => {
      if (window.__lenis && window.__lenis !== lenis) { lenis = window.__lenis; lenis.stop(); }
    }, 60);

    const t0 = performance.now();
    const got = { props: 0, fonts: false, hero: !home || window.__heroReady === true, heroP: 0 };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = new URLSearchParams(window.location.search).get('boot') === 'hold';

    if (home) {
      PROPS.forEach((p) => {
        const im = new Image();
        im.src = p.src;
        (im.decode ? im.decode() : new Promise((r) => { im.onload = r; im.onerror = r; }))
          .catch(() => {})
          .then(() => { got.props += 1; setInView((s) => ({ ...s, [p.id]: true })); });
      });
    }
    (document.fonts?.ready || Promise.resolve()).then(() => { got.fonts = true; });
    const onProgress = (e) => { got.heroP = e.detail || 0; };
    const onReady = () => { got.hero = true; };
    window.addEventListener('hero-progress', onProgress);
    window.addEventListener('hero-ready', onReady);

    let raf = 0, shown = 0, left = false;
    const finish = () => {
      root.classList.remove('is-booting');
      clearInterval(holdScroll);
      window.__lenis?.start();
      window.__propsLanded = true;
      window.dispatchEvent(new Event('props-landed'));
      // let the real props paint under the clones before removing the overlay
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('gone')));
    };

    const leave = () => {
      left = true;
      setPhase('leaving');
      const targets = home ? [...document.querySelectorAll('.hero-prop')] : [];
      const flights = ORBIT.map((o, i) => {
        const el = propEls.current[o.id];
        if (!el) return null;
        const p = PROPS.find((x) => x.id === o.id);
        const target = targets.find((t) => t.dataset.propId === o.id);
        const from = el.getBoundingClientRect();
        el.classList.add('is-flying');
        el.style.setProperty('--to-r', `${p.rot}deg`);
        if (!target || !target.offsetWidth || reduce) {
          return el.animate(
            [{ opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%, -50%) scale(0.6)' }],
            { duration: 500, delay: i * 40, easing: 'ease-in', fill: 'forwards' },
          ).finished;
        }
        const to = target.getBoundingClientRect();              // centre survives the prop's rotation
        const stage = target.closest('.hero-stage');
        const k = stage ? stage.getBoundingClientRect().width / stage.offsetWidth : 1;
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        const s = (target.offsetWidth * k) / from.width;
        return el.animate(
          [
            { transform: 'translate(-50%, -50%) translate(0px, 0px) scale(1)' },
            { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${s})` },
          ],
          { duration: FLY_MS, delay: 140 + i * 70, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'forwards' },
        ).finished;
      }).filter(Boolean);
      Promise.all(flights).catch(() => {}).then(finish);
      if (!flights.length) setTimeout(finish, 700);
    };

    const tick = () => {
      if (left) return;
      raf = requestAnimationFrame(tick);
      const target = home
        ? (got.props / PROPS.length) * 20 + (got.fonts ? 10 : 0) + (got.hero ? 70 : got.heroP * 70)
        : (got.fonts ? 100 : 40);
      shown += (target - shown) * 0.12;
      setPct((v) => (Math.round(shown) !== v ? Math.round(shown) : v));
      const elapsed = performance.now() - t0;
      const ready = got.fonts && got.hero && (!home || got.props >= PROPS.length);
      if (hold) return;                                       // ?boot=hold: keep it up for design review
      if ((ready && elapsed > (home ? MIN_MS : 700)) || elapsed > MAX_MS) {
        cancelAnimationFrame(raf);
        setPct(100);
        setTimeout(leave, 120);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(holdScroll);
      window.removeEventListener('hero-progress', onProgress);
      window.removeEventListener('hero-ready', onReady);
      root.classList.remove('is-booting');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'gone') return null;

  return (
    <div className={`boot${phase === 'leaving' ? ' is-leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading">
      <BootBlob />
      <div className="boot-grain" aria-hidden="true" />
      <div className="boot-center">
        <Mark />
        <span className="boot-pct" aria-hidden="true">{String(pct).padStart(2, '0')}%</span>
      </div>
      {home && ORBIT.map((o) => {
        const p = PROPS.find((x) => x.id === o.id);
        return (
          <div
            key={o.id}
            ref={(n) => { propEls.current[o.id] = n; }}
            className={`boot-prop${inView[o.id] ? ' is-in' : ''}`}
            style={{ '--r': `${o.r}deg`, '--d': o.d }}
            aria-hidden="true"
          >
            <img src={p.src} alt="" draggable="false" />
          </div>
        );
      })}
    </div>
  );
}
