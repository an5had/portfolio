/* The hand-drawn annotation layer: rough SVG marks drawn ON TOP of real copy, as
   if someone marked up the page with a pen. Decoration → aria-hidden. The words
   carry meaning; the mark only emphasizes. See references/scroll-and-marks.md */
import { gsap } from 'gsap';

// A rough, hand-drawn ellipse path around a target, sized to it.
function ellipsePath(w: number, h: number): string {
  const cx = w / 2, cy = h / 2, rx = w / 2 + 6, ry = h / 2 + 4;
  const wob = () => (Math.random() - 0.5) * 6;              // hand wobble
  return `M ${cx - rx} ${cy + wob()}
          C ${cx - rx} ${cy - ry}, ${cx + rx} ${cy - ry}, ${cx + rx} ${cy + wob()}
          C ${cx + rx} ${cy + ry}, ${cx - rx} ${cy + ry}, ${cx - rx - 4} ${cy + wob()}`;
}

export function initMarks() {
  document.querySelectorAll<HTMLElement>('[data-mark]').forEach(target => {
    const r = target.getBoundingClientRect();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    Object.assign(svg.style, {
      position: 'absolute', left: '-8px', top: '-6px',
      width: `${r.width + 16}px`, height: `${r.height + 12}px`,
      overflow: 'visible', pointerEvents: 'none',
    });
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ellipsePath(r.width, r.height));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#f4c518');                 // chinagraph grease-pencil yellow
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    target.appendChild(svg);

    // Draw the mark ON as its line reveals (stroke-dashoffset full → 0).
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.intersectionRatio > 0.6)) {
        gsap.to(path, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' });
        io.disconnect();
      }
    }, { threshold: [0, 0.6, 1] });
    io.observe(target);
  });
}
