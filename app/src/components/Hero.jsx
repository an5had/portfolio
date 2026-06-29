import { motion } from 'framer-motion';
import Scene from '../three/Scene.jsx';

const EASE = [0.7, 0, 0.2, 1];
const L1 = ['I', 'bring', 'messy'];
const L2 = [['problems', false], ['into', true], ['focus.', true]];

function Word({ i, children, accent }) {
  return (
    <motion.span
      className={accent ? 'accent' : ''}
      style={{ display: 'inline-block' }}
      initial={{ y: '115%' }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: EASE, delay: 0.25 + i * 0.06 }}
    >
      {children}&nbsp;
    </motion.span>
  );
}

export default function Hero() {
  let i = 0;
  return (
    <section className="hero" id="top">
      <Scene />
      <div className="hero-vignette" />
      <div className="hero-inner">
        <motion.p className="hero-kicker" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}>
          Senior UX &amp; Product Designer
        </motion.p>
        <h1 className="hero-title">
          <span className="line">{L1.map((w, k) => <Word key={k} i={i++}>{w}</Word>)}</span>
          <span className="line">{L2.map(([w, a], k) => <Word key={k} i={i++} accent={a}>{w}</Word>)}</span>
        </h1>
        <motion.p className="hero-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
          Web and mobile apps, AI-powered products, and the enterprise dashboards and design
          systems behind them. 5+ years of it, currently at <strong>Exult Global</strong>.
        </motion.p>
        <motion.div className="hero-foot" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.8 }}>
          <span className="sign">by Anshad</span>
          <a className="scroll-cue" href="#work" data-cursor="link"><span>Scroll</span><i /></a>
        </motion.div>
      </div>
    </section>
  );
}
