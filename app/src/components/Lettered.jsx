/* Lettered accent word, after zero.university's "Careers": the headline serif itself in the brand
   colour, opened by ONE copperplate swash capital (Pinyon Script).
   Optional margin note (Zero's "AI Native"): Caveat in grey with a hand-drawn looping arrow that
   draws itself in the first time the heading is on screen. Desktop only. The note text is a data
   attribute rendered by CSS (::after), so it is not part of the heading's real text for search
   engines or screen readers.

   Use the brand colour here and almost nowhere else — that's what makes it land. */
import { useEffect, useRef, useState } from 'react';

export default function Lettered({ children, note, side = 'right' }) {
  const word = String(children);
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!note || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDrawn(true); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [note]);

  return (
    <em ref={ref} className={`lettered${drawn ? ' is-drawn' : ''}`}>
      <span className="swash">{word.charAt(0)}</span>{word.slice(1)}
      {note && (
        <span className={`hand-note hand-note--${side}`} data-note={note} aria-hidden="true">
          <svg className="hand-arrow" viewBox="0 0 64 44" fill="none" focusable="false">
            <path pathLength="1" d="M60 9C52 4 40 5 36 12C33 18 38 23 43 19C48 15 43 7 34 9C24 11 15 21 8 33" />
            <path pathLength="1" d="M15.2 29.6L8 33L7.4 25" />
          </svg>
        </span>
      )}
    </em>
  );
}
