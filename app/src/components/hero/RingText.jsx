/* Circular text ring — "SENIOR UX & PRODUCT DESIGNER" looping around the
   "I'm Anshad" sticky note. SVG textPath on a circle, rotating slowly. Reveal
   (opacity + scale) is driven imperatively by the hero's scroll rAF via the
   forwarded ref, so it costs no React re-renders. */
import { forwardRef } from 'react';

const PHRASE = 'SENIOR UX & PRODUCT DESIGNER • ';
const R = 118;
// circle path centred in a 300×300 viewBox
const PATH = `M150,150 m-${R},0 a${R},${R} 0 1,1 ${R * 2},0 a${R},${R} 0 1,1 -${R * 2},0`;
// Stretch two repeats to the exact circumference so the loop tiles with no seam.
const CIRCUMFERENCE = 2 * Math.PI * R;

const RingText = forwardRef(function RingText(_props, ref) {
  return (
    <div className="hero-ring" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 300 300" className="hero-ring-svg">
        <defs><path id="heroRingPath" d={PATH} fill="none" /></defs>
        <text className="hero-ring-text">
          <textPath
            href="#heroRingPath"
            startOffset="0"
            textLength={CIRCUMFERENCE}
            lengthAdjust="spacing"
          >
            {PHRASE.repeat(2).trimEnd()}
          </textPath>
        </text>
      </svg>
    </div>
  );
});

export default RingText;
