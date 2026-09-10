/* Phased, byte-accurate preloader. Tag each asset with a phase and a real size;
   the loader's % is progress against the CRITICAL set, not a timer.
   Generate this manifest at build time from files on disk. See references/loader.md */

export type Phase = 'critical' | 'deferred';
export interface Asset { url: string; kb: number; phase: Phase; sm?: { url: string; kb: number }; }

// Replace with your real assets (a prebuild script can stat files and emit this).
export const manifest: Asset[] = [
  // { url: '/media/hero.webp', kb: 180, phase: 'critical', sm: { url: '/media/_sm/hero.webp', kb: 44 } },
  // { url: '/media/bed.m4a',   kb: 900, phase: 'deferred' },
];

const narrow = () => matchMedia('(max-width: 767px)').matches || devicePixelRatio < 1.5;
const pickVariant = (a: Asset) => (a.sm && narrow() ? a.sm.url : a.url);

function setLoaderText(pct: number) {
  const el = document.getElementById('word');
  if (el) el.dataset.progress = String(Math.round(pct * 100));
  // Or drive a dedicated "loading NN%" element / the badge texture.
}

async function fetchAsset(url: string): Promise<void> {
  try { await fetch(url, { cache: 'force-cache' }); } catch { /* non-fatal */ }
}

export function startPreload(list: Asset[]) {
  const critical = list.filter(a => a.phase === 'critical');
  const totalKb = critical.reduce((n, a) => n + a.kb, 0) || 1;
  let doneKb = 0;

  const criticalDone = critical.length
    ? Promise.all(critical.map(a =>
        fetchAsset(pickVariant(a)).then(() => { doneKb += a.kb; setLoaderText(doneKb / totalKb); })))
    : Promise.resolve([]).then(() => setLoaderText(1));

  // Deferred assets stream in quietly after handoff — never block interaction.
  const idle = (cb: () => void) =>
    ('requestIdleCallback' in window ? requestIdleCallback(cb) : setTimeout(cb, 200));
  idle(() => list.filter(a => a.phase === 'deferred').forEach(a => fetchAsset(pickVariant(a))));

  return { critical: criticalDone.then(() => void 0) };
}
