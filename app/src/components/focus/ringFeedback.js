/* Sound + haptics for the lens focus ring.

   SOUND — a ratchet tick for every engraved tick mark the barrel passes, and a heavier detent
   "clunk" when it settles on (or passes) a stop. Both are tiny buffers synthesised once (no audio
   files). Browsers only allow audio after a user gesture, so the AudioContext is created/resumed on
   the first pointerdown / keydown / touchend anywhere on the page; before that the ring is silent.

   HAPTICS — Android (and any browser with the Vibration API): short vibrate() pulses.
   iOS Safari has no Vibration API. Since iOS 18, toggling a native <input type="checkbox" switch>
   plays the system haptic, so we click a hidden one — only on the bigger moments (stops and major
   ticks), because it's a single fixed "tick" and iOS throttles rapid repeats. Best-effort: it
   depends on the iOS version and on the phone not being in silent/low-power haptics mode. */

let ctx = null;
let master = null;
let clickBuf = null;
let clunkBuf = null;
let listening = false;
let lastSound = 0;
let lastBuzz = 0;
let iosSwitch = null;

const isIOS = typeof navigator !== 'undefined'
  && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function build(c) {
  const sr = c.sampleRate;
  // tick: a 12ms burst of noise + a 4.2kHz ping, very fast decay — a small metal ratchet tooth
  clickBuf = c.createBuffer(1, Math.ceil(sr * 0.012), sr);
  const a = clickBuf.getChannelData(0);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    a[i] = ((Math.random() * 2 - 1) * 0.55 + Math.sin(2 * Math.PI * 4200 * t) * 0.7) * Math.exp(-t / 0.0017);
  }
  // clunk: a 60ms detent — sharp transient plus a quick downward thump
  clunkBuf = c.createBuffer(1, Math.ceil(sr * 0.06), sr);
  const b = clunkBuf.getChannelData(0);
  let phase = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / sr;
    phase += (2 * Math.PI * (320 + 1300 * Math.exp(-t / 0.009))) / sr;
    b[i] = (Math.random() * 2 - 1) * 0.7 * Math.exp(-t / 0.0035) + Math.sin(phase) * 0.85 * Math.exp(-t / 0.014);
  }
  master = c.createGain();
  master.gain.value = 0.32;
  master.connect(c.destination);
}

function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC({ latencyHint: 'interactive' });
      build(ctx);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* no audio available */ }
}

export function listenForAudioUnlock() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  ['pointerdown', 'keydown', 'touchend'].forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));
}

function play(buf, gain, rate) {
  if (!ctx || ctx.state !== 'running' || !buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g).connect(master);
  src.start();
}

function iosHaptic() {
  try {
    if (!iosSwitch) {
      const label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.appendChild(input);
      document.body.appendChild(label);
      iosSwitch = label;
    }
    iosSwitch.click();
  } catch { /* unsupported */ }
}

/* kind: 'minor' (every 5° tick) | 'major' (every 25°) | 'stop' (a detent) */
export function ringFeedback(kind) {
  const now = performance.now();

  // sound — ticks are throttled so a fast spin reads as a rattle, not a buzz; stops always play
  if (kind === 'stop') {
    play(clunkBuf, 0.9, 0.96 + Math.random() * 0.08);
    lastSound = now;
  } else if (now - lastSound > 24) {
    play(clickBuf, kind === 'major' ? 0.62 : 0.4, 0.9 + Math.random() * 0.2);
    lastSound = now;
  }

  // haptics
  if (canVibrate) {
    if (kind === 'stop') { navigator.vibrate(14); lastBuzz = now; }
    else if (now - lastBuzz > 45) { navigator.vibrate(kind === 'major' ? 7 : 3); lastBuzz = now; }
  } else if (isIOS && (kind === 'stop' || kind === 'major') && now - lastBuzz > 90) {
    iosHaptic();
    lastBuzz = now;
  }
}
