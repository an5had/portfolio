import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal.jsx';
import { Contact } from '../components/Sections.jsx';
import { CASES, caseById } from '../data.js';
import NotFound from './NotFound.jsx';

const EASE = [0.7, 0, 0.2, 1];

// Light gate for NDA-sensitive case studies. Client-side only, basic protection by design.
const CASE_PASS = 'WUEG@123';
const unlockKey = (id) => `case-unlock-${id}`;

function CaseGate({ c, onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (value === CASE_PASS) {
      try { sessionStorage.setItem(unlockKey(c.id), '1'); } catch {}
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <article className="cs-lock">
      <motion.div className="cs-lock-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
        <span className="cs-lock-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <p className="cs-lock-eyebrow">{c.client} · Protected case study</p>
        <h1 className="cs-lock-title">This case study is password protected.</h1>
        <p className="cs-lock-body">
          This work involves NDA-sensitive material, so the full study is shared on request.
          Have the password? Enter it below. Otherwise, reach out and I’ll happily walk you through it.
        </p>
        <form className="cs-lock-form" onSubmit={submit}>
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Enter password"
            aria-label="Case study password"
            autoFocus
          />
          <button type="submit" data-cursor="link">Unlock</button>
        </form>
        {error && <p className="cs-lock-error">That password is not right. Try again or get in touch.</p>}
        <div className="cs-lock-links">
          <Link to="/works" data-cursor="link">← Back to work</Link>
          <a href="mailto:anuanshadpgm@gmail.com" data-cursor="link">Request access</a>
        </div>
      </motion.div>
    </article>
  );
}

export default function CaseStudyPage() {
  const { id } = useParams();
  const c = caseById(id);
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem(unlockKey(id)) === '1'; } catch { return false; }
  });

  if (!c) return <NotFound />;
  if (c.locked && !unlocked) return <CaseGate c={c} onUnlock={() => setUnlocked(true)} />;

  const idx = CASES.findIndex((x) => x.id === id);
  const next = CASES[(idx + 1) % CASES.length];

  return (
    <article className="cs">
      {/* hero */}
      <header className="cs-hero container">
        <motion.p className="cs-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link to="/works" data-cursor="link">Work</Link> <span>/</span> {c.client}
        </motion.p>
        <motion.h1 className="cs-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}>
          {c.title}
        </motion.h1>
        <motion.p className="cs-intro" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }}>
          {c.intro}
        </motion.p>
      </header>

      {/* cover */}
      <motion.div className="cs-cover container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}>
        <div className="cs-cover-inner" style={{ background: `linear-gradient(140deg, ${c.accent}, #0a0d12)` }}>
          {c.img
            ? <img src={c.img} alt={c.title} />
            : <div className="mock big"><div className="bar" /><div className="grid"><i /><i /><i /><i /><i /><i /></div></div>}
        </div>
      </motion.div>

      {/* context grid */}
      <section className="cs-context container">
        {c.context.map(([k, v], i) => (
          <Reveal className="cs-fact" key={k} delay={i * 0.05}>
            <span>{k}</span>
            <p>{v}</p>
          </Reveal>
        ))}
      </section>

      {/* challenge */}
      <section className="cs-block container">
        <Reveal as="p" className="cs-kicker">The challenge</Reveal>
        <Reveal as="p" className="cs-lead" delay={0.05}>{c.challenge}</Reveal>
      </section>

      {/* approach */}
      <section className="cs-block container">
        <Reveal as="p" className="cs-kicker">Approach</Reveal>
        <div className="cs-steps">
          {c.approach.map((s, i) => (
            <Reveal className="cs-step" key={s.title} delay={i * 0.06}>
              <span className="cs-step-no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* gallery */}
      {c.gallery.length > 0 && (
        <section className="cs-gallery container">
          {c.gallery.map((g, i) => (
            <Reveal className="cs-shot" key={i} y={36}>
              <div className="cs-shot-img" style={{ background: `linear-gradient(140deg, ${c.accent}, #0a0d12)` }}>
                <img src={g.src} alt={g.caption} loading="lazy" />
              </div>
              {g.caption && <p className="cs-caption">{g.caption}</p>}
            </Reveal>
          ))}
        </section>
      )}

      {/* outcomes */}
      <section className="cs-block container">
        <Reveal as="p" className="cs-kicker">Outcome</Reveal>
        <div className="cs-outcomes">
          {c.outcomes.map((o, i) => (
            <Reveal className="cs-outcome" key={i} delay={i * 0.06}>
              {o.n != null
                ? <><span className="cs-stat">{o.prefix || ''}{o.n}{o.suffix || ''}</span><p>{o.label}</p></>
                : <p className="cs-outcome-text">{o.text}</p>}
            </Reveal>
          ))}
        </div>
        {c.learning && (
          <Reveal as="blockquote" className="cs-learning" delay={0.1}>{c.learning}</Reveal>
        )}
      </section>

      {/* next */}
      <Link to={`/works/${next.id}`} className="cs-next" data-cursor="view">
        <div className="container cs-next-in">
          <span className="cs-next-label">Next project</span>
          <h2>{next.title}</h2>
          <span className="cs-next-client">{next.client} · {next.sector} →</span>
        </div>
      </Link>

      <Contact />
    </article>
  );
}
