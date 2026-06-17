import PageHeader from '../components/PageHeader.jsx';
import Explorations from '../components/Explorations.jsx';
import { Contact } from '../components/Sections.jsx';
import Reveal from '../components/Reveal.jsx';

export default function ArticlesPage() {
  return (
    <>
      <PageHeader
        kicker="Articles & explorations"
        title="Design trends, process, and side quests."
        sub="Visual explorations and notes on craft, process and the things I build when no one’s briefing me."
      />
      <Explorations heading={false} />
      <section className="container soon">
        <Reveal className="soon-card">
          <h3>Long-form writing, coming soon</h3>
          <p>
            I’m writing about enterprise UX, data-heavy design systems and AI-powered products.
            In the meantime, the fastest way to talk shop is a quick message.
          </p>
          <a href="mailto:anuanshadpgm@gmail.com" data-cursor="link">Get in touch →</a>
        </Reveal>
      </section>
      <Contact />
    </>
  );
}
