import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Reveal from './Reveal.jsx';
import { EXPLORATIONS } from '../data.js';

// fx = horizontal position as a fraction of canvas width; y in px
const STICKERS = [
  { t: 'UX Design', c: 'accent', fx: 0.03, y: 432, r: -6 },
  { t: 'Product Design', c: 'blue', fx: 0.36, y: 44, r: 4 },
  { t: 'Design Systems', c: 'dark', fx: 0.68, y: 118, r: -3 },
  { t: 'make it pop ✨', c: 'yellow', fx: 0.44, y: 470, r: 6 },
  { t: 'ship it 🚀', c: 'green', fx: 0.8, y: 392, r: -4 },
  { t: 'pixel perfect (ish)', c: 'purple', fx: 0.21, y: 250, r: 3 },
  { t: '8px grid gang', c: 'dark', fx: 0.64, y: 520, r: 5 },
  { t: 'ctrl + z my life', c: 'accent', fx: 0.86, y: 96, r: 7 },
];

function FigItem({ children, x, y, r = 0, className = '', constraints }) {
  return (
    <motion.div
      className={`fig-item ${className}`}
      drag
      dragConstraints={constraints}
      dragElastic={0.1}
      dragMomentum={false}
      whileHover={{ scale: 1.03 }}
      whileDrag={{ scale: 1.05, zIndex: 80 }}
      initial={{ x, y, rotate: r }}
      data-cursor="grab"
    >
      {children}
    </motion.div>
  );
}

export default function Explorations({ heading = true }) {
  const canvas = useRef(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    const el = canvas.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => { if (w === 0) setW(el.clientWidth); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  const chipX = (fx) => Math.max(8, Math.min(fx * w, w - 150));
  const artX = (fx) => Math.max(8, Math.min(fx * w, w - 300));

  return (
    <section className="figma" id="explore">
      {heading && (
        <div className="container figma-head">
          <Reveal as="p" className="eyebrow">Just for fun</Reveal>
          <Reveal as="h2" className="section-title" delay={0.05}>Built in Figma, for the love of it.</Reveal>
          <Reveal as="p" className="figma-note" delay={0.1}>
            Drag things around. It is basically my Figma canvas, minus the 200 unnamed layers.
          </Reveal>
        </div>
      )}

      <div className="container">
        <div className="figma-canvas" ref={canvas}>
          {w > 0 && (
            <>
              {EXPLORATIONS.map((e, i) => (
                <FigItem key={e.id} className="fig-art" constraints={canvas}
                  x={i === 0 ? artX(0.05) : artX(0.52)} y={i === 0 ? 64 : 244} r={i === 0 ? -3 : 3}>
                  <span className="fig-tab">{e.title}</span>
                  <img src={e.img} alt={e.title} draggable="false" />
                </FigItem>
              ))}

              {STICKERS.map((s, i) => (
                <FigItem key={i} className={`fig-chip ${s.c}`} constraints={canvas} x={chipX(s.fx)} y={s.y} r={s.r}>
                  {s.t}
                </FigItem>
              ))}

              <FigItem className="fig-comment" constraints={canvas} x={chipX(0.34)} y={186}>
                <span className="fig-comment-dot">1</span> needs more whitespace
              </FigItem>

              <FigItem className="fig-cursor" constraints={canvas} x={chipX(0.55)} y={452}>
                <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                  <path d="M4 3 L18 11 L11 12 L8 19 Z" fill="#ff5630" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
                </svg>
                <span className="fig-cursor-name">anshad</span>
              </FigItem>
            </>
          )}
          <span className="figma-hint">drag anything →</span>
        </div>
      </div>
    </section>
  );
}
