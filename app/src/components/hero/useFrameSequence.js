/* Preloads the hero image sequence with bounded concurrency and real progress.
   Bounded concurrency matters: firing 151 requests at once starves the rest of
   the page and gives you a worse first paint, not a better one. */
import { useEffect, useRef, useState } from 'react';
import { FRAME_COUNT, frameSrc } from './heroMap.js';

const CONCURRENCY = 12;

export default function useFrameSequence() {
  const imagesRef = useRef([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const images = new Array(FRAME_COUNT);
    imagesRef.current = images;
    let loaded = 0;
    let next = 0;

    const loadOne = (i) => new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => {
        images[i] = img;
        loaded += 1;
        if (!cancelled) setProgress(loaded / FRAME_COUNT);
        resolve();
      };
      img.src = frameSrc(i);
    });

    const worker = async () => {
      while (!cancelled && next < FRAME_COUNT) {
        const i = next++;
        await loadOne(i);
      }
    };

    Promise.all(Array.from({ length: CONCURRENCY }, worker)).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => { cancelled = true; };
  }, []);

  return { imagesRef, progress, ready };
}
