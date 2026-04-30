"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SFX = exports.getACtx = void 0;
// Web Audio API SFX — no external audio files
// Ported directly from grss-field-analyst.html
const haptics_1 = require("./haptics");
let _actx = null;
const getACtx = () => {
    if (typeof window === 'undefined')
        return {};
    if (!_actx) {
        _actx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return _actx;
};
exports.getACtx = getACtx;
// Auto-resume context on first user interaction
if (typeof window !== 'undefined') {
    const resume = () => {
        const c = (0, exports.getACtx)();
        if (c.state === 'suspended')
            c.resume();
    };
    window.addEventListener('click', resume, { once: true });
    window.addEventListener('touchstart', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
}
const tone = (freq, dur, type = 'sine', vol = 0.22, delay = 0) => {
    if (typeof window === 'undefined')
        return;
    try {
        const c = (0, exports.getACtx)();
        if (c.state === 'suspended')
            c.resume();
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
    }
    catch (e) {
        // Silently fail if audio context unavailable
    }
};
let musicGains = {};
let musicOscs = {};
exports.SFX = {
    click: () => { tone(700, 0.04, 'square', 0.07); haptics_1.Haptics.light(); },
    correct: () => {
        tone(523, 0.1, 'sine', 0.2);
        tone(659, 0.1, 'sine', 0.22, 0.1);
        tone(784, 0.3, 'sine', 0.22, 0.2);
        haptics_1.Haptics.success();
    },
    wrong: () => {
        tone(200, 0.2, 'sawtooth', 0.22);
        tone(150, 0.3, 'sawtooth', 0.18, 0.22);
        haptics_1.Haptics.error();
    },
    error: () => exports.SFX.wrong(),
    levelUp: () => [523, 587, 659, 698, 784, 880, 988].forEach((f, i) => tone(f, 0.18, 'sine', 0.22, i * 0.07)),
    levelComplete: () => exports.SFX.levelUp(),
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
        const ctx = (0, exports.getACtx)();
        const g = ctx.createGain();
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2); // Slow fade in
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
    glassShatter: () => {
        // High-frequency noise-like square tones for shattering effect
        for (let i = 0; i < 8; i++) {
            tone(2000 + Math.random() * 3000, 0.05, 'square', 0.15, i * 0.02);
        }
        tone(100, 0.4, 'sawtooth', 0.2); // Low thud
    },
    glitch: () => {
        for (let i = 0; i < 12; i++) {
            tone(100 + Math.random() * 3000, 0.05, 'sawtooth', 0.1, i * 0.02);
        }
    },
    alarm: () => {
        for (let i = 0; i < 3; i++) {
            tone(880, 0.2, 'square', 0.15, i * 0.4);
            tone(440, 0.2, 'square', 0.15, i * 0.4 + 0.2);
        }
    },
    // ── Panic Siren (looping, must be stopped explicitly) ──
    _panicGain: null,
    _panicOscs: [],
    _panicTimer: null,
    startPanic: () => {
        if (typeof window === 'undefined')
            return;
        if (exports.SFX._panicGain)
            return; // Already running
        try {
            const ctx = (0, exports.getACtx)();
            if (ctx.state === 'suspended')
                ctx.resume();
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, ctx.currentTime);
            g.connect(ctx.destination);
            exports.SFX._panicGain = g;
            exports.SFX._panicOscs = [];
            // A quick alarming timer ticking effect instead of a siren
            let tickCount = 0;
            exports.SFX._panicTimer = setInterval(() => {
                if (!exports.SFX._panicGain)
                    return;
                const freq = (tickCount % 2 === 0) ? 900 : 800;
                tone(freq, 0.05, 'square', 0.1);
                tickCount++;
            }, 250);
        }
        catch (e) { /* Silently fail if audio unavailable */ }
    },
    stopPanic: () => {
        if (!exports.SFX._panicGain)
            return;
        try {
            const ctx = (0, exports.getACtx)();
            exports.SFX._panicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
            setTimeout(() => {
                exports.SFX._panicOscs.forEach(o => { try {
                    o.stop();
                    o.disconnect();
                }
                catch { } });
                exports.SFX._panicOscs = [];
                try {
                    exports.SFX._panicGain?.disconnect();
                }
                catch { }
                exports.SFX._panicGain = null;
            }, 300);
            if (exports.SFX._panicTimer) {
                clearInterval(exports.SFX._panicTimer);
                exports.SFX._panicTimer = null;
            }
        }
        catch (e) { /* Silently fail */ }
    },
    success: () => exports.SFX.correct(),
    stopMusic: () => {
        Object.values(musicGains).forEach(g => g.gain.setTargetAtTime(0, (0, exports.getACtx)().currentTime, 0.5));
    },
    _musicTimer: null,
    _intensity: 1.0,
    setMusicIntensity: (intensity) => {
        exports.SFX._intensity = intensity;
        const ctx = (0, exports.getACtx)();
        Object.values(musicGains).forEach(g => {
            if (g.gain.value > 0.01) {
                g.gain.setTargetAtTime(0.05 * intensity, ctx.currentTime, 1);
            }
        });
    },
    playMusic: (type) => {
        const ctx = (0, exports.getACtx)();
        if (ctx.state === 'suspended')
            ctx.resume();
        // Stop others
        Object.keys(musicGains).forEach(k => {
            if (k !== type)
                musicGains[k].gain.setTargetAtTime(0, ctx.currentTime, 1);
        });
        if (musicGains[type]) {
            musicGains[type].gain.setTargetAtTime(type === 'ambient' ? 0.05 : 0.08, ctx.currentTime, 1);
            return;
        }
        const g = ctx.createGain();
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(type === 'ambient' ? 0.15 : 0.2, ctx.currentTime + 2);
        musicGains[type] = g;
        const freqs = type === 'ambient' ? [55, 110, 82.41] :
            type === 'active' ? [110, 220, 164.81, 130.81] :
                [40, 80, 60, 120];
        musicOscs[type] = freqs.map((f, i) => {
            const o = ctx.createOscillator();
            const oG = ctx.createGain();
            o.type = type === 'tense' ? 'sawtooth' : 'sine';
            o.frequency.setValueAtTime(f, ctx.currentTime);
            const mod = ctx.createOscillator();
            const modG = ctx.createGain();
            mod.frequency.value = 0.5 + i * 0.1;
            modG.gain.value = 2;
            mod.connect(modG);
            modG.connect(o.frequency);
            mod.start();
            oG.gain.value = 0.02;
            o.connect(oG);
            oG.connect(g);
            o.start();
            return o;
        });
        if (exports.SFX._musicTimer)
            clearInterval(exports.SFX._musicTimer);
        if (type !== 'ambient') {
            const tick = () => {
                if (musicGains[type].gain.value > 0.01) {
                    const pulseFreq = type === 'active' ? 110 : 60;
                    tone(pulseFreq, 0.1, 'square', 0.05 * exports.SFX._intensity);
                }
                const nextInterval = (type === 'active' ? 500 : 250) / exports.SFX._intensity;
                exports.SFX._musicTimer = setTimeout(tick, nextInterval);
            };
            exports.SFX._musicTimer = setTimeout(tick, type === 'active' ? 500 : 250);
        }
    }
};
exports.default = exports.SFX;
