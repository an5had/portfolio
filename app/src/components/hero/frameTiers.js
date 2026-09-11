/* Resolution tiers for the hero image sequence (AVIF stills, 24fps).
   Encoded from lossless 4K masters at crf 24 (≈ SSIM 0.991–0.992, visually identical to source at
   ~42% of equivalent WebP). A visitor downloads the tiny `lq` pass first, then ONE tier: the
   smallest that covers the hero's real physical pixel width — the sharpest frames their display
   can actually show, never more. */
import { HERO, stageSize } from './heroMap.js';

export const PREVIEW_TIER = 'lq';            // 640px, instant-interactive pass
export const TIERS = [
  { id: 'hd', w: 1280 },
  { id: 'fhd', w: 1920 },
  { id: 'qhd', w: 2560 },
  { id: 'uhd', w: 3840 },
];

export function pickTier() {
  if (typeof window === 'undefined') return 'fhd';
  const { sw, sh } = stageSize();
  // cover-fit width of the frame in CSS px, × the pinned stage scale (1.04), × device pixels
  const dw = HERO.videoW * Math.max(sw / HERO.videoW, sh / HERO.videoH);
  let need = dw * 1.04 * (window.devicePixelRatio || 1);

  const conn = navigator.connection;
  if (conn && (conn.saveData || ['slow-2g', '2g', '3g'].includes(conn.effectiveType))) need = Math.min(need, 1280);
  // Portrait phones magnify a cropped slice of the frame, so "need" can exceed 4K on a phone.
  // Cap touch devices so nobody pulls 4K over cellular for a few inches of screen.
  if (window.matchMedia('(pointer: coarse)').matches) need = Math.min(need, 2560);

  return (TIERS.find((t) => t.w >= need * 0.92) || TIERS[TIERS.length - 1]).id;
}

export const frameUrl = (tier, i) => `/frames/${tier}/f_${String(i + 1).padStart(4, '0')}.avif`;
