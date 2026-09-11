/* Handwriting on the hero's sticky notes, tracked to the paper frame by frame.
   The 4K re-render ships blank notes; the writing is live DOM text in Caveat so it stays crisp at
   any resolution instead of being baked into (and compressed with) the frames. Each note's pose —
   centre, size, angle, visibility, speed — was measured off the footage per frame and lives in
   sticky-track.json. Ink blends with multiply so the paper's lighting shows through, fades out when
   the note is covered or leaves the frame, and blurs with the note's own motion.
   Driven imperatively (update(frame)) from Hero's rAF: no React renders per frame. */
import { forwardRef, useImperativeHandle, useRef } from 'react';
import TRACK from './sticky-track.json';
import { HERO, stageSize } from './heroMap.js';

// entry = [cx, cy, w, h, a, vis, spd] | 0 — see TRACK.fields
function place(el, rec, sw, sh) {
  if (!el) return;
  if (!rec || rec[5] <= 0.01) { el.style.opacity = '0'; return; }
  const scale = Math.max(sw / HERO.videoW, sh / HERO.videoH);
  const dw = HERO.videoW * scale, dh = HERO.videoH * scale;
  const x = (sw - dw) / 2 + rec[0] * dw;
  const y = (sh - dh) / 2 + rec[1] * dh;
  const w = rec[2] * dw, h = rec[3] * dw;
  const s = el.style;
  s.width = `${w}px`;
  s.height = `${h}px`;
  s.transform = `translate(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px) rotate(${rec[4]}deg)`;
  s.opacity = String(rec[5]);
  s.setProperty('--sn', `${w}px`);
  const blur = Math.min(4, rec[6] * dw * 0.22);   // px of travel per frame → matching motion blur
  s.filter = blur > 0.35 ? `blur(${blur.toFixed(2)}px)` : '';
}

const StickyNotes = forwardRef(function StickyNotes(_props, ref) {
  const heyRef = useRef(null);
  const nameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    update(frame) {
      const { sw, sh } = stageSize();
      place(heyRef.current, TRACK.y[frame], sw, sh);
      place(nameRef.current, TRACK.o[frame], sw, sh);
    },
  }), []);

  return (
    <div className="sticky-notes" aria-hidden="true">
      <div className="sticky-ink sticky-ink--hey" ref={heyRef}>
        <span className="sticky-hey">Hey!</span>
        <svg className="sticky-smiley" viewBox="0 0 60 44" fill="none">
          <circle cx="19" cy="10" r="3.6" fill="currentColor" />
          <circle cx="41" cy="9" r="3.6" fill="currentColor" />
          <path d="M11 23 Q29 42 49 21" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="sticky-ink sticky-ink--name" ref={nameRef}>
        <span>I’m</span>
        <span>Anshad</span>
      </div>
    </div>
  );
});

export default StickyNotes;
