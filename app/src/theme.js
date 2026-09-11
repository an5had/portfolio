/* Light / dark theme.
   The attribute is set before first paint by the inline script in index.html (stored choice, else
   the device setting), so there's no flash. This module flips it at runtime: saves the choice,
   updates the browser UI colour, tells WebGL scenes to repaint ('themechange'), and — where the
   View Transitions API exists — reveals the new theme as a circle growing from the toggle. */

const KEY = 'theme';
const root = () => document.documentElement;

export const getTheme = () =>
  (typeof document !== 'undefined' && root().dataset.theme === 'light' ? 'light' : 'dark');

function apply(theme) {
  const r = root();
  r.dataset.theme = theme;
  r.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#fbfaf9' : '#08080a');
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function setTheme(theme, origin) {
  try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce || !origin) { apply(theme); return; }
  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const vt = document.startViewTransition(() => apply(theme));
  vt.ready.then(() => {
    root().animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => {});
}

// follow the device setting live, until the visitor picks a theme themselves
export function watchSystemTheme() {
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  const on = () => {
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch { /* ignore */ }
    if (!stored) apply(mq.matches ? 'light' : 'dark');
  };
  mq.addEventListener?.('change', on);
  return () => mq.removeEventListener?.('change', on);
}
