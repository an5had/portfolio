import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { decodePayload } from '../utils/certificate.js';
import { PHOTOS } from '../photos.js';

const EASE = [0.7, 0, 0.2, 1];

export default function CertificatePage() {
  const [params] = useSearchParams();
  const data = decodePayload(params.get('c') || '');

  if (!data) {
    return (
      <section className="coa coa-invalid">
        <div className="container">
          <p className="eyebrow">Certificate</p>
          <h1>This certificate link is invalid.</h1>
          <p className="coa-note">The code is missing or corrupted. If you scanned a print, try again.</p>
          <Link to="/gallery" className="nav-cta" data-cursor="link">Go to the gallery</Link>
        </div>
      </section>
    );
  }

  const photo = PHOTOS[data.i];

  return (
    <section className="coa">
      <div className="container coa-in">
        <motion.div className="coa-photo" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          {photo ? <img src={photo} alt="Certified photograph" /> : <div className="coa-missing">Photograph</div>}
          <span className="coa-watermark">an5had</span>
        </motion.div>

        <motion.div className="coa-body" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}>
          <span className="coa-seal">✓ Verified</span>
          <p className="eyebrow">Certificate of Authenticity</p>
          <h1>Original photograph by Anshad</h1>
          <ul className="coa-facts">
            <li><span>Certificate No.</span><b>{data.id}</b></li>
            <li><span>Issued to</span><b>{data.email}</b></li>
            <li><span>Date</span><b>{data.d}</b></li>
            <li><span>Edition</span><b>Single certified copy</b></li>
          </ul>
          <p className="coa-note">
            This certifies that the holder owns an authentic, signed digital print of this photograph by
            Anshad (an5had). Each photograph is released as one certified copy.
          </p>
          <div className="coa-sign"><i>Anshad</i><span>itsmyportfolio.com</span></div>
          <Link to="/gallery" className="coa-back" data-cursor="link">← Back to the gallery</Link>
        </motion.div>
      </div>
    </section>
  );
}
