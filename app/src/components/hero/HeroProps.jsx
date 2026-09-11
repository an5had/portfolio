/* Draggable props sitting on the desk.
   Anchored in normalized video-frame coords and converted through the same
   cover-fit maths as the ring, so they stay on the mat at any viewport aspect.
   Once the visitor drags one, it keeps its own position (we stop re-anchoring it). */
import { useCallback, useEffect, useRef } from 'react';
import { HERO, coverPoint } from './heroMap.js';

const PROPS = [
  {
    id: 'builder',
    src: '/props/ai-native-builder.webp',
    alt: 'LEGO “AI Native Builder” set',
    // Clear blue mat, left of centre: right of the tray, above the tablet that
    // sits bottom-left, and outside the tablet that slides into centre later.
    vx: 0.21, vy: 0.42, wFrac: 0.142, rot: -6,
  },
  {
    id: 'camera',
    src: '/props/lego-fujifilm-xt20.webp',
    alt: 'LEGO Fujifilm X-T20 camera',
    // Clear blue mat, right of centre: left of the pen pot, above the books.
    vx: 0.79, vy: 0.42, wFrac: 0.12, rot: 5,
  },
  {
    id: 'asterisk',
    src: '/props/lego-asterisk.webp',
    alt: 'LEGO starburst',
    // Upper-left mat: right of the lamp, left of the monitor base.
    vx: 0.20, vy: 0.19, wFrac: 0.075, rot: -12,
  },
  {
    id: 'blocks',
    src: '/props/lego-blocks.webp',
    alt: 'Figma logo in LEGO bricks',
    // Tucked into the pocket beside the mouse: clear of the Apple Pencil on its
    // left, the books on its right, and the mouse below.
    vx: 0.825, vy: 0.765, wFrac: 0.078, rot: 8,
  },
];

export default function HeroProps() {
  const els = useRef({});
  const moved = useRef({});

  const place = useCallback((p) => {
    const el = els.current[p.id];
    if (!el) return;
    const sw = document.documentElement.clientWidth, sh = document.documentElement.clientHeight;
    const scale = Math.max(sw / HERO.videoW, sh / HERO.videoH);
    const dw = HERO.videoW * scale;
    const pt = coverPoint(p.vx, p.vy, sw, sh);
    el.style.width = `${Math.round(p.wFrac * dw)}px`;
    el.style.left = `${Math.round(pt.x)}px`;
    el.style.top = `${Math.round(pt.y)}px`;
  }, []);

  const layout = useCallback(() => {
    for (const p of PROPS) {
      if (moved.current[p.id]) continue;             // never yank a moved prop back
      place(p);
    }
  }, [place]);

  useEffect(() => {
    layout();
    // A plain resize listener isn't enough: if the stage settles to its final size
    // without firing one (first paint, pane resize), props stay anchored to a stale
    // viewport. Observing the element catches every size change.
    const ro = new ResizeObserver(layout);
    ro.observe(document.documentElement);
    window.addEventListener('resize', layout);
    const id = requestAnimationFrame(layout);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', layout);
      cancelAnimationFrame(id);
    };
  }, [layout]);

  /* Run over by the car → let it squash out, then respawn it at its default spot
     (clearing "moved" so it re-anchors) and fade it back in. */
  useEffect(() => {
    const onCrushed = (e) => {
      const el = e.target.closest?.('.hero-prop');
      if (!el) return;
      const p = PROPS.find((x) => x.id === el.dataset.propId);
      if (!p) return;
      setTimeout(() => {
        moved.current[p.id] = false;
        place(p);                       // back to default while still invisible
        requestAnimationFrame(() => el.classList.remove('is-crushed'));
      }, 900);
    };
    document.addEventListener('prop-crushed', onCrushed);
    return () => document.removeEventListener('prop-crushed', onCrushed);
  }, [place]);

  const onPointerDown = (e, p) => {
    const el = els.current[p.id];
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    el.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
    moved.current[p.id] = true;

    const startX = e.clientX, startY = e.clientY;
    const baseX = parseFloat(el.style.left) || 0;
    const baseY = parseFloat(el.style.top) || 0;
    // The hero stage is scaled (1.04 while pinned, smaller on exit). Prop
    // positions are in the stage's local px but pointer deltas are screen px,
    // so divide by the stage's scale to keep the prop under the cursor.
    const stage = el.closest('.hero-stage');
    const k = (stage && stage.getBoundingClientRect().width / stage.offsetWidth) || 1;

    const onMove = (ev) => {
      el.style.left = `${baseX + (ev.clientX - startX) / k}px`;
      el.style.top = `${baseY + (ev.clientY - startY) / k}px`;
    };
    const onUp = (ev) => {
      try { el.releasePointerCapture(ev.pointerId); } catch {}
      el.classList.remove('is-dragging');
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
  };

  return (
    <>
      {PROPS.map((p) => (
        <div
          key={p.id}
          className="hero-prop"
          data-prop-id={p.id}
          ref={(n) => { els.current[p.id] = n; }}
          style={{ '--rot': `${p.rot}deg` }}
          onPointerDown={(e) => onPointerDown(e, p)}
          role="img"
          aria-label={p.alt}
        >
          <img src={p.src} alt="" draggable="false" />
        </div>
      ))}
    </>
  );
}
