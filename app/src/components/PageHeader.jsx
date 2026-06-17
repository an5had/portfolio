import { motion } from 'framer-motion';

const EASE = [0.7, 0, 0.2, 1];

export default function PageHeader({ kicker, title, sub }) {
  return (
    <header className="page-header container">
      <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {kicker}
      </motion.p>
      <motion.h1 className="page-title" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}>
        {title}
      </motion.h1>
      {sub && (
        <motion.p className="page-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }}>
          {sub}
        </motion.p>
      )}
    </header>
  );
}
