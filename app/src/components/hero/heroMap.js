/* Shared scroll→time→phase mapping for the scrollytelling hero.
   One source of truth so the Three scene and the DOM overlays stay in lockstep. */

export const HERO = {
  trackVh: 460,          // total scroll track height (vh). scrollable = trackVh - 100.
  D: 10.04,              // video duration (seconds)
  Tr: 2.4,               // frame 36 — "I'm Anshad" settled, crisp and readable
  videoW: 1920, videoH: 1080,

  // progress (0..1) breakpoints for the video timeline
  introEnd: 0.30,        // p:0→introEnd  scrubs video 0 → Tr
  holdEnd: 0.42,         // p:introEnd→holdEnd  holds on Tr (ring reveal happens here)
  playEnd: 0.82,         // p:holdEnd→playEnd  scrubs Tr → end
  //                        p:playEnd→1  holds on the end frame (titles + nav reveal)

  // circular-text ring reveal band
  ringIn: 0.22, ringFull: 0.34, ringOutStart: 0.46, ringOut: 0.55,

  // nav bar + hero titles reveal band
  revealStart: 0.84, revealEnd: 0.98,

  // the "I'm Anshad" sticky centre, as fractions of the RAW video frame (frame 36)
  stickyVX: 0.50, stickyVY: 0.52,

  /* The iPad's screen in the final (frozen) frame, in raw video-frame fractions.
     Measured off frame 148; radius is a fraction of the video width. The end
     titles are rendered inside this rect so they sit on the tablet's display. */
  screen: { l: 0.2985, t: 0.2985, r: 0.6885, b: 0.7515, radius: 0.0141 },

  // the explicit snap point the brief asks for (I'm Anshad fully revealed)
  snapAt: 0.34,
};

/* Map a point given in normalized video-frame coords (0..1) to on-screen pixels,
   accounting for object-fit: cover. Keeps the ring glued to the sticky on any
   viewport aspect. */
/* Same cover-fit mapping for a rect given in video-frame fractions. Returns px
   plus a scaled corner radius, so an overlay lands exactly on the iPad screen. */
export function coverRect(rect, sw, sh) {
  const scale = Math.max(sw / HERO.videoW, sh / HERO.videoH);
  const dw = HERO.videoW * scale, dh = HERO.videoH * scale;
  const offX = (sw - dw) / 2, offY = (sh - dh) / 2;
  return {
    x: offX + rect.l * dw,
    y: offY + rect.t * dh,
    w: (rect.r - rect.l) * dw,
    h: (rect.b - rect.t) * dh,
    radius: rect.radius * dw,
  };
}

export function coverPoint(vx, vy, sw, sh) {
  const scale = Math.max(sw / HERO.videoW, sh / HERO.videoH);
  const dw = HERO.videoW * scale, dh = HERO.videoH * scale;
  const offX = (sw - dw) / 2, offY = (sh - dh) / 2;
  return { x: offX + vx * dw, y: offY + vy * dh };
}

/* The clip is shipped as an image sequence (not a video) for frame-exact scrub
   control: no decoding, no dropped seeks, no keyframe roulette. 151 WebP frames
   at 15fps. Two variants: full 1920×1080 (~80KB/frame, 12MB) and a 1280×720 set
   for narrow screens (~51KB/frame, 7.5MB). Only one set is ever fetched. */
export const FPS = 15;
/* Ends at frame 148 (9.87s) — the moment the Apple Pencil is set back down and
   still sharp. Frames 149–150 are motion-blurred as the hand leaves, so they are
   cut from the sequence entirely rather than just skipped. */
export const FRAME_COUNT = 149;
export const FRAME_VARIANT =
  typeof window !== 'undefined' && window.innerWidth <= 900 ? 'sm' : 'fhd';
export const frameSrc = (i) =>
  `/frames/${FRAME_VARIANT}/f_${String(i + 1).padStart(4, '0')}.webp`;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// linear remap of v in [inA,inB] → [outA,outB], clamped
export const remap = (v, inA, inB, outA, outB) =>
  outA + (clamp(v, inA, inB) - inA) / (inB - inA || 1) * (outB - outA);

export function videoTimeForProgress(p) {
  const { introEnd: A, holdEnd: B, playEnd: C, Tr } = HERO;
  const end = (FRAME_COUNT - 1) / FPS;  // last sharp frame: pencil placed back down
  if (p <= A) return (p / A) * Tr;
  if (p <= B) return Tr;                 // hold — ring reveals here
  if (p <= C) return Tr + ((p - B) / (C - B)) * (end - Tr);
  return end;                            // hold on the end frame
}

/* Scroll progress → sequence frame index (0-based). */
export function frameForProgress(p) {
  return clamp(Math.round(videoTimeForProgress(p) * FPS), 0, FRAME_COUNT - 1);
}
