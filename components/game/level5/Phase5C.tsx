'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLevel5Store } from '@/stores/useLevel5Store';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import {
  CASE_STUDIES, TOOLS, TIERS, TIER_LABELS,
  PHASE_A_CORRECT_PTS, PHASE_B_PERFECT_PTS, PHASE_B_PARTIAL_PTS,
} from './level5Data';

interface ToolRowData {
  tool: typeof TOOLS[0];
  cs: typeof CASE_STUDIES[0];
  tierIdx: number;
  pts: number;
  rowClass: 'perfect' | 'partial' | 'miss' | 'decoy';
  verdict: string;
}

function getTitle(s: number): string {
  if (s >= 8000) return '🌍 Disaster Strategist';
  if (s >= 6000) return '🌿 Climate Guardian';
  if (s >= 4000) return '⚙️ Resource Optimizer';
  if (s >= 2500) return '🔭 Earth Observer';
  if (s >= 1000) return '🛰️ Field Analyst';
  return '📡 GRSS Trainee';
}

export default function Phase5C() {
  const { answers5A, budget: remainingBudget, slots, resetLevel5 } = useLevel5Store();
  const { myTotalScore, socket } = useGameSyncStore();

  // ── Phase A Scoring ──
  const phaseAResults = useMemo(() =>
    CASE_STUDIES.map((cs) => {
      const ans = answers5A[cs.id];
      const ok = ans === cs.correct;
      const pts = ok ? PHASE_A_CORRECT_PTS : 0;
      const ansLabel = ans !== null ? cs.opts[ans] : 'No answer';
      return { cs, ok, pts, ansLabel };
    }), [answers5A]
  );
  const phaseAScore = phaseAResults.reduce((a, r) => a + r.pts, 0);

  // ── Phase B Scoring ──
  const phaseBRows = useMemo((): ToolRowData[] => {
    const rows: ToolRowData[] = [];
    CASE_STUDIES.forEach((cs, csIdx) => {
      const csNum = csIdx + 1; // 1-4
      for (let ti = 0; ti < 3; ti++) {
        const slot = slots[cs.id][ti];
        if (!slot) continue;
        const tool = TOOLS.find((x) => x.id === slot.toolId);
        if (!tool) continue;

        let pts = 0;
        let rowClass: ToolRowData['rowClass'] = 'miss';
        let verdict = '';

        if (tool.cs === null) {
          pts = 0; rowClass = 'decoy'; verdict = '🗑 Decoy tool — 0 pts';
        } else if (tool.cs === csNum && tool.tier === ti) {
          pts = PHASE_B_PERFECT_PTS; rowClass = 'perfect'; verdict = '🥇 Perfect match — +1000 pts';
        } else if (tool.cs === csNum && tool.tier !== ti) {
          pts = PHASE_B_PARTIAL_PTS; rowClass = 'partial'; verdict = '🔄 Right disaster, wrong tier — +400 pts';
        } else {
          pts = 0; rowClass = 'miss'; verdict = '❌ Wrong disaster — 0 pts';
        }

        rows.push({ tool, cs, tierIdx: ti, pts, rowClass, verdict });
      }
    });
    return rows;
  }, [slots]);

  const phaseBScore = phaseBRows.reduce((a, r) => a + r.pts, 0);

  // ── Grand Total ──
  const l5Score = phaseAScore + phaseBScore + remainingBudget;
  // myTotalScore already accumulated from levels 1-4; we add l5Score on top
  const grandTotal = myTotalScore + l5Score;
  const rank = getTitle(grandTotal);

  // ── Submit to server once (on mount) ──
  useMemo(() => {
    if (socket?.connected) {
      socket.emit('submit_level5_results', { l5Score });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once

  const ptColor = (row: ToolRowData) => {
    if (row.pts === 1000) return 'var(--gold)';
    if (row.pts === 400) return 'var(--accent)';
    if (row.rowClass === 'decoy') return 'var(--text2)';
    return 'var(--danger)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(3,7,15,0.94)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)' }}>
            Level 5 · Phase C
          </div>
          <h2 className="font-orb t-accent" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.3rem)' }}>
            MISSION DEBRIEF
          </h2>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '18px 20px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Phase 5A Results */}
          <div style={{ marginBottom: 22 }}>
            <div style={{
              fontFamily: "'Orbitron', monospace", fontSize: '0.68rem',
              letterSpacing: 2, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 11,
            }}>
              📋 Phase 5A — Threat Identification Results
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
              gap: 10,
            }}>
              {phaseAResults.map(({ cs, ok, pts, ansLabel }, i) => (
                <motion.div
                  key={cs.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    background: ok ? 'rgba(0,230,118,0.04)' : 'rgba(255,45,85,0.04)',
                    border: `1px solid ${ok ? 'rgba(0,230,118,0.4)' : 'rgba(255,45,85,0.4)'}`,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: '1rem', marginBottom: 5 }}>
                    {ok ? '✅' : '❌'}&nbsp;
                    <span className="font-orb" style={{ fontSize: '0.85rem', color: ok ? 'var(--accent2)' : 'var(--danger)' }}>
                      {ok ? `+${pts} pts` : '0 pts'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text2)', marginBottom: 4 }}>
                    {cs.label} — {cs.title}
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Your answer: {ansLabel}</div>
                  {!ok && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent2)', marginTop: 3 }}>
                      ✓ Correct: {cs.opts[cs.correct]}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Phase 5B Audit */}
          <div style={{ marginBottom: 22 }}>
            <div style={{
              fontFamily: "'Orbitron', monospace", fontSize: '0.68rem',
              letterSpacing: 2, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 11,
            }}>
              🛠 Phase 5B — Tool Deployment Audit
            </div>
            <div style={{ display: 'grid', gap: 7 }}>
              {phaseBRows.length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: '0.85rem', textAlign: 'center', padding: 14 }}>
                  No tools deployed in Phase B.
                </div>
              ) : (
                phaseBRows.map((row, i) => (
                  <motion.div
                    key={`${row.cs.id}-${row.tierIdx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: row.rowClass === 'perfect'
                        ? 'rgba(255,215,0,0.04)'
                        : row.rowClass === 'partial'
                        ? 'rgba(0,200,255,0.04)'
                        : row.rowClass === 'decoy'
                        ? 'transparent'
                        : 'rgba(255,45,85,0.03)',
                      border: `1px solid ${
                        row.rowClass === 'perfect' ? 'rgba(255,215,0,0.4)'
                        : row.rowClass === 'partial' ? 'rgba(0,200,255,0.3)'
                        : row.rowClass === 'decoy' ? 'rgba(100,100,100,0.25)'
                        : 'rgba(255,45,85,0.22)'
                      }`,
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      opacity: row.rowClass === 'decoy' ? 0.55 : 1,
                    }}
                  >
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{row.tool.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.tool.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>
                        {row.cs.label} · {TIERS[row.tierIdx]} {TIER_LABELS[row.tierIdx]}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text2)', marginBottom: 2 }}>{row.verdict}</div>
                      <div className="font-orb" style={{ fontSize: '0.82rem', color: ptColor(row) }}>
                        {row.pts > 0 ? `+${row.pts}` : '0'} pts
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Score Breakdown */}
          <div style={{ marginBottom: 22 }}>
            <div style={{
              fontFamily: "'Orbitron', monospace", fontSize: '0.68rem',
              letterSpacing: 2, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 11,
            }}>
              📊 Score Breakdown
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 14, padding: 20, marginBottom: 18,
              }}
            >
              {[
                { label: 'Phase 5A — Threat Identification (4 × 500)', val: `+${phaseAScore.toLocaleString()} pts`, color: 'var(--accent2)' },
                { label: 'Phase 5B — Tool Deployment', val: `+${phaseBScore.toLocaleString()} pts`, color: 'var(--gold)' },
                { label: 'Unspent Mission Budget', val: `+${remainingBudget.toLocaleString()} pts`, color: 'var(--accent)' },
              ].map((row) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.87rem',
                }}>
                  <span>{row.label}</span>
                  <span className="font-orb" style={{ fontSize: '0.9rem', color: row.color }}>{row.val}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderTop: '2px solid var(--border)', marginTop: 8,
                paddingTop: 12, fontWeight: 700,
              }}>
                <span className="font-orb" style={{ fontSize: '0.9rem' }}>Level 5 Total</span>
                <span className="font-orb" style={{ fontSize: '0.95rem', color: 'var(--accent2)' }}>
                  +{l5Score.toLocaleString()} pts
                </span>
              </div>
            </motion.div>
          </div>

          {/* Final Score Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              textAlign: 'center', padding: '28px 20px',
              background: 'linear-gradient(135deg,rgba(0,50,22,0.92),rgba(0,25,70,0.92))',
              border: '2px solid var(--accent2)', borderRadius: 18, marginBottom: 20,
              boxShadow: '0 0 50px rgba(0,255,136,0.15), inset 0 0 30px rgba(0,255,136,0.04)',
            }}
          >
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 4 }}>
              All 5 Levels Complete
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>Grand Mission Score</div>
            <motion.span
              className="font-orb"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85, type: 'spring', stiffness: 250 }}
              style={{
                fontSize: 'clamp(2.2rem,7vw,3.8rem)', color: 'var(--accent2)',
                textShadow: '0 0 35px rgba(0,255,136,0.55)',
                display: 'block', margin: '8px 0',
              }}
            >
              {grandTotal.toLocaleString()}
            </motion.span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 14 }}>total points</div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              style={{
                fontSize: '1.1rem', padding: '11px 26px', borderRadius: 999,
                background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(0,200,255,0.2))',
                border: '2px solid var(--purple, #7c3aed)', color: '#e8f4ff',
                display: 'inline-block', fontFamily: "'Orbitron', monospace", letterSpacing: 1,
              }}
            >
              {rank}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
