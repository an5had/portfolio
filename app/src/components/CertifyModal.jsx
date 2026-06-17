import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  composePrint, makeQR, certUrl, genId, downloadDataUrl, getIssued, setIssued,
} from '../utils/certificate.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fmtDate = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function CertifyModal({ photoSrc, index, title, onClose }) {
  const [preview, setPreview] = useState(null);
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | working | done
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);     // { id, url, email }
  const issued = useRef(getIssued(index));

  // build the format preview (sample QR) on open
  useEffect(() => {
    let live = true;
    (async () => {
      const sampleQr = await makeQR(`${window.location.origin}/certificate`);
      const url = await composePrint(photoSrc, { qrDataUrl: sampleQr, certId: 'PREVIEW' });
      if (live) setPreview(url);
    })();
    return () => { live = false; };
  }, [photoSrc]);

  // already issued from this browser
  const prior = issued.current;
  const priorUrl = prior ? certUrl({ id: prior.id, email: prior.email, i: index, d: prior.date, t: title }) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setError('Please enter a valid email.'); return; }
    setError('');
    setPhase('working');
    try {
      const id = genId();
      const date = fmtDate();
      const mail = email.trim().toLowerCase();
      const payload = { id, email: mail, i: index, d: date, t: title };
      const url = certUrl(payload);
      const qr = await makeQR(url);
      const print = await composePrint(photoSrc, { qrDataUrl: qr, certId: id, email: mail, date });
      downloadDataUrl(print, `anshad-coa-${id}.jpg`);
      setIssued(index, { id, email: mail, date });
      setDone({ id, url, email: mail });
      setPhase('done');
    } catch (err) {
      console.error(err);
      setError('Something went wrong generating the print. Please try again.');
      setPhase('idle');
    }
  }

  return (
    <motion.div className="certify" data-lenis-prevent initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="certify-box" onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.96, y: 14, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.7, 0, 0.2, 1] }}>
        <button className="certify-close" onClick={onClose} data-cursor="link" aria-label="Close">✕</button>

        <div className="certify-preview">
          {preview
            ? <img src={preview} alt="Print preview" />
            : <div className="certify-skel">Composing your print…</div>}
        </div>

        <div className="certify-side">
          {phase === 'done' ? (
            <div className="certify-done">
              <p className="eyebrow">Certified</p>
              <h3>Print No. {done.id}</h3>
              <p className="certify-text">
                Your certified copy is downloading now, issued to <b>{done.email}</b>. The QR on the
                print links to its certificate of authenticity.
              </p>
              <Link className="lb-download" to={`/certificate?c=${done.url.split('c=')[1]}`} data-cursor="link">
                View certificate →
              </Link>
              <button className="certify-textbtn" onClick={onClose} data-cursor="link">Close</button>
            </div>
          ) : prior ? (
            <div className="certify-done">
              <p className="eyebrow">Already certified</p>
              <h3>Print No. {prior.id}</h3>
              <p className="certify-text">
                This photograph has already been issued from this device to <b>{prior.email}</b> on {prior.date}.
                Each photo is limited to one certified copy.
              </p>
              <Link className="lb-download" to={`/certificate?c=${priorUrl.split('c=')[1]}`} data-cursor="link">
                View certificate →
              </Link>
              <button className="certify-textbtn" onClick={onClose} data-cursor="link">Close</button>
            </div>
          ) : (
            <form className="certify-form" onSubmit={handleSubmit}>
              <p className="eyebrow">Certified print</p>
              <h3>Claim your copy</h3>
              <p className="certify-text">
                Each photograph is released as a single certified copy, set on a white mat and signed.
                Enter your email and we generate a unique certificate of authenticity, baked into the
                print as a QR code.
              </p>
              <label className="certify-field">
                <span>Your email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoFocus
                />
              </label>
              {error && <p className="certify-error">{error}</p>}
              <button type="submit" className="lb-download" disabled={phase === 'working'} data-cursor="link">
                {phase === 'working' ? 'Generating…' : 'Generate certificate & download ↓'}
              </button>
              <p className="certify-fine">One certified copy per photograph. It cannot be re-issued.</p>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
