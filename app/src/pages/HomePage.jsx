import Hero from '../components/Hero.jsx';
import Work from '../components/Work.jsx';
import Lens from '../components/Lens.jsx';
import Explorations from '../components/Explorations.jsx';
import { Marquee, Intro, Capabilities, Contact } from '../components/Sections.jsx';
import { CASES, FEATURED } from '../data.js';

export default function HomePage() {
  const featured = CASES.filter((w) => FEATURED.includes(w.id));
  return (
    <>
      <Hero />
      <Marquee />
      <Intro />
      <Work items={featured} showAllLink />
      <Capabilities />
      <Explorations />
      <Lens />
      <Contact />
    </>
  );
}
