/* The dashboard fragments on the focus board.
   Every card exists twice, painted to a 2D canvas: a MESS version (clashing fonts, colours and
   number formats, the way dashboards drift when nobody owns the rules) and a CLEAN version (one
   type scale, one palette, one grid). The 3D scene cross-fades between them while the card is
   still out of focus, so the swap reads as the rules taking hold rather than a texture pop.

   Units: world units in the scene; painters work in "design px" = world × 100, so a card is
   designed like a real ~840px-wide dashboard and rasterised at whatever density the screen needs.
   Everything here is illustrative — no client data. */

export const BOARD = { W: 8.4, H: 5.69, R: 0.22, PAD: 0.28, GUT: 0.16, COLS: 12 };
export const COL = (BOARD.W - 2 * BOARD.PAD - (BOARD.COLS - 1) * BOARD.GUT) / BOARD.COLS;
const ROWS = [0.52, 1.08, 1.9, 1.15];

function cell(c0, c1, row) {
  const x = -BOARD.W / 2 + BOARD.PAD + c0 * (COL + BOARD.GUT);
  const w = (c1 - c0) * COL + (c1 - c0 - 1) * BOARD.GUT;
  let top = BOARD.H / 2 - BOARD.PAD;
  for (let r = 0; r < row; r++) top -= ROWS[r] + BOARD.GUT;
  const h = ROWS[row];
  return { cx: x + w / 2, cy: top - h / 2, w, h };
}

/* mess pose: position, rotation (deg) and scale while scattered. `into`: a duplicate that
   collapses into that card. `delay` staggers the travel so the pile doesn't move as one slab. */
export const CARDS = [
  { id: 'nav', ...cell(0, 12, 0), rMess: 0.0, delay: 0.05,
    mess: { x: -0.5, y: 2.4, z: -2.4, rx: 10, ry: -6, rz: -4, s: 0.8 } },
  { id: 'sidenav', w: 1.35, h: 3.3, into: 'nav', rMess: 0.0, delay: 0.3,
    mess: { x: -4.35, y: 0.05, z: -3.0, rx: 0, ry: 22, rz: 5, s: 0.9 } },
  { id: 'kpi-rev', ...cell(0, 4, 1), rMess: 0.04, delay: 0.15,
    mess: { x: 1.55, y: 1.2, z: -2.1, rx: 0, ry: 0, rz: 6, s: 1.05 } },
  { id: 'dup-rev-a', w: 2.3, h: 0.9, into: 'kpi-rev', rMess: 0.02, delay: 0.35,
    mess: { x: -1.95, y: 1.1, z: -2.9, rx: 0, ry: 12, rz: -8, s: 1.0 } },
  { id: 'dup-rev-b', w: 1.6, h: 0.62, into: 'kpi-rev', rMess: 0.31, delay: 0.4,
    mess: { x: 4.1, y: 1.9, z: -2.6, rx: 0, ry: 0, rz: 12, s: 1.0 } },
  { id: 'kpi-orders', ...cell(4, 8, 1), rMess: 0.18, delay: 0.25,
    mess: { x: 4.15, y: -0.1, z: 0.9, rx: 0, ry: -22, rz: -9, s: 0.9 } },
  { id: 'kpi-ontime', ...cell(8, 12, 1), rMess: 0.0, delay: 0.2,
    mess: { x: -3.05, y: 1.85, z: 1.5, rx: 0, ry: 0, rz: 13, s: 0.82 } },
  { id: 'chart-line', ...cell(0, 8, 2), rMess: 0.06, delay: 0.1,
    mess: { x: -1.6, y: -1.1, z: 0.9, rx: -10, ry: 18, rz: -4, s: 0.78 } },
  { id: 'chart-bars', ...cell(8, 12, 2), rMess: 0.0, delay: 0.3,
    mess: { x: 2.0, y: -1.7, z: -1.3, rx: 0, ry: 0, rz: 9, s: 0.95 } },
  { id: 'table', ...cell(0, 8, 3), rMess: 0.0, delay: 0.45,
    mess: { x: 0.3, y: -2.95, z: 2.2, rx: 16, ry: 0, rz: 3, s: 0.7 } },
  { id: 'donut', ...cell(8, 12, 3), rMess: 0.1, delay: 0.5,
    mess: { x: 4.5, y: -2.5, z: -0.5, rx: 0, ry: 0, rz: -15, s: 0.9 } },
  { id: 'xlsx', w: 2.1, h: 0.56, into: 'table', rMess: 0.08, delay: 0.55,
    mess: { x: -4.0, y: -2.7, z: -1.9, rx: 0, ry: 0, rz: -11, s: 1.0 } },
];
export const R_CLEAN = 0.12;

