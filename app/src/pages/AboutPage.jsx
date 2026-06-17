import PageHeader from '../components/PageHeader.jsx';
import Lens from '../components/Lens.jsx';
import { About, Experience, Capabilities, Contact } from '../components/Sections.jsx';

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About"
        title="Designer, photographer, tinkerer."
        sub="Senior UX & Product Designer based in India, working globally. I care about users, the business and the tech that ties them together."
      />
      <About />
      <Experience />
      <Capabilities />
      <Lens />
      <Contact />
    </>
  );
}
