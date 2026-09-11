/* "Hand me the mess." — the section after the hero.
   Continues the hero's photographic, hands-on feel: a lens ring racks focus on a pile of
   out-of-focus dashboard fragments. Four stops tell the story in a few words each (mess → map →
   system → focus) and land on real outcomes across the range of work, not just dashboards.

   Pinned like the hero: scroll turns the ring, and grabbing the ring scrolls the page, so there's
   one source of truth and nobody gets stuck. All copy is real DOM text (SEO/GEO); the board is
   decoration. Reduced motion: no pin, it starts in focus and the ring still works. */
import { useEffect, useRef, useState } from 'react';
import FocusScene from './focus/FocusScene.jsx';
import FocusRing from './focus/FocusRing.jsx';
import { STOPS, HOLD, stopIndex, phases, clamp01 } from './focus/focusMath.js';
import { AUDIT } from './focus/focusCards.js';

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const detentEase = (t) => 1 - Math.pow(1 - t, 4);   // quick off the mark, soft landing

export default function FocusSection() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const slotRef = useRef(null);
  const ringRef = useRef(null);
  const slotRect = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const pTarget = useRef(0);
  const pSmooth = useRef(0);
  const dragging = useRef(false);
  const auditRefs = useRef({ svg: null, polys: {}, tags: [] });
  const reduced = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const [touched, setTouched] = useState(false);

  // where the finished board should sit, relative to the stage (the canvas fills the stage)
  useEffect(() => {
    const measure = () => {
      const s = stageRef.current.getBoundingClientRect();
      const r = slotRef.current.getBoundingClientRect();
      slotRect.current = { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stageRef.current);
    ro.observe(slotRef.current);
    return () => ro.disconnect();
  }, []);

  // only render the WebGL board while the section is near the viewport
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: '30% 0px' });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced.current) { pTarget.current = 1; pSmooth.current = 1; }
    let raf = 0, last = performance.now(), idx = -1, locked = false;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const section = sectionRef.current, stage = stageRef.current;
      if (!section || !stage) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < -300 || rect.top > window.innerHeight + 300) return;
      if (!reduced.current && !dragging.current) {
        const scrollable = section.offsetHeight - stage.clientHeight || 1;
        pTarget.current = clamp01(-rect.top / scrollable / HOLD);
      }
      pSmooth.current += (pTarget.current - pSmooth.current) * (1 - Math.exp(-dt * 7));
      if (Math.abs(pTarget.current - pSmooth.current) < 0.0004) pSmooth.current = pTarget.current;
      const p = pSmooth.current;

      ringRef.current?.draw(p);
      const i = stopIndex(p);
      if (i !== idx) { idx = i; setActive(i); }
      const L = phases(p).lock > 0.6;
      if (L !== locked) { locked = L; stage.classList.toggle('is-locked', L); }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Detents. Inside the pinned range the page moves stop to stop, like a lens clicking into place:
     one wheel/trackpad gesture = one stop (momentum tails are swallowed), one vertical swipe on
     touch = one stop, and anything else that leaves it between stops (keyboard, scrollbar) glides
     to the nearest. At MESS (going up) and FOCUS (going down) a fresh gesture scrolls straight out. */
  useEffect(() => {
    if (reduced.current) return;
    const last = STOPS.length - 1;
    const ctl = { flag: false, until: 0, target: 0, lastWheel: 0, dir: 0 };
    const tg = { on: false };
    let lenis = null, prevVS, offScroll = null, idle = 0;

    const animating = () => ctl.flag && performance.now() < ctl.until;
    const geo = () => {
      const s = sectionRef.current, st = stageRef.current;
      return { top: s.getBoundingClientRect().top + window.scrollY, span: HOLD * (s.offsetHeight - st.clientHeight) };
    };
    const stepTo = (i) => {
      const g = geo(), duration = 0.85;
      ctl.flag = true; ctl.target = i; ctl.until = performance.now() + duration * 1000 + 160;
      if (!lenis) { window.scrollTo({ top: g.top + STOPS[i].at * g.span, behavior: 'smooth' }); return; }
      lenis.scrollTo(g.top + STOPS[i].at * g.span, { duration, easing: detentEase, force: true, onComplete: () => { ctl.flag = false; } });
    };
    const block = (e) => { if (e.cancelable) e.preventDefault(); };

    const onWheel = (data) => {
      const e = data.event;
      if (!e.type.includes('wheel') || e.ctrlKey || dragging.current) return true;
      const dir = Math.sign(data.deltaY);
      if (!dir) return true;
      const g = geo();
      const q = (lenis.animatedScroll - g.top) / g.span;
      const qt = (lenis.targetScroll + data.deltaY - g.top) / g.span;
      const now = performance.now(), gap = now - ctl.lastWheel;
      ctl.lastWheel = now;
      const fresh = gap > 220 || dir !== ctl.dir || (!animating() && Math.abs(data.deltaY) >= 40);
      ctl.dir = dir;

      if (q < -0.002) {                                   // arriving from the hero: catch on MESS
        if (dir > 0 && qt > 0) { block(e); if (!animating() || ctl.target !== 0) stepTo(0); return false; }
        return true;
      }
      if (q > 1.002) {                                    // arriving from below: catch on FOCUS
        if (dir < 0 && qt < 1) { block(e); if (!animating() || ctl.target !== last) stepTo(last); return false; }
        return true;
      }
      const idx = animating() ? ctl.target : nearestStop(q);
      const exiting = (dir < 0 && idx === 0) || (dir > 0 && idx === last);
      if (exiting && !animating()) {
        if (fresh) return true;                           // a new gesture leaves the section
        block(e); return false;                           // the tail of the gesture that landed here doesn't
      }
      block(e);
      if (fresh) {
        const next = Math.max(0, Math.min(last, idx + dir));
        if (next !== idx || !animating()) stepTo(next);
      }
      return false;
    };

    const onTouchStart = (e) => {
      tg.on = false;
      if (dragging.current || e.touches.length !== 1) return;
      const g = geo(), q = (window.scrollY - g.top) / g.span;
      if (q < -0.01 || q > 1.01) return;
      Object.assign(tg, { on: true, q, x0: e.touches[0].clientX, y0: e.touches[0].clientY, t0: performance.now(), decided: false, block: false });
    };
    const onTouchMove = (e) => {
      if (!tg.on) return;
      const dx = e.touches[0].clientX - tg.x0, dy = tg.y0 - e.touches[0].clientY;
      if (!tg.decided && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        tg.decided = true;
        if (Math.abs(dy) > Math.abs(dx)) {
          tg.dir = Math.sign(dy);
          tg.idx = animating() ? ctl.target : nearestStop(clamp01(tg.q));
          const atStop = Math.abs(tg.q - STOPS[tg.idx].at) < 0.01;
          tg.block = !(atStop && ((tg.dir < 0 && tg.idx === 0) || (tg.dir > 0 && tg.idx === last)));
        }
      }
      if (tg.block) block(e);
    };
    const onTouchEnd = (e) => {
      if (!tg.on) return;
      tg.on = false;
      if (!tg.block) return;
      const t = e.changedTouches[0];
      const dy = t ? tg.y0 - t.clientY : 0;
      const swipe = Math.abs(dy) > 36 || Math.abs(dy) / Math.max(1, performance.now() - tg.t0) > 0.35;
      stepTo(swipe ? Math.max(0, Math.min(last, tg.idx + tg.dir)) : tg.idx);
    };

    const onScroll = () => {
      clearTimeout(idle);
      if (animating() || dragging.current || tg.on) return;
      idle = setTimeout(() => {
        if (animating() || dragging.current || tg.on) return;
        const g = geo(), q = (window.scrollY - g.top) / g.span;
        if (q <= 0.004 || q >= 0.996) return;
        const i = nearestStop(q);
        if (Math.abs(q - STOPS[i].at) > 0.004) stepTo(i);
      }, 180);
    };

    /* window.__lenis is created by a parent effect and can be REPLACED (StrictMode re-runs effects
       in dev; route changes can remount). So don't grab it once: watch for the current instance
       and move the hooks onto it whenever it changes. */
    const hook = (d) => (prevVS && prevVS(d) === false ? false : onWheel(d));
    const uninstall = () => {
      if (!lenis) return;
      if (lenis.options.virtualScroll === hook) lenis.options.virtualScroll = prevVS;
      offScroll?.();
      offScroll = null;
      lenis = null;
    };
    const ensure = () => {
      const L = window.__lenis;
      if (!L || L === lenis) return;
      uninstall();
      lenis = L;
      prevVS = L.options.virtualScroll;
      L.options.virtualScroll = hook;
      offScroll = L.on('scroll', onScroll);
    };
    ensure();
    const poll = setInterval(ensure, 400);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      clearInterval(poll); clearTimeout(idle);
      uninstall();
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToValue = (v, { immediate = false, duration = 0.8 } = {}) => {
    if (reduced.current) { pTarget.current = v; return; }
    const section = sectionRef.current, stage = stageRef.current;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const y = Math.round(top + v * HOLD * (section.offsetHeight - stage.clientHeight));
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration, easing: easeOut, force: true });
    else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
  };

  const nearestStop = (v) => STOPS.reduce((b, s, i) => (Math.abs(s.at - v) < Math.abs(STOPS[b].at - v) ? i : b), 0);

  const goToStop = (i) => {
    setTouched(true);
    dragging.current = false;
    if (reduced.current) pTarget.current = STOPS[i].at;
    scrollToValue(STOPS[i].at, { duration: 1.1 });
  };

  return (
    <section className="focus" id="intro" ref={sectionRef} aria-labelledby="focus-title">
      <div className="focus-stage" ref={stageRef}>
        <div className="focus-glow" aria-hidden="true" />
        <FocusScene live={live} pRef={pSmooth} slotRef={slotRect} auditRefs={auditRefs} />

        <svg className="focus-audit" ref={(el) => { auditRefs.current.svg = el; }} aria-hidden="true">
          {AUDIT.flatMap((g) => g.ids.map((id) => (
            <polygon key={`${g.n}|${id}`} ref={(el) => { auditRefs.current.polys[`${g.n}|${id}`] = el; }} />
          )))}
        </svg>
        {AUDIT.map((g, i) => (
          <div className="audit-tag" key={g.n} ref={(el) => { auditRefs.current.tags[i] = el; }} aria-hidden="true">
            <b>{g.n}</b>{g.label}
          </div>
        ))}

        <div className="focus-copy">
        <header className="focus-head">
          <p className="eyebrow">What I actually do</p>
          <h2 id="focus-title" className="focus-title">Hand me the <em className="serif-accent">mess.</em></h2>
        </header>

        <div className="focus-steps">
          <div className="focus-dots">
            {STOPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={i <= active ? 'is-on' : ''}
                aria-label={`Go to ${s.label.toLowerCase()}`}
                aria-current={i === active ? 'step' : undefined}
                onClick={() => goToStop(i)}
                data-cursor="link"
              ><i /></button>
            ))}
          </div>
          <ol className="focus-captions">
            {STOPS.map((s, i) => (
              <li key={s.id} className={i === active ? 'is-active' : ''} aria-hidden={i !== active}>
                <span className="fc-no">{String(i + 1).padStart(2, '0')} / 04 · {s.label.toLowerCase()}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
        </div>

        <div className="focus-view">
        <div className="focus-slot" ref={slotRef} aria-hidden="true">
          <div className="vf">
            <i /><i /><i /><i />
            <span className="vf-mode"><span className="vf-mf">MF</span><span className="vf-af">AF ● In focus</span></span>
            <span className="vf-note">Illustrative board · client work stays under NDA</span>
          </div>
        </div>

        <div className="focus-ring-wrap">
          <FocusRing
            ref={ringRef}
            stops={STOPS}
            onScrubStart={() => { dragging.current = true; setTouched(true); }}
            onScrub={(v) => { pTarget.current = v; scrollToValue(v, { immediate: true }); }}
            onRelease={(v, vel) => {
              dragging.current = false;
              const i = nearestStop(clamp01(v + vel * 0.22));
              if (reduced.current) pTarget.current = STOPS[i].at;
              scrollToValue(STOPS[i].at, { duration: 0.7 });
            }}
            onStop={goToStop}
          />
          <p className={`fring-hint${touched ? ' is-hidden' : ''}`} aria-hidden="true">
            <span>←</span> Drag the ring, or keep scrolling
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}