// MAP stop: what the audit finds
export const AUDIT = [
  { n: '01', label: 'Same data, three formats', ids: ['kpi-rev', 'dup-rev-a', 'dup-rev-b'], anchor: 'dup-rev-a' },
  { n: '02', label: 'Two navigation patterns', ids: ['nav', 'sidenav'], anchor: 'sidenav' },
  { n: '03', label: 'No colour rules', ids: ['chart-line', 'chart-bars', 'donut'], anchor: 'chart-bars' },
  { n: '04', label: 'Shadow spreadsheet', ids: ['xlsx'], anchor: 'xlsx' },
];

/* ───────────────────────────── painting ───────────────────────────── */

const SANS = '"Google Sans Flex", "Helvetica Neue", Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace';
const IMPACT = 'Impact, "Arial Black", "Helvetica Neue", sans-serif';
const COMIC = '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive';
const ARIAL = 'Arial, Helvetica, sans-serif';
const VERDANA = 'Verdana, Geneva, sans-serif';

// the CLEAN dashboard follows the site theme; the MESS paint jobs are deliberately theme-less
const C_DARK = {
  bg: '#15171d', nav: '#111318', line: 'rgba(255,255,255,0.075)', grid: 'rgba(255,255,255,0.055)',
  text: '#eceef3', muted: '#8d92a1', dim: '#5f6472', accent: '#7486ff', accentRgb: '116,134,255', accent2: '#b9c1ff',
  warnBg: 'rgba(255,138,106,0.14)', up: '#6fd394', upBg: 'rgba(111,211,148,0.12)',
  soft: 'rgba(255,255,255,0.05)', soft2: 'rgba(255,255,255,0.08)', faint: 'rgba(255,255,255,0.32)',
  tipBg: '#23262e', tipFg: '#eceef3', neutral: '#4b505c', warn: '#ff8a6a',
};
const C_LIGHT = {
  bg: '#ffffff', nav: '#ffffff', line: 'rgba(38,36,36,0.09)', grid: 'rgba(38,36,36,0.07)',
  text: '#262424', muted: '#7a7470', dim: '#aaa4a0', accent: '#2f45e0', accentRgb: '47,69,224', accent2: '#9aa6f5',
  warnBg: 'rgba(224,70,31,0.1)', up: '#1e9a55', upBg: 'rgba(30,154,85,0.1)',
  soft: 'rgba(38,36,36,0.045)', soft2: 'rgba(38,36,36,0.07)', faint: 'rgba(38,36,36,0.3)',
  tipBg: '#262424', tipFg: '#fbfaf9', neutral: '#d9d4d0', warn: '#e0461f',
};
let C = C_DARK;

function rrect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
// full-bleed fill (the shader rounds the corners) + a hairline that follows the same radius
function base(ctx, w, h, fill, r, line) {
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, w, h);
  if (line) { ctx.strokeStyle = line; ctx.lineWidth = 1; rrect(ctx, 0.5, 0.5, w - 1, h - 1, r - 0.5); ctx.stroke(); }
}
function txt(ctx, s, x, y, font, color, align = 'left') {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}
function spaced(ctx, s, x, y, font, color, sp) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let cx = x;
  for (const ch of s) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sp; }
}
function curve(ctx, pts) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}
const pill = (ctx, x, y, w, h, fill) => { ctx.fillStyle = fill; rrect(ctx, x, y, w, h, h / 2); ctx.fill(); };

/* ── clean ── */

