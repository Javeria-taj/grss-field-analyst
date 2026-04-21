'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import DATA from '@/lib/gameData';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisasterPage() {
  const router = useRouter();
  const gs = useGameStore();
  const [deployed, setDeployed] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const disaster = DATA.level5.disasters.find(d => d.id === gs.disasterId) || DATA.level5.disasters[0];

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
    // Resume deployments from store if available
    if (gs.applied.length > 0) {
      setDeployed(new Set(gs.applied));
    }
  }, []); // eslint-disable-line

  const toggleDeploy = (id: string) => {
    if (!gs.bought.includes(id)) return;
    setDeployed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      
      // SYNC TO HQ
      const nextArr = [...next];
      gs.setApplied(nextArr);
      gs.syncState();
      
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
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="hud">
          <div className="hud-level font-orb" style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)', color: 'var(--accent)' }}>LEVEL 5B — RESPONSE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="label" style={{ fontSize: '0.6rem' }}>STRATEGY</div>
            <div className="font-orb t-accent2" style={{ fontSize: '0.9rem' }}>...</div>
          </div>
        </div>

        <div className="page-content" style={{ gap: 14 }}>
          {/* Disaster banner */}
          <div className="disaster-banner" style={{ maxWidth: 660, width: '92vw', padding: '15px' }}>
            <div style={{ fontSize: '2rem' }}>{disaster.icon}</div>
            <div className="font-orb" style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: 6 }}>{disaster.name}</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.6 }}>{disaster.desc}</p>
          </div>

          {/* Two column layout / Responsive stack */}
          <div className="lv5b-grid" style={{ maxWidth: 660, width: '92vw', gap: 14 }}>
            {/* Tools */}
            <div className="lv5b-col">
              <div className="label" style={{ marginBottom: 8 }}>🛠 YOUR TOOLS</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {gs.bought.map((id: string) => {
                  const tool = DATA.level5.tools.find(t => t.id === id)!;
                  const isDeployed = deployed.has(id);
                  const isOptimal = disaster.optTools.includes(id);
                  return (
                    <motion.div
                      key={id}
                      className={`apply-card ${isDeployed ? 'on' : ''} ${isDeployed && isOptimal ? 'optimal-deployed' : ''}`}
                      onClick={() => toggleDeploy(id)}
                      onMouseEnter={() => SFX.hover()}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ padding: '8px 12px' }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{tool.icon}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{tool.name}</span>
                        <span style={{ fontSize: '0.6rem', color: isDeployed ? 'var(--dark)' : 'var(--text2)' }}>
                          {isDeployed ? '✅ DEPLOYED' : 'TAP TO DEPLOY'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Metrics */}
            <div className="lv5b-col">
              <div className="label" style={{ marginBottom: 8 }}>📋 MISSION METRICS</div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {disaster.metrics.map(m => {
                  const score = deployedArr.reduce((acc, id) => {
                    const tool = DATA.level5.tools.find(t => t.id === id)!;
                    return acc + tool.eff[disaster.id as keyof typeof tool.eff];
                  }, 0);
                  const pct = Math.min(100, (score / (disaster.optTools.length * 10)) * 100);
                  return (
                    <div key={m} className="metric-row" style={{ marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 4 }}>{m}</div>
                        <div className="metric-bar-wrap" style={{ height: 6 }}>
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
          </div>

          {/* Deployed tools summary */}
          <div style={{ maxWidth: 660, width: '92vw' }}>
            <div className="label" style={{ marginBottom: 8, fontSize: '0.65rem' }}>🎯 DEPLOYED LOADOUT</div>
            <div style={{ minHeight: 44, background: 'rgba(0,200,255,.03)', border: '1px dashed var(--border)', borderRadius: 10, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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

          <motion.button
            className="btn btn-danger btn-lg"
            onClick={submit}
            onMouseEnter={() => !submitted && SFX.hover()}
            whileHover={!submitted ? { scale: 1.05 } : {}}
            whileTap={!submitted ? { scale: 0.95 } : {}}
            disabled={submitted}
            style={{ maxWidth: 260, width: '100%' }}
            id="submitResponseBtn"
          >
            📡 SUBMIT RESPONSE PLAN
          </motion.button>
        </div>
      </div>
    </div>
  );
}
