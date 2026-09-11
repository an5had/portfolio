/* Progressive, prioritised loader for the hero sequence.
   Pass 1 — every frame at the `lq` preview tier (640px): the hero becomes interactive almost at
            once, and the loader's % tracks this pass only.
   Pass 2 — the display-matched tier, fetched NEAREST-TO-THE-VISIBLE-FRAME first and re-prioritised
            as the visitor scrolls, then pre-decoded off the main thread (img.decode) before it is
            handed to the texture — so a 4K upgrade arriving mid-scrub never stalls a frame.
   The texture always draws the best version of a frame it has (high → preview). */
import { useEffect, useRef, useState } from 'react';
import { FRAME_COUNT } from './heroMap.js';
import { PREVIEW_TIER, pickTier, frameUrl } from './frameTiers.js';

const PREVIEW_CONCURRENCY = 12;
const HIGH_CONCURRENCY = 6;

export default function useTieredSequence(currentFrameRef) {
  const lowRef = useRef([]);
  const highRef = useRef([]);
  const tierRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tier = pickTier();
    tierRef.current = tier;
    const low = new Array(FRAME_COUNT);
    const high = new Array(FRAME_COUNT);
    lowRef.current = low;
    highRef.current = high;

    const load = (url) => new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });

    // pass 1: preview tier, in order
    let next = 0, loaded = 0;
    const previewWorker = async () => {
      while (!cancelled && next < FRAME_COUNT) {
        const i = next++;
        low[i] = await load(frameUrl(PREVIEW_TIER, i));
        loaded += 1;
        if (!cancelled) setProgress(loaded / FRAME_COUNT);
      }
    };

    // pass 2: display tier, spiralling outward from wherever the visitor currently is
    const taken = new Uint8Array(FRAME_COUNT);
    const nextHigh = () => {
      const c = Math.max(0, Math.min(FRAME_COUNT - 1, currentFrameRef.current | 0));
      for (let d = 0; d < FRAME_COUNT; d++) {
        const a = c + d, b = c - d;
        if (a < FRAME_COUNT && !taken[a]) { taken[a] = 1; return a; }
        if (b >= 0 && !taken[b]) { taken[b] = 1; return b; }
      }
      return -1;
    };
    const highWorker = async () => {
      for (let i = nextHigh(); !cancelled && i !== -1; i = nextHigh()) {
        const img = await load(frameUrl(tier, i));
        if (!img) continue;
        try { await img.decode(); } catch { /* still usable; the upload will decode */ }
        if (!cancelled) high[i] = img;
      }
    };

    (async () => {
      await Promise.all(Array.from({ length: PREVIEW_CONCURRENCY }, previewWorker));
      if (cancelled) return;
      setReady(true);
      await Promise.all(Array.from({ length: HIGH_CONCURRENCY }, highWorker));
    })();

    return () => { cancelled = true; };
  }, [currentFrameRef]);

  return { lowRef, highRef, tierRef, progress, ready };
}
