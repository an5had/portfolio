/* Scrollytelling hero.
   A tall scroll track pins a full-screen stage. Scroll progress (0→1) scrubs a
   Three.js-rendered image sequence, snaps when the "I'm Anshad" sticky is fully
   revealed, reveals a circular text ring around it, then scrubs the rest of the
   clip and finally reveals the nav bar and the hero titles.
   Timeline lives in heroMap.js so scene and overlays stay in lockstep. */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import HeroSequenceScene from './hero/HeroSequenceScene.jsx';
import HeroProps from './hero/HeroProps.jsx';
import HeroCar from './hero/HeroCar.jsx';
import RingText from './hero/RingText.jsx';
import useTieredSequence from './hero/useTieredSequence.js';
import StickyNotes from './hero/StickyNotes.jsx';
import { HERO, clamp, remap, coverPoint, coverRect, frameForProgress, stageSize } from './hero/heroMap.js';

/* Where the end copy goes: the tablet's switched-off display on the last frame. Portrait phones
   crop the display's sides (cover-fit), so use the slice that's actually on screen, inset from
   the viewport edges. Returns null when that slice is too small to hold the copy — the copy then
   detaches into a readable panel instead. */
function screenBox(sw, sh) {
  const r = coverRect(HERO.screen, sw, sh);
  const pad = Math.max(14, sw * 0.04);
  const x0 = Math.max(r.x, pad), x1 = Math.min(r.x + r.w, sw - pad);
  const w = x1 - x0;
  if (w < 300 || r.h < 230) return null;
  return { x: x0, y: r.y, w, h: r.h, radius: w < r.w ? 0 : r.radius };
}

export default function Hero() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const ringRef = useRef(null);
  const ringWrapRef = useRef(null);
  const titlesRef = useRef(null);
  const propsRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);
  const pillFillRef = useRef(null);
  const loaderRef = useRef(null);
  const progressRef = useRef(0);

  const frameRef = useRef(0);       // frame on screen: drives hi-res load priority + sticky ink
  const notesRef = useRef(null);
  const { lowRef, highRef, progress, ready } = useTieredSequence(frameRef);

  /* Portrait phones/tablets crop the frame hard (cover-fit), so the iPad's screen
     runs off the edges and the props sit outside the viewport entirely. The copy
     uses whatever slice of the display is visible (screenBox); only when that's
     too small does it detach into a panel. Props/car are dropped rather than left
     off-screen. Driven by real geometry, not a width breakpoint. */
  const [showProps, setShowProps] = useState(true);
  const compactRef = useRef(false);

  // stop rendering the sequence once the hero has scrolled out of view
  const [live, setLive] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: '10% 0px' });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const check = () => {
      const { sw, sh } = stageSize();
      compactRef.current = !screenBox(sw, sh);

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
      // pin length = track height minus the STAGE's height (100lvh), not window.innerHeight:
      // on iOS they differ by the toolbar, which would put the release point off by that much
      const scrollable = section.offsetHeight - stageSize().sh || 1;
      const p = clamp(-rect.top / scrollable, 0, 1);
      progressRef.current = p;

      // the frame the scene is showing — the hi-res loader streams outward from it, and the
      // handwriting is posed from the same frame so ink and paper never drift apart
      // (named frameIdx, not `frame`: that would shadow this rAF callback and kill the loop)
      const frameIdx = frameForProgress(p);
      frameRef.current = frameIdx;
      notesRef.current?.update(frameIdx);

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
        // stage height, not window height: the sticky stage releases when the section's bottom
        // reaches the stage's own bottom (100lvh), which on iOS is below window.innerHeight
        const { sw, sh: vh } = stageSize();
        const past = Math.max(0, vh - rect.bottom);
        const s = 1.04 - 0.54 * clamp(past / (vh * 1.574), 0, 1);
        const st = stageRef.current.style;
        const R = Math.round(Math.min(32, Math.max(18, sw * 0.021)));
        st.transform = `scale(${s.toFixed(4)})`;
        st.borderRadius = `${R}px`;
        st.clipPath = `inset(0 round ${R}px)`;   // iOS: border-radius alone won't clip the WebGL canvas
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
        const { sw, sh } = stageSize();
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
      // light touch when the copy is on the tablet (the dark display is its own backdrop);
      // stronger when detached, because then the copy sits directly over the footage
      if (scrimRef.current) {
        scrimRef.current.style.opacity = (rev * (compactRef.current ? 0.8 : 0.2)).toFixed(3);
      }

      if (titlesRef.current) {
        const el = titlesRef.current;
        const s = el.style;
        const { sw, sh } = stageSize();
        const r = screenBox(sw, sh);
        if (!r) {
          // detached: let CSS lay it out as a readable bottom panel
          el.classList.add('is-detached');
          s.left = ''; s.top = ''; s.width = ''; s.height = ''; s.borderRadius = '';
        } else {
          // written onto the tablet's switched-off display (the visible slice of it)
          el.classList.remove('is-detached');
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

      // scroll pill: fills with hero progress, then gets out of the way as the end copy arrives
      // (on mobile that copy panel sits at the bottom, right where the pill is)
      if (hintRef.current) {
        const out = remap(p, HERO.revealStart - 0.06, HERO.revealStart, 0, 1);
        hintRef.current.style.opacity = (1 - out).toFixed(3);
        if (pillFillRef.current) pillFillRef.current.style.transform = `scaleX(${clamp(p / HERO.revealStart, 0, 1).toFixed(3)})`;
      }

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
      const scrollable = section.offsetHeight - stageSize().sh;
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
        <HeroSequenceScene lowRef={lowRef} highRef={highRef} progressRef={progressRef} live={live} />
        {/* live Caveat handwriting on the (blank) sticky notes, tracked per frame */}
        <StickyNotes ref={notesRef} />
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

        {/* Scroll pill — portalled to <body> and position:fixed on purpose. Inside the stage it
            can't work: the stage has a transform (so "fixed" acts like "absolute") and is 100vh,
            which on iOS is the LARGE viewport, putting its bottom under Safari's toolbar. A
            body-level fixed element anchored to the bottom rides the dynamic viewport instead:
            above the toolbar at rest, sliding down as Safari collapses it on scroll. */}
        {createPortal(
          <div className="scroll-pill" ref={hintRef} aria-hidden="true">
            <svg className="scroll-pill-chevron" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="scroll-pill-label">Scroll</span>
            <span className="scroll-pill-track"><i ref={pillFillRef} /></span>
          </div>,
          document.body,
        )}

        {/* the frozen frame's iPad screen becomes the panel the end copy lives in */}
        <div className="hero-screen" ref={titlesRef}>
          <div className="hero-screen-inner">
            <p className="hero-kicker">Senior UX &amp; Product Designer</p>
            <h1 className="hero-title">
              <span className="line">I bring messy</span>
              <span className="line">problems into <em className="accent"><span className="swash">F</span>ocus.</em></span>
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
