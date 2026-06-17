import PageHeader from '../components/PageHeader.jsx';
import { Contact } from '../components/Sections.jsx';

export default function ContactPage() {
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Let’s talk."
        sub="Collaborations, roles, or just to say hello. Whatever it is, this is a good place to start."
      />
      <Contact />
    </>
  );
}
