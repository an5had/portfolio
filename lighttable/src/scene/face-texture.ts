/* The hanging object is a mounted 35mm SLIDE. Its face is drawn at runtime to a 2D
   canvas and used as a Three texture, so the mount's rebate can show live data — a
   frame counter and the viewer's location — like a slide labelled by hand.
   Call face.setFrame(n) / face.setMeta(...) as data arrives. */
import * as THREE from 'three';

export interface FaceTexture extends THREE.CanvasTexture {
  setFrame(n: number): void;
  setMeta(city: string, date: string): void;
}

export function makeFaceTexture(): FaceTexture {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1024;                  // ~square slide mount
  const ctx = c.getContext('2d')!;
  let frame = 42, city = '—', date = '';

  function draw() {
    const W = c.width, H = c.height;
    // black slide mount
    ctx.fillStyle = '#101317'; ctx.fillRect(0, 0, W, H);

    // the transparency window (36:24 landscape aperture)
    const winW = W * 0.78, winH = winW * (24 / 36);
    const x = (W - winW) / 2, y = (H - winH) / 2 - 30;
    // backlit image area — warm gradient standing in for a photo
    const g = ctx.createLinearGradient(x, y, x + winW, y + winH);
    g.addColorStop(0, '#e8842b'); g.addColorStop(1, '#e8492b');
    ctx.fillStyle = g; ctx.fillRect(x, y, winW, winH);
    // subtle frame lines
    ctx.strokeStyle = '#00000030'; ctx.lineWidth = 2; ctx.strokeRect(x, y, winW, winH);

    // rebate label (mono) — brand + frame number + location
    ctx.fillStyle = '#f3efe4';
    ctx.font = "600 60px ui-monospace, monospace";
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('an5had', 70, 120);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#f4c518';                       // chinagraph yellow
    ctx.font = "700 84px ui-monospace, monospace";
    ctx.fillText('▶ ' + String(frame).padStart(4, '0'), W - 70, 120);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#9aa0a8';
    ctx.font = "40px ui-monospace, monospace";
    ctx.fillText(date, 70, H - 60);
    ctx.textAlign = 'right';
    ctx.fillText(city, W - 70, H - 60);
    ctx.textAlign = 'left';

    tex.needsUpdate = true;
  }

  const tex = new THREE.CanvasTexture(c) as FaceTexture;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.setFrame = (n) => { frame = n; draw(); };
  tex.setMeta = (ci, d) => { city = ci; date = d; draw(); };
  draw();
  return tex;
}
