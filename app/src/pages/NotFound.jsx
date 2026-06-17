import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const EASE = [0.7, 0, 0.2, 1];

const QUIPS = [
  'You are still on itsmyportfolio.com, so you already know whose autofocus to blame.',
  'I bring problems into focus for a living. This page, not so much.',
  'Bold move, clicking a page that does not exist. Respect.',
  'Nothing here. Which is a strange thing to find in a portfolio.',
];

export default function NotFound() {
  const numRef = useRef(null);
  const [quip] = useState(() => QUIPS[Math.floor(Math.random() * QUIPS.length)]);

  // the subject keeps moving, so autofocus keeps missing it
  useEffect(() => {
    const on = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 26;
      const y = (e.clientY / window.innerHeight - 0.5) * 26;
      if (numRef.current) numRef.current.style.setProperty('--px', `${x}px`);
      if (numRef.current) numRef.current.style.setProperty('--py', `${y}px`);
    };
    window.addEventListener('mousemove', on);
    return () => window.removeEventListener('mousemove', on);
  }, []);

  return (
    <section className="nf">
      {/* viewfinder frame */}
      <span className="nf-bracket tl" />
      <span className="nf-bracket tr" />
      <span className="nf-bracket bl" />
      <span className="nf-bracket br" />

      {/* camera HUD */}
      <div className="nf-hud nf-tl"><i className="nf-rec" />REC · AF-C</div>
      <div className="nf-hud nf-tr">SUBJECT NOT FOUND</div>
      <div className="nf-hud nf-bl">f/4.04 · 1/404 · ISO ∞</div>
      <div className="nf-hud nf-br">ERR 404</div>

      <div className="nf-mid">
        <motion.div
          className="nf-num-wrap"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div ref={numRef} className="nf-num">4<span className="nf-zero">0</span>4</div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
          Out of focus.
        </motion.h1>
        <motion.p className="nf-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>
          {quip}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="nf-actions">
          <Link to="/" className="nav-cta nf-cta" data-cursor="link">Bring me back ↑</Link>
          <Link to="/works" className="nf-link" data-cursor="link">or go straight to the work →</Link>
        </motion.div>
      </div>
    </section>
  );
}
