import { motion } from 'framer-motion';

const EASE = [0.7, 0, 0.2, 1];

export default function Reveal({ children, as = 'div', delay = 0, y = 24, className, ...rest }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}