function navClean(ctx, w, h) {
  base(ctx, w, h, C.nav, 12, C.line);
  ctx.fillStyle = C.accent; rrect(ctx, 16, 15, 22, 22, 6); ctx.fill();
  ctx.fillStyle = '#fff'; rrect(ctx, 23, 22, 8, 8, 2); ctx.fill();
  txt(ctx, 'Insights', 48, 31, `600 14px ${SANS}`, C.text);
  let x = 150;
  ['Overview', 'Reports', 'Accounts', 'Alerts'].forEach((t, i) => {
    ctx.font = `500 12.5px ${SANS}`;
    const tw = ctx.measureText(t).width;
    if (i === 0) pill(ctx, x - 12, 14, tw + 24, 24, C.soft2);
    txt(ctx, t, x, 30.5, `500 12.5px ${SANS}`, i === 0 ? C.text : C.muted);
    x += tw + 34;
  });
  pill(ctx, w - 214, 13, 164, 26, C.soft);
  ctx.strokeStyle = C.dim; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(w - 196, 25, 4.5, 0, Math.PI * 2); ctx.moveTo(w - 192.6, 28.4); ctx.lineTo(w - 189.5, 31.5); ctx.stroke();
  txt(ctx, 'Search', w - 182, 30.5, `400 12px ${SANS}`, C.dim);
  const g = ctx.createLinearGradient(w - 43, 13, w - 17, 39);
  g.addColorStop(0, C.accent); g.addColorStop(1, C.accent2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w - 30, 26, 13, 0, Math.PI * 2); ctx.fill();
}

function kpiClean({ label, value, delta, note, spark, bar }) {
  return (ctx, w, h) => {
    base(ctx, w, h, C.bg, 12, C.line);
    txt(ctx, label, 18, 30, `500 12px ${SANS}`, C.muted);
    txt(ctx, value, 18, 67, `600 29px ${SANS}`, C.text);
    if (bar != null) {
      pill(ctx, 18, 82, w - 36, 5, C.soft2);
      pill(ctx, 18, 82, (w - 36) * bar, 5, C.accent);
      txt(ctx, note, w - 18, 30, `500 11px ${SANS}`, C.dim, 'right');
    } else {
      ctx.font = `600 11px ${SANS}`;
      const dw = ctx.measureText(delta).width + 16;
      pill(ctx, 18, 78, dw, 18, C.upBg);
      txt(ctx, delta, 26, 91, `600 11px ${SANS}`, C.up);
      txt(ctx, note, 18 + dw + 8, 91, `400 11px ${SANS}`, C.dim);
    }
    if (spark) {
      const x0 = w - 100, x1 = w - 18, y0 = 26, y1 = 56;
      const mn = Math.min(...spark), mx = Math.max(...spark);
      const pts = spark.map((v, i) => [x0 + (i / (spark.length - 1)) * (x1 - x0), y1 - ((v - mn) / (mx - mn)) * (y1 - y0)]);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); curve(ctx, pts); ctx.stroke();
      const e = pts[pts.length - 1];
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(e[0], e[1], 2.6, 0, Math.PI * 2); ctx.fill();
    }
  };
}
const kpiRevClean = kpiClean({ label: 'Revenue', value: '$4.2M', delta: '▲ 8.1%', note: 'vs last month', spark: [12, 14, 13, 17, 16, 19, 22, 21, 25] });
const kpiOrdersClean = kpiClean({ label: 'Orders', value: '18,240', delta: '▲ 3.4%', note: 'vs last month', spark: [20, 18, 21, 22, 21, 24, 23, 26, 27] });
const kpiOntimeClean = kpiClean({ label: 'On-time rate', value: '94.1%', note: 'Target 92%', bar: 0.941 });

