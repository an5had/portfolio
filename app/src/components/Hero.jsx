/* Scrollytelling hero.
   A tall scroll track pins a full-screen stage. Scroll progress (0→1) scrubs a
   Three.js-rendered image sequence, snaps when the "I'm Anshad" sticky is fully
   revealed, reveals a circular text ring around it, then scrubs the rest of the
   clip and finally reveals the nav bar and the hero titles.
   Timeline lives in heroMap.js so scene and overlays stay in lockstep. */
import { useEffect, useRef, useState } from 'react';
import HeroSequenceScene from './hero/HeroSequenceScene.jsx';
import HeroProps from './hero/HeroProps.jsx';
import HeroCar from './hero/HeroCar.jsx';
import RingText from './hero/RingText.jsx';
import useFrameSequence from './hero/useFrameSequence.js';
import { HERO, clamp, remap, coverPoint, coverRect } from './hero/heroMap.js';

export default function Hero() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const ringRef = useRef(null);
  const ringWrapRef = useRef(null);
  const titlesRef = useRef(null);
  const propsRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);
  const loaderRef = useRef(null);
  const progressRef = useRef(0);

  const { imagesRef, progress, ready } = useFrameSequence();

  /* Portrait phones/tablets crop the frame hard (cover-fit), so the iPad's screen
     runs off the edges and the props sit outside the viewport entirely. When the
     screen rect can't fit, fall back: detach the copy into a readable panel and
     drop the props/car rather than leaving them off-screen. Driven by real
     geometry, not a width breakpoint, so a narrow desktop window works too. */
  const [compact, setCompact] = useState(false);
  const [showProps, setShowProps] = useState(true);
  const compactRef = useRef(false);
  useEffect(() => {
    const check = () => {
      const sw = window.innerWidth, sh = window.innerHeight;
      const r = coverRect(HERO.screen, sw, sh);
      const fits = r.x >= 4 && r.x + r.w <= sw - 4 && r.w >= 380;
      compactRef.current = !fits;
      setCompact(!fits);

      // The props and the car live out at roughly x 0.17–0.87 of the frame.
      // Portrait crops the sides away, so only mount them when that span is
      // genuinely on screen — otherwise they'd load and animate out of view.
      const scale = Math.max(sw / HERO.videoW, sh / HERO.videoH);
      const dw = HERO.videoW * scale;
      const offX = (sw - dw) / 2;
      setShowProps(-offX / dw <= 0.17 && (sw - offX) / dw >= 0.87);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(document.documentElement);
    window.addEventListener('resize', check);
    return () => { ro.disconnect(); window.removeEventListener('resize', check); };
  }, []);

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

      /* Exit — matched to zero.university, measured live off its sticky hero:
         the stage always has rounded corners but sits at scale(1.04) while
         pinned, pushing the corners just past the viewport so it reads
         full-bleed. The moment the sequence releases, scale falls LINEARLY from
         1.04 to a 0.5 floor over ~1.57 viewport-heights of scroll, about the
         centre — the card shrinks into its own middle as it travels up,
         revealing the corners and opening a gap before the next section.
         No opacity or clip change. rect.bottom === vh at release, so `past` is
         exactly 0 for the whole pinned sequence. */
      if (stageRef.current) {
        const vh = window.innerHeight, sw = window.innerWidth;
        const past = Math.max(0, vh - rect.bottom);
        const s = 1.04 - 0.54 * clamp(past / (vh * 1.574), 0, 1);
        const st = stageRef.current.style;
        st.transform = `scale(${s.toFixed(4)})`;
        st.borderRadius = `${Math.round(Math.min(32, Math.max(18, sw * 0.021)))}px`;
      }

      // circular text ring: reveal → hold → fade
      let ring = 0;
      if (p >= HERO.ringIn && p < HERO.ringFull) ring = remap(p, HERO.ringIn, HERO.ringFull, 0, 1);
      else if (p >= HERO.ringFull && p < HERO.ringOutStart) ring = 1;
      else if (p >= HERO.ringOutStart && p < HERO.ringOut) ring = remap(p, HERO.ringOutStart, HERO.ringOut, 1, 0);
      if (ringRef.current) {
        ringRef.current.style.opacity = ring.toFixed(3);
        ringRef.current.style.transform = `scale(${(0.78 + 0.22 * ring).toFixed(3)})`;
      }
      // keep the ring glued to the sticky's on-screen position (cover-fit aware),
      // and scale it with the frame so it encircles the sticky on every device
      if (ringWrapRef.current && ring > 0.001) {
        const sw = window.innerWidth, sh = window.innerHeight;
        const dw = HERO.videoW * Math.max(sw / HERO.videoW, sh / HERO.videoH);
        const pt = coverPoint(HERO.stickyVX, HERO.stickyVY, sw, sh);
        ringWrapRef.current.style.left = `${pt.x}px`;
        ringWrapRef.current.style.top = `${pt.y}px`;
        ringWrapRef.current.style.width = `${Math.min(0.28 * dw, 0.92 * sw)}px`;
      }

      // desk props settle in once the mat is established, then stay put
      if (propsRef.current) {
        const pr = remap(p, 0.10, 0.22, 0, 1);
        propsRef.current.style.opacity = pr.toFixed(3);
        propsRef.current.style.pointerEvents = pr > 0.6 ? 'auto' : 'none';
      }

      // nav + titles reveal at the end
      const rev = remap(p, HERO.revealStart, HERO.revealEnd, 0, 1);
      // gentle on desktop (the copy has its own panel); stronger when detached,
      // because then the copy sits directly over the footage
      if (scrimRef.current) {
        scrimRef.current.style.opacity = (rev * (compactRef.current ? 0.8 : 0.38)).toFixed(3);
      }

      if (titlesRef.current) {
        const el = titlesRef.current;
        const s = el.style;
        const sw = window.innerWidth, sh = window.innerHeight;
        if (compactRef.current) {
          // detached: let CSS lay it out as a readable bottom panel
          el.classList.add('is-detached');
          s.left = ''; s.top = ''; s.width = ''; s.height = ''; s.borderRadius = '';
        } else {
          // locked onto the iPad's screen, from the 4 measured corners
          el.classList.remove('is-detached');
          const r = coverRect(HERO.screen, sw, sh);
          s.left = `${r.x}px`;
          s.top = `${r.y}px`;
          s.width = `${r.w}px`;
          s.height = `${r.h}px`;
          s.borderRadius = `${r.radius}px`;
          s.setProperty('--sw', `${r.w}px`);   // type scales with the screen
        }
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
      <div className="hero-stage" ref={stageRef}>
        <HeroSequenceScene imagesRef={imagesRef} progressRef={progressRef} />
        <div className="hero-vignette" ref={scrimRef} />

        {/* draggable LEGO props sitting on the desk */}
        {/* props + car only where the frame is wide enough to actually show them */}
        {showProps && (
          <div className="hero-props" ref={propsRef}>
            <HeroProps />
            <HeroCar progressRef={progressRef} />
          </div>
        )}

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
