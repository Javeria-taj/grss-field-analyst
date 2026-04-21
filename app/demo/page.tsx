'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SFX } from '@/lib/sfx';

const STEPS = [
  { id: 0, title: 'WELCOME' },
  { id: 1, title: 'THE HUD' },
  { id: 2, title: 'TOOL AUCTION' },
  { id: 3, title: 'GLOSSARY' },
  { id: 4, title: 'SCORING' },
];

export default function DemoPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [timerW, setTimerW] = useState(75);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 1) {
      timerRef.current = setInterval(() => {
        setTimerW(w => {
          if (w <= 5) { clearInterval(timerRef.current!); return 75; }
          return w - 0.5;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const next = () => { if (step < STEPS.length - 1) { SFX.click(); setStep(s => s + 1); } };
  const prev = () => { if (step > 0) { SFX.click(); setStep(s => s - 1); } };

  const timerClass = timerW < 25 ? 'crit' : timerW < 50 ? 'warn' : '';

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'rgba(3,7,15,0.96)', backdropFilter: 'blur(12px)' }}>
          <div className="font-orb t-accent">▶ DEMO MODE — INTERACTIVE TOUR</div>
          <button className="btn btn-outline btn-sm" onClick={() => { SFX.click(); router.push('/'); }}>← Exit Demo</button>
        </div>

        <div className="page-content">
          <div style={{ maxWidth: 620, width: '100%' }}>
            {/* Step dots */}
            <div className="demo-nav">
              {STEPS.map(s => (
                <div key={s.id} className={`demo-dot ${step === s.id ? 'on' : ''}`} onClick={() => { SFX.click(); setStep(s.id); }} />
              ))}
            </div>

            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="card card-glow" style={{ textAlign: 'center', padding: 30 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛰️</div>
                <h2 className="font-orb t-accent" style={{ marginBottom: 8, fontSize: '1.3rem' }}>Welcome, Analyst</h2>
                <p style={{ color: 'var(--text2)', marginBottom: 18, fontSize: '0.92rem', lineHeight: 1.8 }}>
                  You&apos;re about to join the IEEE GRSS Field Analyst mission. 5 levels, 200+ participants, one Earth to save. This tour will show you the interface before you dive in.
                </p>
                <button className="btn btn-primary btn-lg" onClick={next}>Start Tour →</button>
              </div>
            )}

            {/* Step 1: HUD */}
            {step === 1 && (
              <div>
                <div className="label" style={{ marginBottom: 9 }}>THE MISSION HUD</div>
                <div className="card card-glow" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div className="font-orb t-accent" style={{ fontSize: '0.82rem' }}>LEVEL 2 — INTEL</div>
                      <div className="prog-dots" style={{ marginTop: 4 }}>
                        <div className="prog-dot done" />
                        <div className="prog-dot done" />
                        <div className="prog-dot cur" />
                        <div className="prog-dot" />
                        <div className="prog-dot" />
                      </div>
                    </div>
                    <div className="pu-bar">
                      {[{ i: '💡', l: 'Hint', c: 2 }, { i: '⏭', l: 'Skip', c: 1 }, { i: '❄️', l: 'Freeze', c: 1 }].map(pu => (
                        <div key={pu.l} className="pu-btn">
                          <span className="pu-icon">{pu.i}</span>
                          <span className="pu-label">{pu.l}</span>
                          <span className="pu-count">{pu.c}</span>
                        </div>
                      ))}
                    </div>
                    <div className="font-orb t-accent2">340 pts</div>
                  </div>
                  <div className="timer-wrap" style={{ marginTop: 10, padding: 0 }}>
                    <div className="timer-track">
                      <div className={`timer-fill ${timerClass}`} style={{ width: `${timerW}%`, transition: 'width 0.1s linear, background 0.5s' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: timerW < 25 ? 'var(--danger)' : timerW < 50 ? 'var(--warning)' : 'var(--accent)', textAlign: 'right', marginTop: 3, fontFamily: 'var(--font-orbitron)' }}>
                    {Math.round(timerW / 100 * 120)}s
                  </div>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: 12, lineHeight: 1.7 }}>
                  The HUD tracks your level, question progress (dots), power-ups and live score. Timer bar turns orange then red as urgency builds. Power-ups can turn the tide — use them wisely!
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={prev}>← Back</button>
                  <button className="btn btn-primary btn-sm" onClick={next}>Next →</button>
                </div>
              </div>
            )}

            {/* Step 2: Auction */}
            {step === 2 && (
              <div>
                <div className="label" style={{ marginBottom: 9 }}>LEVEL 5A — TOOL AUCTION</div>
                <div className="card card-glow" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div><div className="label">BUDGET</div><div className="font-orb t-warning" style={{ fontSize: '1.1rem' }}>$6,800</div></div>
                    <div><div className="label">TOOLS</div><div className="font-orb t-accent2">2/5</div></div>
                    <div><div className="label">PRICE HIKE IN</div><div className="font-orb t-danger">9s</div></div>
                  </div>
                  <div className="budget-track" style={{ marginBottom: 13 }}><div className="budget-fill" style={{ width: '68%', background: 'linear-gradient(90deg,var(--danger),var(--warning),var(--success))' }} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div className="tool-card bought">
                      <div style={{ fontSize: '1.4rem', marginBottom: 3 }}>📡</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 3 }}>SAR Satellite Feed</div>
                      <div className="tool-price">$2,500</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--accent2)', marginTop: 4 }}>✅ ACQUIRED — tap to sell</div>
                    </div>
                    <div className="tool-card">
                      <div style={{ fontSize: '1.4rem', marginBottom: 3 }}>🌡️</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 3 }}>Thermal Camera</div>
                      <div className="tool-price rising">$1,980</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text2)', marginTop: 4 }}>Tap to acquire</div>
                    </div>
                  </div>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: 12, lineHeight: 1.7 }}>
                  Prices rise 10% every 20 seconds! Certain tool combinations unlock powerful combo bonuses. Your purchases directly affect your Disaster Response score in Part B.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={prev}>← Back</button>
                  <button className="btn btn-primary btn-sm" onClick={next}>Next →</button>
                </div>
              </div>
            )}

            {/* Step 3: Glossary */}
            {step === 3 && (
              <div>
                <div className="label" style={{ marginBottom: 9 }}>📖 GEOSCIENCE QUICK GLOSSARY</div>
                <div className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {[
                      { term: 'SAR', def: 'Synthetic Aperture Radar — cloud-piercing microwave imaging' },
                      { term: 'NDVI', def: 'Normalized Difference Vegetation Index (-1 to +1)' },
                      { term: 'LiDAR', def: 'Laser-based 3D terrain mapping from aerial platforms' },
                      { term: 'InSAR', def: 'Interferometric SAR — detects mm-level ground deformation' },
                      { term: 'GRSS', def: 'IEEE Geoscience & Remote Sensing Society' },
                    ].map(g => (
                      <div key={g.term} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                        <span className="t-accent font-orb" style={{ fontSize: '0.82rem' }}>{g.term}</span>
                        <span style={{ color: 'var(--text2)', fontSize: '0.83rem' }}>{g.def}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={prev}>← Back</button>
                  <button className="btn btn-primary btn-sm" onClick={next}>Next →</button>
                </div>
              </div>
            )}

            {/* Step 4: Scoring */}
            {step === 4 && (
              <div>
                <div className="label" style={{ marginBottom: 9 }}>🏅 SCORING &amp; RANKS</div>
                <div className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'grid', gap: 0 }}>
                    {[
                      { label: 'Answer correctness (base)', val: '100–250 pts' },
                      { label: 'Speed bonus (time remaining)', val: 'Up to +50%' },
                      { label: 'Budget efficiency (Level 5A)', val: 'Up to +300 pts' },
                      { label: 'Tool combo bonus', val: '+300–500 pts' },
                      { label: 'Disaster effectiveness (Level 5B)', val: 'Up to +800 pts' },
                    ].map(r => (
                      <div key={r.label} className="metric-row">
                        <span style={{ fontSize: '0.88rem' }}>{r.label}</span>
                        <span className="metric-val">{r.val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 13, padding: 12, background: 'rgba(255,215,0,.06)', border: '1px solid rgba(255,215,0,.2)', borderRadius: 9 }}>
                    <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 7, fontSize: '0.88rem' }}>🏆 RANK TITLES</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text2)', display: 'grid', gap: 3 }}>
                      {[
                        ['≥ 3000 pts', 'Disaster Strategist'],
                        ['≥ 2500 pts', 'Climate Guardian'],
                        ['≥ 2000 pts', 'Resource Optimizer'],
                        ['≥ 1500 pts', 'Earth Observer'],
                        ['≥ 1000 pts', 'Field Analyst'],
                        ['< 1000 pts', 'GRSS Trainee'],
                      ].map(([pts, rank]) => (
                        <div key={rank}>{pts} → <strong style={{ color: 'var(--white)' }}>{rank}</strong></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={prev}>← Back</button>
                  <button className="btn btn-success" onClick={() => { SFX.click(); router.push('/'); }} id="startPlayingBtn">
                    🚀 Start Playing!
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