const THIS_YEAR = [31, 34, 33, 38, 41, 40, 45, 48, 47, 53, 57, 61];
const LAST_YEAR = [28, 29, 31, 30, 33, 35, 34, 37, 39, 38, 41, 43];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function lineClean(ctx, w, h) {
  base(ctx, w, h, C.bg, 12, C.line);
  txt(ctx, 'Revenue trend', 18, 29, `600 13px ${SANS}`, C.text);
  txt(ctx, 'Last 12 months', 18, 45, `400 11px ${SANS}`, C.dim);
  ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(w - 176, 26, 3.5, 0, Math.PI * 2); ctx.fill();
  txt(ctx, 'This year', w - 168, 30, `500 11px ${SANS}`, C.muted);
  ctx.strokeStyle = C.faint; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(w - 96, 26); ctx.lineTo(w - 82, 26); ctx.stroke(); ctx.setLineDash([]);
  txt(ctx, 'Last year', w - 76, 30, `500 11px ${SANS}`, C.muted);

  const L = 48, R = w - 20, T = 64, B = h - 30;
  const y = (v) => B - ((v - 20) / 45) * (B - T);
  const x = (i) => L + (i / 11) * (R - L);
  ctx.lineWidth = 1;
  [[20, '$2M'], [40, '$4M'], [60, '$6M']].forEach(([v, s]) => {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(L, y(v)); ctx.lineTo(R, y(v)); ctx.stroke();
    txt(ctx, s, L - 10, y(v) + 3.5, `400 10px ${SANS}`, C.dim, 'right');
  });
  MONTHS.forEach((m, i) => { if (i % 2 === 0) txt(ctx, m, x(i), h - 12, `400 10px ${SANS}`, C.dim, 'center'); });

  const now = THIS_YEAR.map((v, i) => [x(i), y(v)]);
  const grad = ctx.createLinearGradient(0, T, 0, B);
  grad.addColorStop(0, `rgba(${C.accentRgb},0.26)`); grad.addColorStop(1, `rgba(${C.accentRgb},0)`);
  ctx.beginPath(); curve(ctx, now); ctx.lineTo(R, B); ctx.lineTo(L, B); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = C.faint; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
  ctx.beginPath(); curve(ctx, LAST_YEAR.map((v, i) => [x(i), y(v)])); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); curve(ctx, now); ctx.stroke();
  const e = now[now.length - 1];
  ctx.fillStyle = `rgba(${C.accentRgb},0.22)`; ctx.beginPath(); ctx.arc(e[0], e[1], 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(e[0], e[1], 3.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.tipBg; rrect(ctx, e[0] - 58, e[1] - 32, 48, 21, 6); ctx.fill();
  txt(ctx, '$6.1M', e[0] - 34, e[1] - 17.5, `600 11px ${SANS}`, C.tipFg, 'center');
}

const REGIONS = [['North America', 42], ['Europe', 24], ['Middle East', 16], ['Asia Pacific', 11], ['Other', 7]];
function barsClean(ctx, w, h) {
  base(ctx, w, h, C.bg, 12, C.line);
  txt(ctx, 'Revenue by region', 18, 29, `600 13px ${SANS}`, C.text);
  const alphas = [1, 0.72, 0.52, 0.38, 0.26];
  REGIONS.forEach(([name, v], i) => {
    const yy = 54 + i * 26;
    txt(ctx, name, 18, yy, `400 11.5px ${SANS}`, C.muted);
    txt(ctx, `${v}%`, w - 18, yy, `600 11.5px ${SANS}`, C.text, 'right');
    pill(ctx, 18, yy + 7, w - 36, 6, C.soft);
    pill(ctx, 18, yy + 7, Math.max(6, (w - 36) * (v / 42)), 6, `rgba(${C.accentRgb},${alphas[i]})`);
  });
}

function tableClean(ctx, w, h) {
  base(ctx, w, h, C.bg, 12, C.line);
  const cols = [18, 200, 320];
  ['ACCOUNT', 'OWNER', 'STATUS'].forEach((s, i) => spaced(ctx, s, cols[i], 25, `600 9.5px ${SANS}`, C.dim, 0.9));
  spaced(ctx, 'VALUE', w - 52, 25, `600 9.5px ${SANS}`, C.dim, 0.9);
  ctx.fillStyle = C.line; ctx.fillRect(18, 34, w - 36, 1);
  const rows = [['Northwind Co.', 'J. Rivera', 'Active', '$182K'], ['Blue Harbor', 'A. Chen', 'In review', '$96K'], ['Summit Labs', 'M. Okafor', 'Active', '$74K']];
  rows.forEach((r, i) => {
    const yy = 56 + i * 24;
    txt(ctx, r[0], cols[0], yy, `500 12px ${SANS}`, C.text);
    txt(ctx, r[1], cols[1], yy, `400 12px ${SANS}`, C.muted);
    const active = r[2] === 'Active';
    ctx.font = `600 10.5px ${SANS}`;
    const pw = ctx.measureText(r[2]).width + 16;
    pill(ctx, cols[2], yy - 12.5, pw, 17, active ? C.upBg : C.warnBg);
    txt(ctx, r[2], cols[2] + 8, yy - 0.5, `600 10.5px ${SANS}`, active ? C.up : C.warn);
    txt(ctx, r[3], w - 18, yy, `600 12px ${SANS}`, C.text, 'right');
    if (i < rows.length - 1) { ctx.fillStyle = C.soft; ctx.fillRect(18, yy + 9, w - 36, 1); }
  });
}

function donutClean(ctx, w, h) {
  base(ctx, w, h, C.bg, 12, C.line);
  txt(ctx, 'Accounts by tier', 18, 27, `600 12.5px ${SANS}`, C.text);
  const segs = [[0.48, C.accent, 'Enterprise'], [0.34, C.accent2, 'Growth'], [0.18, C.neutral, 'Starter']];
  const cx = 56, cy = 72, r = 26;
  let a = -Math.PI / 2;
  ctx.lineWidth = 10; ctx.lineCap = 'butt';
  segs.forEach(([f, col]) => {
    ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r, a + 0.04, a + f * Math.PI * 2 - 0.04); ctx.stroke();
    a += f * Math.PI * 2;
  });
  segs.forEach(([f, col, name], i) => {
    const yy = 58 + i * 19;
    ctx.fillStyle = col; rrect(ctx, 106, yy - 8, 8, 8, 2); ctx.fill();
    txt(ctx, name, 122, yy, `400 11.5px ${SANS}`, C.muted);
    txt(ctx, `${Math.round(f * 100)}%`, w - 18, yy, `600 11.5px ${SANS}`, C.text, 'right');
  });
}

