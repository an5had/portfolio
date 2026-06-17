import PageHeader from '../components/PageHeader.jsx';
import Work from '../components/Work.jsx';
import Explorations from '../components/Explorations.jsx';
import { Contact } from '../components/Sections.jsx';

export default function WorksPage() {
  return (
    <>
      <PageHeader
        kicker="Selected work"
        title="Case studies across enterprise, data & consumer."
        sub="Five years of shipping products, from 50+ dashboards at Wheels Up to loyalty apps, an ATS and a #6 App Store productivity app."
      />
      <Work heading={false} />
      <Explorations />
      <Contact />
    </>
  );
}
