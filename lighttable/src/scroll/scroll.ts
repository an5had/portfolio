/* Lenis smooth scroll + snap between chapters + opacity reveal.
   Content never moves; reveal only changes opacity (with a legibility floor).
   See references/scroll-and-marks.md */
import Lenis from 'lenis';

export function initScroll({ reduced }: { reduced: boolean }) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: !reduced, wheelMultiplier: 1 });

  let started = false;
  function raf(t: number) { if (started) lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // Anchor links ease via Lenis instead of a native jump.
  document.querySelectorAll<HTMLAnchorElement>('.pill a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const el = document.querySelector(id) as HTMLElement | null;
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: 0 }); }
    });
  });

  // Opacity reveal: focus line bright, others ghosted — never below the floor.
  const FLOOR = 0.25;
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      (en.target as HTMLElement).style.opacity =
        String(FLOOR + (1 - FLOOR) * en.intersectionRatio);
    }
  }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
  document.querySelectorAll('.chapter p, .chapter h2, .project').forEach(el => {
    (el as HTMLElement).style.opacity = String(FLOOR);
    io.observe(el);
  });

  // Active-section state on the nav pill.
  const navFor = new Map<string, HTMLAnchorElement>();
  document.querySelectorAll<HTMLAnchorElement>('.pill a[href^="#"]').forEach(a =>
    navFor.set(a.getAttribute('href')!.slice(1), a));
  const spy = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) {
      navFor.forEach(a => a.removeAttribute('aria-current'));
      navFor.get(en.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { threshold: 0.5 });
  document.querySelectorAll('.chapter').forEach(el => spy.observe(el));

  return {
    lenis,
    start() { started = true; },
    onScroll(cb: (p: number) => void) { lenis.on('scroll', ({ progress }: any) => cb(progress)); },
  };
}