const blankClean = (key) => (ctx, w, h) => base(ctx, w, h, C[key], 12, C.line);

/* ── mess ── */

function navMess(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#1463e6'); g.addColorStop(1, '#19b8f2');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowOffsetY = 2;
  txt(ctx, 'DASHBOARD', 16, 35, `22px ${IMPACT}`, '#fff');
  ctx.restore();
  const pre = 'HOME  |  ', links = 'HOME  |  REPORTS  |  KPI\'s  |  DATA  |  MORE ▾';
  txt(ctx, links, 190, 31, `bold 12px ${ARIAL}`, '#fff');
  ctx.font = `bold 12px ${ARIAL}`;
  const ux = 190 + ctx.measureText(pre).width;
  ctx.fillStyle = '#ffe600'; ctx.fillRect(ux, 36, ctx.measureText('REPORTS').width, 3);
  txt(ctx, 'Welcome, Admin!', w - 16, 31, `italic 13px ${SERIF}`, '#dff3ff', 'right');
}

function sidenavMess(ctx, w, h) {
  ctx.fillStyle = '#f3f3f3'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = '#3d3d3d'; ctx.fillRect(0, 0, w, 34);
  txt(ctx, 'MENU', 12, 23, `bold 14px ${SERIF}`, '#fff');
  const items = ['Dashboard', 'Reports', 'Reports (old)', 'KPI Page', 'Data Export', 'Settings', 'Help??'];
  const dots = ['#e63946', '#2a9d8f', '#e9c46a', '#8338ec', '#fb5607', '#3a86ff', '#06d6a0'];
  items.forEach((s, i) => {
    const yy = 62 + i * 38;
    if (s === 'Reports (old)') { ctx.fillStyle = '#ffe066'; ctx.fillRect(4, yy - 18, w - 8, 28); }
    ctx.fillStyle = dots[i]; ctx.fillRect(10, yy - 10, 11, 11);
    txt(ctx, s, 28, yy, `12px ${VERDANA}`, '#333');
  });
}

