'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import Toast from '@/components/ui/Toast';
import DATA from '@/lib/gameData';

export default function DisasterPage() {
  const router = useRouter();
  const gs = useGameStore();
  const [deployed, setDeployed] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const disaster = DATA.level5.disasters.find(d => d.id === gs.disasterId) || DATA.level5.disasters[0];

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
  }, []); // eslint-disable-line

  const toggleDeploy = (id: string) => {
    if (!gs.bought.includes(id)) return;
    setDeployed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    SFX.click();
  };

  const submit = () => {
    setSubmitted(true);
    let score = 0;
    deployed.forEach(id => {
      const tool = DATA.level5.tools.find(t => t.id === id);
      if (tool) {
        const eff = tool.eff[disaster.id as keyof typeof tool.eff];
        score += eff * 12;
        if (disaster.optTools.includes(id)) score += 100;
      }
    });
    const combos = DATA.level5.combos.filter(c => c.tools.every(t => gs.bought.includes(t)));
    combos.forEach(c => { score += c.bonus; });
    gs.setDisasterScore(score);
    gs.setApplied([...deployed]);
    gs.finalizeL5();
    SFX.levelUp();
    router.replace('/results?level=5');
  };

  const deployedArr = [...deployed];

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StarfieldCanvas />
      <Toast />
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="hud">
          <div className="hud-level font-orb">LEVEL 5B — DISASTER RESPONSE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="label">STRATEGY SCORE</div>
            <div className="font-orb t-accent2">CALCULATE ON SUBMIT</div>
          </div>
        </div>

        <div className="page-content" style={{ gap: 14 }}>
          {/* Disaster banner */}
          <div className="disaster-banner" style={{ maxWidth: 660, width: '100%' }}>
            <div style={{ fontSize: '2.5rem' }}>{disaster.icon}</div>
            <div className="font-orb" style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: 8 }}>{disaster.name}</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.75 }}>{disaster.desc}</p>
          </div>

          {/* Two column layout */}
          <div style={{ maxWidth: 660, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Tools */}
            <div>
              <div className="label" style={{ marginBottom: 8 }}>🛠 YOUR TOOLS</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {gs.bought.map(id => {
                  const tool = DATA.level5.tools.find(t => t.id === id)!;
                  const isDeployed = deployed.has(id);
                  const isOptimal = disaster.optTools.includes(id);
                  return (
                    <div
                      key={id}
                      className={`apply-card ${isDeployed ? 'on' : ''} ${isDeployed && isOptimal ? 'optimal-deployed' : ''}`}
                      onClick={() => toggleDeploy(id)}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{tool.icon}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{tool.name}</span>
                      <span style={{ fontSize: '0.65rem', color: isDeployed ? 'var(--accent2)' : 'var(--text2)' }}>
                        {isDeployed ? '✅ DEPLOYED' : 'Tap to deploy'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text2)' }}>Tap a tool to deploy/un-deploy it.</div>
            </div>

            {/* Metrics */}
            <div>
              <div className="label" style={{ marginBottom: 8 }}>📋 MISSION METRICS</div>
              {disaster.metrics.map(m => {
                const score = deployedArr.reduce((acc, id) => {
                  const tool = DATA.level5.tools.find(t => t.id === id)!;
                  return acc + tool.eff[disaster.id as keyof typeof tool.eff];
                }, 0);
                const pct = Math.min(100, (score / (disaster.optTools.length * 10)) * 100);
                return (
                  <div key={m} className="metric-row">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem' }}>{m}</div>
                      <div className="metric-bar-wrap">
                        <div className="metric-bar-track">
                          <div className="metric-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deployed tools summary */}
          <div style={{ maxWidth: 660, width: '100%' }}>
            <div className="label" style={{ marginBottom: 8 }}>🎯 DEPLOYED TOOLS</div>
            <div style={{ minHeight: 54, background: 'rgba(0,200,255,.03)', border: '1px dashed var(--border)', borderRadius: 10, padding: 11, display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'flex-start' }}>
              {deployedArr.length === 0 ? (
                <span style={{ color: 'var(--text2)', fontSize: '0.83rem' }}>No tools deployed yet.</span>
              ) : deployedArr.map(id => {
                const tool = DATA.level5.tools.find(t => t.id === id)!;
                return (
                  <span key={id} className="badge badge-green" style={{ gap: 4 }}>
                    {tool.icon} {tool.name}
                  </span>
                );
              })}
            </div>
          </div>

          <button
            className="btn btn-danger btn-lg"
            onClick={submit}
            disabled={submitted}
            style={{ maxWidth: 260, width: '100%' }}
            id="submitResponseBtn"
          >
            📡 SUBMIT RESPONSE PLAN
          </button>
        </div>
      </div>
    </div>
  );
}
