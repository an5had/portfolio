import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Reveal from './Reveal.jsx';
import { PHOTOS } from '../photos.js';

export default function Lens() {
  const section = useRef(null);
  const track = useRef(null);
  const dist = useRef(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, (v) => 40 - v * dist.current);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => { dist.current = Math.max(0, el.scrollWidth - window.innerWidth + 80); };
    measure();
    const ro = new ResizeObserver(measure); // re-measure once images load
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const hasPhotos = PHOTOS.length > 0;
  const items = hasPhotos ? PHOTOS : new Array(6).fill(null);

  return (
    <section className="lens" id="lens" ref={section}>
      <div className="container lens-head">
        <div>
          <Reveal as="p" className="eyebrow">Off the clock</Reveal>
          <Reveal as="h2" className="section-title" delay={0.05}>Through my lens</Reveal>
          <Reveal delay={0.12}>
            <Link to="/gallery" className="lens-link" data-cursor="link">View the full gallery, take a print &rarr;</Link>
          </Reveal>
        </div>
        <Reveal as="p" className="lens-note" delay={0.1}>
          I’m a street photographer documenting everyday life. That same habit of watching
          people and reading patterns is exactly how I approach design.
        </Reveal>
      </div>

      <motion.div className="lens-track" ref={track} style={{ x }}>
        {items.map((src, i) => (
          <figure className="frame" key={i} data-cursor="view">
            {src
              ? <img src={src} alt={`Street photograph ${i + 1}`} loading="lazy" draggable="false" />
              : <span>{String(i + 1).padStart(2, '0')}</span>}
          </figure>
        ))}
      </motion.div>
    </section>
  );
}
