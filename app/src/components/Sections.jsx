import Reveal from './Reveal.jsx';
import { CAPABILITIES, TOOLS, FACTS, SOCIALS, EXPERIENCE, CLIENTS, PORTRAIT } from '../data.js';

const MARQUEE = ['Enterprise Platforms', 'Data & Dashboards', 'AI-Powered Products', 'Design Systems', 'UX Research', 'Product Strategy'];

export function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <section className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((m, k) => (<span key={k}>{m}<i>&nbsp;&nbsp;✦&nbsp;&nbsp;</i></span>))}
      </div>
    </section>
  );
}

export function Intro() {
  return (
    <section className="intro container" id="intro">
      <Reveal as="p" className="eyebrow">What I actually do</Reveal>
      <Reveal as="h2" className="intro-lead" delay={0.05}>
        I design digital products that feel obvious, then bring the messy part{' '}
        <span className="u">into focus</span>.
      </Reveal>
      <Reveal as="p" className="intro-body" delay={0.1}>
        Senior UX Designer at Exult Global, working across enterprise systems, analytics,
        fintech and consumer products for high-profile clients including Wheels Up, Dexcom,
        HIG Capital, Zayo and CyberProof. I turn vague, under-defined problems into products
        that ship and get measured, staying close to the work from early research through to
        engineering handoff.
      </Reveal>
    </section>
  );
}

export function Clients() {
  return (
    <section className="clients-band" aria-label="Selected clients">
      <div className="container">
        <Reveal as="p" className="clients-eyebrow">
          High-profile clients I’ve designed for at <span>Exult Global</span>
        </Reveal>
        <Reveal className="clients-logos" delay={0.05}>
          {CLIENTS.map((c) => (
            <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer" data-cursor="link" aria-label={c.name} title={c.name}>
              <img src={c.logo} alt={c.name} loading="lazy" />
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Capabilities() {
  return (
    <section className="capabilities container" id="capabilities">
      <Reveal as="p" className="eyebrow">How I work</Reveal>
      <Reveal as="h2" className="section-title" delay={0.05}>From fuzzy problem to shipped product.</Reveal>
      <div className="cap-grid">
        {CAPABILITIES.map((c, k) => (
          <Reveal className="cap" key={c.no} delay={k * 0.08}>
            <span className="no">{c.no}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="tools" delay={0.1}>
        {TOOLS.map((t) => <span key={t}>{t}</span>)}
      </Reveal>
    </section>
  );
}

export function About() {
  return (
    <section className="about container" id="about">
      <Reveal className="about-portrait" y={36}>
        <img src={PORTRAIT} alt="Anshad" loading="lazy" />
      </Reveal>
      <div className="about-text">
        <Reveal as="p" className="eyebrow">About</Reveal>
        <Reveal as="h2" className="about-lead" delay={0.05}>
          Designer focused on digital products, enterprise platforms and AI-powered
          experiences that solve complex business &amp; user problems.
        </Reveal>
        <Reveal as="p" className="about-body" delay={0.1}>
          Over the past several years I’ve worked across web, mobile, workflow automation,
          data-heavy applications and enterprise systems. I work with cross-functional teams
          to turn complex requirements into experiences that feel intuitive.
        </Reveal>
        <Reveal as="p" className="about-body" delay={0.13}>
          My interests run beyond traditional UX: AI, emerging tech, product strategy and the
          creator economy. The best products come from balancing what users need, what the
          business wants and what the technology makes possible.
        </Reveal>
        <Reveal as="ul" className="about-facts" delay={0.16}>
          {FACTS.map(([k, v]) => (<li key={k}><b>{k}</b><span>{v}</span></li>))}
        </Reveal>
        <Reveal delay={0.2}>
          <a className="resume-btn" href="/anshad-resume.pdf" download="Muhammed Anshad A - Resume.pdf" data-cursor="link">
            Download résumé <span>PDF ↓</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section className="experience container" id="experience">
      <Reveal as="p" className="eyebrow">Where I’ve worked</Reveal>
      <Reveal as="h2" className="section-title" delay={0.05}>5+ years, four teams.</Reveal>
      <ul className="timeline">
        {EXPERIENCE.map((e, k) => (
          <Reveal as="li" className="tl-item" key={e.org} delay={k * 0.06}>
            <div className="tl-period">{e.period}</div>
            <div className="tl-body">
              <h3>{e.role} <span>· {e.org}</span></h3>
              <p>{e.note}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <Reveal as="p" className="eyebrow">Get in touch</Reveal>
        <Reveal as="h2" className="contact-lead" delay={0.05}>
          You’re already on <span className="u">itsmyportfolio.com</span>, so let’s talk.
        </Reveal>
        <Reveal delay={0.1}>
          <a className="contact-mail" href="mailto:anuanshadpgm@gmail.com" data-cursor="link">
            anuanshadpgm@gmail.com
          </a>
        </Reveal>
        <Reveal className="contact-socials" delay={0.15}>
          {SOCIALS.map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer" data-cursor="link">{label}</a>
          ))}
          <a href="/anshad-resume.pdf" download="Muhammed Anshad A - Resume.pdf" data-cursor="link">Résumé (PDF)</a>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-in">
        <span>© {new Date().getFullYear()} Muhammed Anshad A</span>
        <span>itsmyportfolio.com · yes, really</span>
        <a href="#top" data-cursor="link">Back to top ↑</a>
      </div>
    </footer>
  );
}