function kpiRevMess(ctx, w, h) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#d4d4d4'; ctx.lineWidth = 2; rrect(ctx, 1, 1, w - 2, h - 2, 3); ctx.stroke();
  txt(ctx, 'Total Revenue (USD)', 14, 28, `15px ${SERIF}`, '#222');
  txt(ctx, '4.2M', 14, 76, `bold 42px ${SERIF}`, '#139a3d');
  txt(ctx, '*as of Q3?', 14, 97, `italic 10.5px ${SERIF}`, '#d22');
  ctx.fillStyle = '#139a3d'; ctx.beginPath(); ctx.moveTo(w - 40, 72); ctx.lineTo(w - 22, 44); ctx.lineTo(w - 4, 72); ctx.closePath(); ctx.fill();
}

function dupRevA(ctx, w, h) {
  ctx.fillStyle = '#07160d'; ctx.fillRect(0, 0, w, h);
  txt(ctx, '> SELECT revenue_total', 12, 24, `12px ${MONO}`, '#2fd46b');
  txt(ctx, '4,200,000.00', 12, 58, `bold 22px ${MONO}`, '#57ff8f');
  ctx.font = `bold 22px ${MONO}`;
  ctx.fillStyle = '#57ff8f'; ctx.fillRect(16 + ctx.measureText('4,200,000.00').width, 40, 11, 22);
  txt(ctx, '1 row (0.42s)', 12, 80, `10px ${MONO}`, '#2a7a47');
}

function dupRevB(ctx, w, h) {
  ctx.fillStyle = '#e5383b'; ctx.fillRect(0, 0, w, h);
  txt(ctx, 'Rev. $4.20M ↑', w / 2, 38, `bold 17px ${ARIAL}`, '#fff', 'center');
}

function kpiOrdersMess(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#7b2ff7'); g.addColorStop(1, '#f107a3');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  txt(ctx, 'ORDERS!!', 18, 32, `17px ${IMPACT}`, '#fff');
  ctx.save(); ctx.shadowColor = '#3a0a6b'; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
  txt(ctx, '18.2K', 18, 86, `46px ${IMPACT}`, '#fff');
  ctx.restore();
  txt(ctx, '★', w - 22, 38, `24px ${ARIAL}`, '#ffe600', 'right');
}

function kpiOntimeMess(ctx, w, h) {
  ctx.fillStyle = '#ffd60a'; ctx.fillRect(0, 0, w, h);
  txt(ctx, 'On Time %', 14, 30, `bold 15px ${COMIC}`, '#d62839');
  txt(ctx, '0.941', 14, 76, `bold 38px ${COMIC}`, '#d62839');
  txt(ctx, 'GOOD!!', w - 14, 98, `bold 11px ${ARIAL}`, '#1b8a2e', 'right');
}

const SERIES = [
  ['#ff0000', [3, 7, 2, 9, 4, 8, 3, 10, 6, 2, 9, 5]],
  ['#0033ff', [8, 2, 9, 3, 7, 1, 8, 4, 9, 6, 1, 7]],
  ['#00a800', [1, 5, 6, 2, 9, 7, 5, 3, 2, 8, 6, 10]],
  ['#ff9900', [6, 9, 4, 6, 2, 5, 10, 7, 1, 4, 8, 3]],
];
function lineMess(ctx, w, h) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#8d8d8d'; ctx.lineWidth = 2; rrect(ctx, 1, 1, w - 2, h - 2, 5); ctx.stroke();
  txt(ctx, 'Chart 1', w / 2, 22, `bold 15px ${SERIF}`, '#000', 'center');
  const L = 66, R = w - 116, T = 34, B = h - 26;
  ctx.strokeStyle = '#d3d3d3'; ctx.lineWidth = 1;
  for (let i = 0; i <= 11; i++) { const xx = L + (i / 11) * (R - L); ctx.beginPath(); ctx.moveTo(xx, T); ctx.lineTo(xx, B); ctx.stroke(); txt(ctx, String(i + 1), xx, B + 14, `10px ${ARIAL}`, '#444', 'center'); }
  for (let j = 0; j <= 5; j++) { const yy = T + (j / 5) * (B - T); ctx.beginPath(); ctx.moveTo(L, yy); ctx.lineTo(R, yy); ctx.stroke(); }
  ['3000000', '2000000', '1000000', '0'].forEach((s, j) => txt(ctx, s, L - 6, T + (j / 3) * (B - T) + 3, `9.5px ${ARIAL}`, '#444', 'right'));
  SERIES.forEach(([col, d]) => {
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineJoin = 'miter';
    ctx.beginPath();
    d.forEach((v, i) => { const xx = L + (i / 11) * (R - L), yy = B - (v / 10) * (B - T); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); });
    ctx.stroke();
  });
  ctx.fillStyle = '#fff'; ctx.fillRect(w - 106, 40, 94, 80);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(w - 106.5, 40.5, 94, 80);
  SERIES.forEach(([col], i) => { ctx.fillStyle = col; ctx.fillRect(w - 98, 50 + i * 18, 10, 10); txt(ctx, `Series${i + 1}`, w - 82, 59 + i * 18, `10.5px ${ARIAL}`, '#000'); });
}

