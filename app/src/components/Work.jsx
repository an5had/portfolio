import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';
import { CASES } from '../data.js';

function Counter({ to, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf, done = false;
    const animate = () => {
      if (done) return;
      done = true;
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        setV(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { animate(); io.disconnect(); } },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref} className="n">{prefix}{v}{suffix}</span>;
}

function Visual({ c }) {
  return (
    <Link to={`/works/${c.id}`} className="case-visual" data-cursor="view" style={{ background: `linear-gradient(140deg, ${c.accent}, #0a0d12)` }}>
      <span className="case-no">{c.no}</span>
      {c.locked && (
        <span className="case-lock" title="Password protected">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          Protected
        </span>
      )}
      {c.img
        ? <img src={c.img} alt={c.title} loading="lazy" />
        : <div className="mock"><div className="bar" /><div className="grid"><i /><i /><i /><i /><i /><i /></div></div>}
    </Link>
  );
}

export default function Work({ items = CASES, heading = true, showAllLink = false }) {
  return (
    <section className="work" id="work">
      {heading && (
        <div className="container work-head">
          <Reveal as="p" className="eyebrow">Selected work</Reveal>
          <Reveal as="h2" className="section-title" delay={0.05}>Case studies</Reveal>
        </div>
      )}

      {items.map((c, idx) => (
        <article className={`case${idx % 2 ? ' flip' : ''}`} id={`case-${c.id}`} key={c.id}>
          <Reveal className="case-media" y={36}><Visual c={c} /></Reveal>
          <div className="case-body">
            <Reveal as="p" className="case-client">{c.client} · {c.sector}</Reveal>
            <Reveal as="h3" className="case-title" delay={0.05}>
              <Link to={`/works/${c.id}`} data-cursor="link">{c.title}</Link>
            </Reveal>
            <Reveal as="p" className="case-summary" delay={0.1}>{c.summary}</Reveal>
            {c.stats.length > 0 && (
              <Reveal className="case-stats" delay={0.15}>
                {c.stats.map((s) => (
                  <div key={s.label}><Counter to={s.n} prefix={s.prefix} suffix={s.suffix} /><small>{s.label}</small></div>
                ))}
              </Reveal>
            )}
            <Reveal className="case-tags" delay={0.18}>
              {c.tags.map((t) => <span key={t}>{t}</span>)}
            </Reveal>
            <Reveal delay={0.2}>
              <Link to={`/works/${c.id}`} className="case-link" data-cursor="link">Read the case study →</Link>
            </Reveal>
          </div>
        </article>
      ))}

      {showAllLink && (
        <div className="container">
          <Reveal className="view-all"><Link to="/works" data-cursor="link">View all work →</Link></Reveal>
        </div>
      )}
    </section>
  );
}
