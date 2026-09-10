/* Scrollytelling hero.
   A tall scroll track pins a full-screen stage. Scroll progress (0→1) scrubs a
   Three.js-rendered image sequence, snaps when the "I'm Anshad" sticky is fully
   revealed, reveals a circular text ring around it, then scrubs the rest of the
   clip and finally reveals the nav bar and the hero titles.
   Timeline lives in heroMap.js so scene and overlays stay in lockstep. */
import { useEffect, useRef } from 'react';
import HeroSequenceScene from './hero/HeroSequenceScene.jsx';
import HeroProps from './hero/HeroProps.jsx';
import HeroCar from './hero/HeroCar.jsx';
import RingText from './hero/RingText.jsx';
import useFrameSequence from './hero/useFrameSequence.js';
import { HERO, clamp, remap, coverPoint, coverRect } from './hero/heroMap.js';

export default function Hero() {
  const sectionRef = useRef(null);
  const ringRef = useRef(null);
  const ringWrapRef = useRef(null);
  const titlesRef = useRef(null);
  const propsRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);
  const loaderRef = useRef(null);
  const progressRef = useRef(0);

  const { imagesRef, progress, ready } = useFrameSequence();

  useEffect(() => {
    const section = sectionRef.current;
    const root = document.documentElement;
    let raf = 0;
    let snap = null;

    const frame = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight || 1;
      const p = clamp(-rect.top / scrollable, 0, 1);
      progressRef.current = p;

      // circular text ring: reveal → hold → fade
      let ring = 0;
      if (p >= HERO.ringIn && p < HERO.ringFull) ring = remap(p, HERO.ringIn, HERO.ringFull, 0, 1);
      else if (p >= HERO.ringFull && p < HERO.ringOutStart) ring = 1;
      else if (p >= HERO.ringOutStart && p < HERO.ringOut) ring = remap(p, HERO.ringOutStart, HERO.ringOut, 1, 0);
      if (ringRef.current) {
        ringRef.current.style.opacity = ring.toFixed(3);
        ringRef.current.style.transform = `scale(${(0.78 + 0.22 * ring).toFixed(3)})`;
      }
      // keep the ring glued to the sticky's on-screen position (cover-fit aware)
      if (ringWrapRef.current && ring > 0.001) {
        const pt = coverPoint(HERO.stickyVX, HERO.stickyVY, window.innerWidth, window.innerHeight);
        ringWrapRef.current.style.left = `${pt.x}px`;
        ringWrapRef.current.style.top = `${pt.y}px`;
      }

      // desk props settle in once the mat is established, then stay put
      if (propsRef.current) {
        const pr = remap(p, 0.10, 0.22, 0, 1);
        propsRef.current.style.opacity = pr.toFixed(3);
        propsRef.current.style.pointerEvents = pr > 0.6 ? 'auto' : 'none';
      }

      // nav + titles reveal at the end
      const rev = remap(p, HERO.revealStart, HERO.revealEnd, 0, 1);
      // gentle only — the copy has its own panel now, so don't crush the footage
      if (scrimRef.current) scrimRef.current.style.opacity = (rev * 0.38).toFixed(3);
      // Lock the copy panel onto the iPad's screen. Driven by the 4 measured
      // corners, so size, position and radius all follow from the cover-fit map.
      if (titlesRef.current) {
        const r = coverRect(HERO.screen, window.innerWidth, window.innerHeight);
        const s = titlesRef.current.style;
        s.left = `${r.x}px`;
        s.top = `${r.y}px`;
        s.width = `${r.w}px`;
        s.height = `${r.h}px`;
        s.borderRadius = `${r.radius}px`;
        s.setProperty('--sw', `${r.w}px`);   // type scales with the screen
        s.opacity = rev.toFixed(3);
        s.pointerEvents = rev > 0.5 ? 'auto' : 'none';
      }
      root.dataset.hero = p >= HERO.revealStart ? 'revealed' : 'lock';

      if (hintRef.current) hintRef.current.style.opacity = (p < 0.04 ? 1 : 0).toFixed(2);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // lenis-snap: snap when "I'm Anshad" is fully revealed. window.__lenis is set
    // by the app's smooth-scroll hook (a parent effect), so wait for it.
    let tries = 0;
    const setupSnap = async () => {
      const lenis = window.__lenis;
      if (!lenis) { if (tries++ < 40) setTimeout(setupSnap, 50); return; }
      const { default: Snap } = await import('lenis/snap');
      snap = new Snap(lenis, { type: 'proximity', velocityThreshold: 0.6, duration: 0.9 });
      const scrollable = section.offsetHeight - window.innerHeight;
      snap.add(Math.round(section.offsetTop + HERO.snapAt * scrollable));
    };
    setupSnap();

    return () => {
      cancelAnimationFrame(raf);
      if (snap) snap.destroy();
      delete root.dataset.hero;
    };
  }, []);

  // fade the loader out once every frame is in
  useEffect(() => {
    if (ready && loaderRef.current) loaderRef.current.classList.add('is-done');
  }, [ready]);

  return (
    <section className="hero-scroll" id="top" ref={sectionRef} style={{ height: `${HERO.trackVh}vh` }}>
      <div className="hero-stage">
        <HeroSequenceScene imagesRef={imagesRef} progressRef={progressRef} />
        <div className="hero-vignette" ref={scrimRef} />

        {/* draggable LEGO props sitting on the desk */}
        <div className="hero-props" ref={propsRef}>
          <HeroProps />
          <HeroCar progressRef={progressRef} />
        </div>

        {/* circular text ring, centred over the "I'm Anshad" sticky */}
        <div className="hero-ring-wrap" ref={ringWrapRef} style={{ left: '51%', top: '62%' }}>
          <RingText ref={ringRef} />
        </div>

        {/* scroll hint (start only) */}
        <div className="hero-hint" ref={hintRef} aria-hidden="true"><span>Scroll</span><i /></div>

        {/* the frozen frame's iPad screen becomes the panel the end copy lives in */}
        <div className="hero-screen" ref={titlesRef}>
          <div className="hero-screen-inner">
            <p className="hero-kicker">Senior UX &amp; Product Designer</p>
            <h1 className="hero-title">
              <span className="line">I bring messy</span>
              <span className="line">problems <em className="accent">into focus.</em></span>
            </h1>
            <p className="hero-sub">
              5+ years of it, across enterprise dashboards, web and mobile apps and AI-powered
              products. Currently at <strong>Exult Global</strong>, making complex tools feel obvious.
            </p>
          </div>
        </div>

        {/* real-progress loader over the sequence preload */}
        <div className="hero-loader" ref={loaderRef}>
          <span className="hero-loader-mark">an5had</span>
          <span className="hero-loader-pct">{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
