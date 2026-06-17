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
        <Link className="brand" to="/" data-cursor="link" aria-label="an5had, home">an5had</Link>

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
