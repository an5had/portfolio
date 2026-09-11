/* Timeline for the "Hand me the mess" focus section.
   One progress value p (0 → 1) drives everything: the 3D board, the audit overlay, the captions
   and the lens ring. p comes from scroll while the stage is pinned, or from dragging the ring. */

export const STOPS = [
  {
    id: 'mess', label: 'MESS', at: 0,
    title: 'Same number. Three answers.',
    body: 'Duplicated KPIs, clashing charts, two ways to navigate.',
  },
  {
    id: 'map', label: 'MAP', at: 0.35,
    title: 'Audit before pixels.',
    body: 'Find the duplicates, dead ends and hidden patterns first.',
  },
  {
    id: 'system', label: 'SYSTEM', at: 0.7,
    title: 'One set of rules.',
    body: 'KPI modules, chart rules and one layout grid.',
  },
  {
    id: 'focus', label: 'FOCUS', at: 1,
    title: 'Clarity you can measure.',
    body: 'The BI design system I designed for Wheels Up unified 60+ dashboards: a reported 40% usability boost and 25% faster report generation.',
  },
];

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
// rises a→b, holds, falls c→d
export const bump = (a, b, c, d, x) => smooth(a, b, x) * (1 - smooth(c, d, x));

export function stopIndex(p) {
  return p < 0.17 ? 0 : p < 0.53 ? 1 : p < 0.86 ? 2 : 3;
}

/* Scroll fraction → p. The last 12% of the pinned scroll holds on FOCUS so the payoff can be read
   before the section releases. */
export const HOLD = 0.88;

export function phases(p) {
  return {
    settle: smooth(0.3, 0.82, p),            // fragments travel into the grid
    merge: smooth(0.52, 0.8, p),             // duplicates collapse into their primary
    // rack focus: MESS is focused on the loud cards at the front of the pile, MAP racks back to the
    // duplicates buried behind them, then the plane pulls forward to the finished board
    focusZ: p < 0.35 ? lerp(1.3, -2.6, smooth(0.04, 0.33, p)) : lerp(-2.6, 0, smooth(0.37, 0.94, p)),
    haze: 1 - smooth(0, 0.97, p),            // overall softness until focus locks
    audit: bump(0.14, 0.26, 0.44, 0.54, p),  // MAP: outlines + tags
    grid: bump(0.46, 0.6, 0.84, 0.97, p),    // SYSTEM: layout-grid columns
    lock: smooth(0.93, 0.985, p),            // FOCUS confirmed
  };
}
