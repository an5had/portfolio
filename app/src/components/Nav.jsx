import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getTheme, setTheme, watchSystemTheme } from '../theme.js';

/* Sun ⇄ moon. The icon shows the theme you'll switch TO. One circle morphs: small with rays = sun;
   full size with a masked "bite" = crescent moon. */
function ThemeToggle() {
  const [theme, setT] = useState(getTheme);
  useEffect(() => {
    const on = (e) => setT(e.detail);
    window.addEventListener('themechange', on);
    const unwatch = watchSystemTheme();
    return () => { window.removeEventListener('themechange', on); unwatch(); };
  }, []);
  const next = theme === 'light' ? 'dark' : 'light';
  return (
    <button
      type="button"
      className="theme-toggle"
      data-cursor="link"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
    >
      <svg className="tt-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <mask id="tt-mask">
          <rect x="-4" y="-4" width="32" height="32" fill="#fff" />
          <circle className="tt-bite" cx="17" cy="7" r="7" fill="#000" />
        </mask>
        <circle className="tt-core" cx="12" cy="12" r="8" fill="currentColor" mask="url(#tt-mask)" />
        <g className="tt-rays" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" />
        </g>
      </svg>
    </button>
  );
}

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

        <ThemeToggle />

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
