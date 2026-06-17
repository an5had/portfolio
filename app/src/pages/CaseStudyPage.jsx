import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal.jsx';
import { Contact } from '../components/Sections.jsx';
import { CASES, caseById } from '../data.js';
import NotFound from './NotFound.jsx';

const EASE = [0.7, 0, 0.2, 1];

export default function CaseStudyPage() {
  const { id } = useParams();
  const c = caseById(id);
  if (!c) return <NotFound />;

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
