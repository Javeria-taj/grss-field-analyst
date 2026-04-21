// Web Audio API SFX — no external audio files
// Ported directly from grss-field-analyst.html

let _actx: AudioContext | null = null;

export const getACtx = (): AudioContext => {
  if (typeof window === 'undefined') return {} as AudioContext;
  if (!_actx) {
    _actx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _actx;
};

const tone = (freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.22, delay = 0) => {
  if (typeof window === 'undefined') return;
  try {
    const c = getACtx();
    if (c.state === 'suspended') c.resume();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime + delay);
    g.gain.setValueAtTime(0, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + dur + 0.05);
  } catch (e) {
    // Silently fail if audio context unavailable
  }
};

export const SFX = {
  click: () => tone(700, 0.04, 'square', 0.07),
  correct: () => {
    tone(523, 0.1, 'sine', 0.2);
    tone(659, 0.1, 'sine', 0.22, 0.1);
    tone(784, 0.3, 'sine', 0.22, 0.2);
  },
  wrong: () => {
    tone(200, 0.2, 'sawtooth', 0.22);
    tone(150, 0.3, 'sawtooth', 0.18, 0.22);
  },
  levelUp: () => [523, 587, 659, 698, 784, 880, 988].forEach((f, i) => tone(f, 0.18, 'sine', 0.22, i * 0.07)),
  tick: () => tone(1000, 0.03, 'square', 0.05),
  urgency: () => tone(440, 0.1, 'square', 0.12),
  buy: () => {
    tone(400, 0.1, 'sine', 0.18);
    tone(600, 0.2, 'sine', 0.18, 0.1);
  },
  powerup: () => {
    tone(1000, 0.08, 'sine', 0.18);
    tone(1200, 0.08, 'sine', 0.18, 0.08);
    tone(1400, 0.2, 'sine', 0.22, 0.16);
  },
  hover: () => tone(900, 0.02, 'sine', 0.04), // Soft tactile blip
  ambience: () => {
    // A low-frequency multi-oscillator "Space Hum"
    const ctx = getACtx();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2); // Slow fade in

    const freqs = [55, 110, 82.41]; // Low A, A, E
    freqs.forEach(f => {
      const o = ctx.createOscillator();
      const oG = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, ctx.currentTime);
      oG.gain.setValueAtTime(0.02, ctx.currentTime);
      o.connect(oG);
      oG.connect(g);
      o.start();
    });
  },
  dataStream: (count = 10) => {
    for (let i = 0; i < count; i++) {
      tone(1200 + Math.random() * 800, 0.02, 'square', 0.03, i * 0.04);
    }
  },
  final: () => [523, 659, 784, 1047].forEach((f, i) => {
    tone(f, 0.3, 'sine', 0.2, i * 0.12);
    tone(f * 2, 0.3, 'sine', 0.1, i * 0.12);
  }),
};

export default SFX;