function barsMess(ctx, w, h) {
  ctx.fillStyle = '#ececec'; ctx.fillRect(0, 0, w, h);
  txt(ctx, 'REGION DATA', w / 2, 22, `bold 13px ${ARIAL}`, '#222', 'center');
  const vals = [42, 24, 16, 11, 7, 3], cols = ['#ff1f1f', '#ff8c00', '#ffd400', '#1fbf3a', '#1f6fff', '#9b30ff'];
  const labels = ['NA', 'EU', 'ME', 'AP', 'OT', '??'];
  const L = 20, B = h - 24, T = 44, bw = 24, gap = (w - L * 2 - bw * 6) / 5;
  vals.forEach((v, i) => {
    const x = L + i * (bw + gap), hh = (v / 42) * (B - T), y = B - hh;
    ctx.fillStyle = cols[i]; ctx.fillRect(x, y, bw, hh);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.moveTo(x + bw, y); ctx.lineTo(x + bw + 6, y - 6); ctx.lineTo(x + bw + 6, B - 6); ctx.lineTo(x + bw, B); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 6); ctx.lineTo(x + bw + 6, y - 6); ctx.lineTo(x + bw, y); ctx.closePath(); ctx.fill();
    txt(ctx, String(v), x + bw / 2, y - 9, `bold 10px ${ARIAL}`, '#000', 'center');
    txt(ctx, labels[i], x + bw / 2, B + 14, `9.5px ${ARIAL}`, '#333', 'center');
  });
}

function tableMess(ctx, w, h) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  const xs = [0, 104, 190, 268, 350, 430, w];
  const head = ['ACCT', 'OWNER', 'STATUS', 'VALUE', 'NOTES', 'LAST UPD.'];
  ctx.fillStyle = '#217346'; ctx.fillRect(0, 0, w, 19);
  head.forEach((s, i) => txt(ctx, s, xs[i] + 5, 13.5, `bold 9.5px ${ARIAL}`, '#fff'));
  const rows = [
    ['Northwind Co.', 'jrivera', 'Active', '$182,000', 'call back!!', '3/4/24'],
    ['BLUE HARBOR', 'A. Chen', 'OVERDUE', '96K', '??', '04-03-2024'],
    ['Summit Labs', 'm.okafor', 'active', '74000.00', '', 'Mar 4'],
    ['Northwind Co', 'J Rivera', 'Active', '$182K', 'dup?', '3/4'],
    ['TOTAL', '', '', '352000', '', ''],
  ];
  rows.forEach((r, j) => {
    const y = 19 + j * 19;
    if (j === 3) { ctx.fillStyle = '#fff3a0'; ctx.fillRect(xs[4], y, xs[5] - xs[4], 19); }
    r.forEach((s, i) => {
      const bad = s === 'OVERDUE';
      txt(ctx, s, xs[i] + 5, y + 13.5, `${bad || j === 4 ? 'bold ' : ''}9.5px ${ARIAL}`, bad ? '#e00' : '#222');
    });
  });
  ctx.strokeStyle = '#c4c4c4'; ctx.lineWidth = 1;
  for (let j = 0; j <= 6; j++) { ctx.beginPath(); ctx.moveTo(0, 19 * j + 0.5); ctx.lineTo(w, 19 * j + 0.5); ctx.stroke(); }
  xs.slice(1, -1).forEach((x) => { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); });
}

