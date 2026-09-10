/* Boot sequence — content-first. The document is ALREADY painted by the browser
   before any of this runs; JS only enhances. See references/architecture.md. */
import { initScroll } from './scroll/scroll';
import { initMarks } from './scroll/marks';
import { startPreload, manifest } from './loader/preloader';
import { runLoader } from './loader/orchestrator';
import { initSound } from './sound/sound';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

async function boot() {
  // 1. Scroll first — the reader can move immediately, even mid-load.
  const scroll = initScroll({ reduced });

  // 2. Phased preloader drives the loader's real % progress.
  const preload = startPreload(manifest);

  // 3. Play the designed intro once CRITICAL assets are in, then hand off.
  await preload.critical;
  await runLoader({ reduced });
  scroll.start();
  initMarks();                         // draw the hand-annotation marks on reveal

  // 4. Spectacle LAST, lazily, and guarded — a failure here must not break the page.
  try {
    const { initScene } = await import('./scene/stage');
    const scene = await initScene();
    await scene.enablePhysics();       // dynamically imports Rapier WASM (~2.8MB)
    if (!reduced) scene.startIdle();
  } catch (err) {
    console.warn('[spectacle] unavailable — document intact', err);
  }

  // 5. Sound: created muted; only resumes on the user's gesture (browser rule).
  const sound = initSound();
  document.getElementById('sound-toggle')?.addEventListener('click', (e) => {
    sound.toggle();
    (e.currentTarget as HTMLButtonElement).setAttribute('aria-pressed', String(sound.on));
  });
}

boot();
