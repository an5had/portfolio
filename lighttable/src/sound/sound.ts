/* Web Audio engine: an ambient bed + UI ticks, MUTED by default, resumed only on a
   user gesture (browser rule), choice remembered. Map ticks to real events so sound
   comments on interaction instead of droning. See references/sound-and-haptics.md */

export interface Sound {
  readonly on: boolean;
  toggle(): void;
  loadBed(url: string): Promise<void>;
  loadTick(name: string, url: string): Promise<void>;
  tick(name: string, vol?: number): void;
  buzz(ms?: number): void;
}

export function initSound(): Sound {
  const AC = (window.AudioContext || (window as any).webkitAudioContext);
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  let on = false;
  try { on = localStorage.getItem('sound') === '1'; } catch {}

  let bedBuf: AudioBuffer | null = null;
  let bedSrc: AudioBufferSourceNode | null = null;
  const ticks = new Map<string, AudioBuffer>();

  const ramp = (target: number, t = 0.4) =>
    master.gain.linearRampToValueAtTime(target, ctx.currentTime + t);

  async function decode(url: string) {
    return ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
  }

  function startBed() {
    if (!bedBuf || bedSrc) return;
    bedSrc = ctx.createBufferSource(); bedSrc.buffer = bedBuf; bedSrc.loop = true;
    const g = ctx.createGain(); g.gain.value = 0.35;
    bedSrc.connect(g).connect(master); bedSrc.start();
  }

  document.addEventListener('visibilitychange', () =>
    ramp(document.hidden ? 0 : (on ? 1 : 0), 0.2));

  return {
    get on() { return on; },
    toggle() {
      on = !on;
      if (on && ctx.state === 'suspended') ctx.resume();   // only works inside a gesture
      if (on) startBed();
      ramp(on ? 1 : 0);
      try { localStorage.setItem('sound', on ? '1' : '0'); } catch {}
    },
    async loadBed(url) { bedBuf = await decode(url); if (on) startBed(); },
    async loadTick(name, url) { ticks.set(name, await decode(url)); },
    tick(name, vol = 0.4) {
      const b = ticks.get(name);
      if (!b || !on) return;
      const s = ctx.createBufferSource(); s.buffer = b;
      const g = ctx.createGain(); g.gain.value = vol;
      s.connect(g).connect(master); s.start();
    },
    buzz(ms = 8) {
      if ('vibrate' in navigator && matchMedia('(pointer: coarse)').matches) {
        try { navigator.vibrate(ms); } catch {}
      }
    },
  };
}
