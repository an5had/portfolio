import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf;
    const mm = (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    const over = (e) => {
      const el = e.target.closest && e.target.closest('[data-cursor]');
      const r = ring.current; if (!r) return;
      if (el) { r.classList.add('hover'); const v = el.dataset.cursor === 'view'; r.classList.toggle('view', v); r.textContent = v ? 'View' : ''; }
      else { r.classList.remove('hover', 'view'); r.textContent = ''; }
    };
    addEventListener('mousemove', mm); addEventListener('mouseover', over); loop();
    return () => { cancelAnimationFrame(raf); removeEventListener('mousemove', mm); removeEventListener('mouseover', over); };
  }, []);
  return (<>
    <div className="cursor" ref={dot} aria-hidden="true" />
    <div className="cursor-ring" ref={ring} aria-hidden="true" />
  </>);
}
