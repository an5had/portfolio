import QRCode from 'qrcode';

/* ---------- ids + payload encoding ---------- */
export function genId() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 7);
  return (t + r).toUpperCase();
}

export function encodePayload(obj) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodePayload(str) {
  try {
    const b = str.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(b))));
  } catch (e) {
    return null;
  }
}

export function certUrl(payload) {
  return `${window.location.origin}/certificate?c=${encodePayload(payload)}`;
}

/* ---------- local "issued" registry (per browser) ---------- */
export const issuedKey = (i) => `coa-photo-${i}`;
export function getIssued(i) {
  try { return JSON.parse(localStorage.getItem(issuedKey(i))); } catch (e) { return null; }
}
export function setIssued(i, rec) {
  try { localStorage.setItem(issuedKey(i), JSON.stringify(rec)); } catch (e) {}
}

/* ---------- helpers ---------- */
function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

export async function makeQR(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 400, color: { dark: '#15171c', light: '#fbfbf9' } });
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- compose the white-mat print ---------- */
export async function composePrint(photoSrc, { qrDataUrl, certId = 'PREVIEW', email = '', date = '' } = {}) {
  const img = await loadImage(photoSrc);
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }

  const W = 2400, H = 1640;
  const padX = 150, padTop = 150, padBottom = 420;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const r = Math.min(innerW / img.naturalWidth, innerH / img.naturalHeight);
  const dw = img.naturalWidth * r, dh = img.naturalHeight * r;
  const dx = padX + (innerW - dw) / 2, dy = padTop + (innerH - dh) / 2;

  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#fbfbf9';
  ctx.fillRect(0, 0, W, H);

  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.strokeStyle = 'rgba(0,0,0,0.10)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(dx + 0.75, dy + 0.75, dw - 1.5, dh - 1.5);

  // watermark: an5had only, inside the photo (bottom-right)
  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.font = '600 32px Inter, system-ui, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('an5had', dx + dw - 28, dy + dh - 24);
  ctx.restore();

  // bottom band
  const bandTop = H - padBottom;
  // QR on the right end
  const qrSize = 220;
  const qrX = W - padX - qrSize;
  const qrY = bandTop + (padBottom - qrSize) / 2 - 6;
  if (qrDataUrl) {
    const q = await loadImage(qrDataUrl);
    ctx.drawImage(q, qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.font = '500 22px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Scan to verify', qrX + qrSize / 2, qrY + qrSize + 12);
  }

  // signature + certificate text on the left
  const sx = padX;
  let y = bandTop + 96;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#15171c';
  ctx.font = 'italic 400 80px "Instrument Serif", Georgia, serif';
  ctx.fillText('Anshad', sx, y);
  ctx.fillStyle = '#ff5630';
  ctx.fillRect(sx, y + 24, 58, 4);

  y += 78;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.font = '600 26px Inter, system-ui, sans-serif';
  ctx.fillText('Certificate of Authenticity', sx, y);

  y += 46;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.font = '400 25px Inter, system-ui, sans-serif';
  ctx.fillText(`No. ${certId}`, sx, y);
  if (email) { y += 38; ctx.fillText(`Issued to ${email}`, sx, y); }
  if (date) { y += 38; ctx.fillText(date, sx, y); }

  return c.toDataURL('image/jpeg', 0.95);
}
