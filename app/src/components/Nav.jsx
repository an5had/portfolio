import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const LINKS = [
  ['Work', '/works'],
  ['Gallery', '/gallery'],
  ['Articles', '/articles'],
  ['About', '/about'],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const solid = scrolled || !isHome || open;

  return (
    <header className={`nav${solid ? ' solid' : ''}${open ? ' open' : ''}`}>
      <div className="nav-in">
        <Link className="brand" to="/" data-cursor="link" aria-label="an5had, home">
          {/* Mark from public/logo.svg, viewBox cropped to the glyph (the source
              file has ~20% padding) and filled with currentColor so it follows
              the nav's colour and hover state. */}
          <svg className="brand-mark" viewBox="46 54 153 153" aria-hidden="true" focusable="false">
            <path d="M103.711 54H138.605L80.8947 207H46L103.711 54Z" fill="currentColor" />
            <path d="M91.6318 147.947L91.6318 113.053L199 113.053L199 147.947L91.6318 147.947Z" fill="currentColor" />
            <path d="M108.632 207L121.784 172.105L199 172.105L199 207L108.632 207Z" fill="currentColor" />
            <path d="M199 207L163.211 207L163.211 113.053L199 113.053L199 207Z" fill="currentColor" />
            <path d="M166.342 54L153.18 88.8945H139.053V54H166.342Z" fill="currentColor" />
          </svg>
        </Link>

        <nav className="nav-links">
          {LINKS.map(([label, to]) => (
            <NavLink key={to} to={to} data-cursor="link" className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
        </nav>

        <Link to="/contact" className="nav-cta" data-cursor="link">Let’s talk</Link>

        <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span />
        </button>
      </div>

      <div className="nav-menu" aria-hidden={!open}>
        {LINKS.map(([label, to]) => (
          <NavLink key={to} to={to}>{label}</NavLink>
        ))}
        <NavLink to="/contact">Let’s talk</NavLink>
      </div>
    </header>
  );
}
