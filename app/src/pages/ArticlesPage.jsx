import PageHeader from '../components/PageHeader.jsx';
import Explorations from '../components/Explorations.jsx';
import { Contact } from '../components/Sections.jsx';
import Reveal from '../components/Reveal.jsx';
import { ARTICLES } from '../data.js';

const LINKEDIN = 'https://www.linkedin.com/in/an5had';

export default function ArticlesPage() {
  return (
    <>
      <PageHeader
        kicker="Articles & explorations"
        title="Writing, hot takes and side quests."
        sub="Notes on enterprise UX, design systems and AI-powered products, plus the visual things I build when no one’s briefing me."
      />

      <section className="container articles">
        <Reveal as="p" className="eyebrow">Featured writing</Reveal>
        {ARTICLES.map((a) => (
          <Reveal key={a.url} className="article-card" y={28}>
            <a href={a.url} target="_blank" rel="noopener noreferrer" data-cursor="view">
              <div className="article-meta">
                <span>{a.tag}</span>
                <span>{a.date} · {a.read}</span>
              </div>
              <h3>{a.title}</h3>
              <p>{a.blurb}</p>
              <span className="article-link">Read on Medium →</span>
            </a>
          </Reveal>
        ))}

        <Reveal className="li-card" y={28}>
          <div className="li-head">
            <span className="li-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
            </span>
            <div>
              <strong>Where the rest of my takes live</strong>
              <span>linkedin.com/in/an5had</span>
            </div>
          </div>
          <p>
            Honestly? Most of my opinions never make it to a polished article. The half-baked-but-spicy
            UX takes, the product nerd-outs and the behind-the-scenes mostly happen on LinkedIn, where
            I’m pretty active. If you want the unfiltered version, that’s the place. Come say hi.
          </p>
          <a className="li-btn" href={LINKEDIN} target="_blank" rel="noopener noreferrer" data-cursor="link">
            Connect on LinkedIn →
          </a>
        </Reveal>
      </section>

      <Explorations heading={false} />
      <Contact />
    </>
  );
}
