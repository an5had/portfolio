/* Lettered accent word, after zero.university's "Careers": the headline serif itself in the brand
   colour, opened by ONE copperplate swash capital (Pinyon Script).
   Optional margin note (Zero's "AI Native"): Caveat in grey with a hand-drawn arrow that draws itself
   in the first time the heading is on screen. The note finds its own spot around the word — above,
   below, beside — wherever neither the words nor the arrow overlap anything, and every note rolls its
   own arrow shape and tilt (utils/handNote.js). The note text is a data attribute rendered by CSS
   (::after), so it is not part of the heading's real text for search engines or screen readers.

   Use the brand colour here and almost nowhere else — that's what makes it land. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { placeNote, rollNote } from '../utils/handNote.js';

export default function Lettered({ children, note }) {
  const word = String(children);
  const ref = useRef(null);
  const textRef = useRef(null);
  const roll = useMemo(() => (note ? rollNote(note) : null), [note]);
  const [spot, setSpot] = useState(null);                 // null until measured, or when nothing fits
  const [seen, setSeen] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useLayoutEffect(() => {
    if (!note) return undefined;
    const em = ref.current;
    let raf = 0;
    let last = '';
    const place = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!em.isConnected || !textRef.current) return;
        const next = placeNote(em, textRef.current, roll);
        const key = JSON.stringify(next);
        if (key !== last) { last = key; setSpot(next); }
      });
    };

    place();
    document.fonts?.ready.then(place);
    const settle = setTimeout(place, 1200);                // entrance animations have stopped moving things
    let late = 0;
    window.addEventListener('resize', place);
    const ro = new ResizeObserver(place);
    ro.observe(em.closest('section') || em.closest('header') || document.body);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      place();
      late = setTimeout(place, 900);
      setSeen(true);
    }, { threshold: 0.6 });
    io.observe(em);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      clearTimeout(late);
      window.removeEventListener('resize', place);
      ro.disconnect();
      io.disconnect();
    };
  }, [note, roll]);

  // start drawing a frame after the arrow exists, so the stroke animates in rather than just appearing
  useEffect(() => {
    if (!seen || !spot || drawn) return undefined;
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setDrawn(true)); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, [seen, spot, drawn]);

  return (
    <em ref={ref} className={`lettered${drawn ? ' is-drawn' : ''}`}>
      <span className="swash">{word.charAt(0)}</span>{word.slice(1)}
      {note && (
        <span className="hand-note" data-at={spot ? spot.id : undefined} aria-hidden="true">
          {spot && (
            <svg className="hand-arrow" fill="none" focusable="false" strokeWidth={spot.stroke}>
              <path pathLength="1" d={spot.body} />
              <path pathLength="1" d={spot.head} />
            </svg>
          )}
          <span
            ref={textRef}
            className="hand-text"
            data-note={note}
            style={spot ? { left: spot.x, top: spot.y, '--tilt': `${spot.tilt}deg` } : undefined}
          />
        </span>
      )}
    </em>
  );
}
