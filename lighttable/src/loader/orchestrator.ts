/* The intro as a designed GSAP timeline: the light table warming up. Authored in
   comp space so it scales as one unit; it reverses out the way it came in.
   Robustness: a setTimeout failsafe guarantees the loader ALWAYS hands off, even
   if requestAnimationFrame (and thus GSAP's ticker) is throttled because the tab
   loaded hidden. The document must never be trapped behind the loader.
   See references/loader.md */
import { gsap } from 'gsap';

let finished = false;
function finish() {
  if (finished) return;
  finished = true;
  const loader = document.getElementById('loader');
  if (loader) loader.hidden = true;
  document.documentElement.dataset.loaded = 'true';
}

export function runLoader({ reduced }: { reduced: boolean }): Promise<void> {
  return new Promise((resolve) => {
    const done = () => { finish(); resolve(); };

    // Failsafe: hand off no matter what within this window (timers fire even when
    // rAF is paused in a hidden tab). Tune the visible duration below to match.
    const failsafe = setTimeout(done, reduced ? 250 : 2600);

    if (reduced) {
      gsap.set('#loader', { opacity: 0 });
      clearTimeout(failsafe); done();
      return;
    }

    const tl = gsap.timeline({ onComplete: () => { clearTimeout(failsafe); done(); } });
    tl.addLabel('in')
      .from('#comp', { opacity: 0, duration: 0.3 })
      .from('#word', { opacity: 0, y: 14, duration: 0.5, ease: 'power2.out' }, '-=0.05')
      // stickers (if any) fly in from off-frame to their comp-space homes
      .from('#stickers > *', {
        x: () => (Math.random() - 0.5) * 1800,
        y: () => (Math.random() - 0.5) * 1200,
        rotate: () => (Math.random() - 0.5) * 90,
        opacity: 0, stagger: 0.04, ease: 'power3.out', duration: 0.6,
      }, '<')
      .addLabel('hold')
      .to('#word', { y: '-110%', opacity: 0, ease: 'power2.in', duration: 0.4 }, '+=0.3')
      .to('#loader', { opacity: 0, duration: 0.3 }, '<');
  });
}
