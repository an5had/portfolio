import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader.jsx';
import { Contact } from '../components/Sections.jsx';
import CertifyModal from '../components/CertifyModal.jsx';
import { PHOTOS } from '../photos.js';

export default function GalleryPage() {
  const [active, setActive] = useState(null);
  const [certify, setCertify] = useState(null);
  const photos = PHOTOS;

  useEffect(() => {
    if (active === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, photos.length]);

  return (
    <>
      <PageHeader
        kicker="Photography"
        title="The gallery."
        sub="Street photographs from everyday life. Each one is released as a single certified print, set on a white mat and signed."
      />

      <section className="gallery container">
        {photos.length === 0 ? (
          <p className="gallery-empty">
            Photos are on their way. Drop them into <code>app/src/assets/photos</code> and they show up here.
          </p>
        ) : (
          <div className="gallery-grid">
            {photos.map((src, i) => (
              <motion.figure
                key={i}
                className="gallery-item"
                data-cursor="view"
                onClick={() => setActive(i)}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-6%' }}
                transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1], delay: (i % 3) * 0.05 }}
              >
                <img src={src} alt={`Photograph ${i + 1}`} loading="lazy" draggable="false" />
                <span className="gallery-no">{String(i + 1).padStart(2, '0')}</span>
              </motion.figure>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {active !== null && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <button className="lb-arrow prev" data-cursor="link" aria-label="Previous"
              onClick={(e) => { e.stopPropagation(); setActive((active - 1 + photos.length) % photos.length); }}>←</button>

            <motion.figure className="lb-inner" onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.96, y: 12, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.7, 0, 0.2, 1] }}>
              <img src={photos[active]} alt={`Photograph ${active + 1}`} draggable="false" />
              <figcaption className="lb-bar">
                <span className="lb-sign">Anshad · <i>an5had</i></span>
                <span className="lb-actions">
                  <button className="lb-download" data-cursor="link" onClick={() => setCertify(active)}>Take a certified print ↓</button>
                  <button className="lb-close" data-cursor="link" aria-label="Close" onClick={() => setActive(null)}>✕</button>
                </span>
              </figcaption>
            </motion.figure>

            <button className="lb-arrow next" data-cursor="link" aria-label="Next"
              onClick={(e) => { e.stopPropagation(); setActive((active + 1) % photos.length); }}>→</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {certify !== null && (
          <CertifyModal
            photoSrc={photos[certify]}
            index={certify}
            title={`Photograph ${certify + 1}`}
            onClose={() => setCertify(null)}
          />
        )}
      </AnimatePresence>

      <Contact />
    </>
  );
}