function donutMess(ctx, w, h) {
  ctx.fillStyle = '#fafafa'; ctx.fillRect(0, 0, w, h);
  const vals = [22, 18, 17, 16, 15, 12], cols = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff924c'];
  const cx = 62, cy = 52, rx = 46, ry = 27, depth = 13;
  const tot = vals.reduce((a, b) => a + b, 0);
  const shade = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${((n >> 16) & 255) * 0.62 | 0},${((n >> 8) & 255) * 0.62 | 0},${(n & 255) * 0.62 | 0})`;
  };
  let a = -0.4;
  const slices = vals.map((v, i) => { const s = { a0: a, a1: a + (v / tot) * Math.PI * 2, col: cols[i], off: i === 0 ? 7 : 0 }; a = s.a1; return s; });
  // side walls first, then tops
  slices.forEach((s) => {
    const mid = (s.a0 + s.a1) / 2, ox = Math.cos(mid) * s.off, oy = Math.sin(mid) * s.off * 0.6;
    ctx.fillStyle = shade(s.col);
    ctx.beginPath(); ctx.ellipse(cx + ox, cy + oy + depth, rx, ry, 0, s.a0, s.a1); ctx.lineTo(cx + ox, cy + oy + depth); ctx.closePath(); ctx.fill();
  });
  slices.forEach((s) => {
    const mid = (s.a0 + s.a1) / 2, ox = Math.cos(mid) * s.off, oy = Math.sin(mid) * s.off * 0.6;
    ctx.fillStyle = s.col;
    ctx.beginPath(); ctx.moveTo(cx + ox, cy + oy); ctx.ellipse(cx + ox, cy + oy, rx, ry, 0, s.a0, s.a1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
  });
  cols.forEach((col, i) => {
    ctx.fillStyle = col; ctx.fillRect(132, 16 + i * 15.5, 9, 9);
    txt(ctx, `Series${i + 1}`, 146, 24.5 + i * 15.5, `9.5px ${ARIAL}`, '#333');
  });
}

function xlsxMess(ctx, w, h) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1d6f42'; rrect(ctx, 12, 12, 32, 32, 5); ctx.fill();
  txt(ctx, 'X', 28, 35, `bold 18px ${ARIAL}`, '#fff', 'center');
  txt(ctx, 'final_final_v3 (2).xlsx', 54, 26, `600 12.5px ${SANS}`, '#1f1f1f');
  txt(ctx, '24.8 MB · edited by 6 people', 54, 43, `400 10.5px ${SANS}`, '#7a7a7a');
}

const MESS = {
  nav: navMess, sidenav: sidenavMess, 'kpi-rev': kpiRevMess, 'dup-rev-a': dupRevA, 'dup-rev-b': dupRevB,
  'kpi-orders': kpiOrdersMess, 'kpi-ontime': kpiOntimeMess, 'chart-line': lineMess, 'chart-bars': barsMess,
  table: tableMess, donut: donutMess, xlsx: xlsxMess,
};
const CLEAN = {
  nav: navClean, sidenav: blankClean('nav'), 'kpi-rev': kpiRevClean, 'dup-rev-a': kpiRevClean, 'dup-rev-b': kpiRevClean,
  'kpi-orders': kpiOrdersClean, 'kpi-ontime': kpiOntimeClean, 'chart-line': lineClean, 'chart-bars': barsClean,
  table: tableClean, donut: donutClean, xlsx: blankClean('bg'),
};

export function paintCard(id, variant, ctx, w, h, theme = 'dark') {
  C = theme === 'light' ? C_LIGHT : C_DARK;
  (variant === 'clean' ? CLEAN : MESS)[id](ctx, w, h);
}
