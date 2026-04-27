'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';
import PerformanceCharts from './PerformanceCharts';
import { ACHIEVEMENTS } from '@/lib/achievements';

export default function LevelCompletePhase({ user }: { user: { usn: string } }) {
  const { levelCompleteData, leaderboard, myTelemetry } = useGameSyncStore();
  const [activeTab, setActiveTab] = useState<'ranks' | 'performance'>('ranks');

  if (!levelCompleteData) return null;
  const { level, levelStats } = levelCompleteData;

  const top25 = leaderboard.slice(0, 25);
  const myEntry = leaderboard.find(e => e.usn.toUpperCase() === user.usn.toUpperCase());
  const isInTop25 = top25.some(e => e.usn.toUpperCase() === user.usn.toUpperCase());

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 20, minHeight: '70vh', padding: '40px 20px' }}>
      <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div style={{ fontSize: '3rem' }}>🎖️</div>
        <div className="font-orb t-accent2" style={{ fontSize: '1.2rem', marginTop: 8 }}>MISSION {level} COMPLETE</div>
        <div style={{ color: 'var(--text2)', marginTop: 8, fontSize: '0.8rem' }}>
          Accuracy: {levelStats.avgAccuracy}% across {levelStats.totalQuestions} questions
        </div>
        {levelStats.topScorer && (
          <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--gold)' }}>
            🏆 Top Scorer: {levelStats.topScorer.name} (+{levelStats.topScorer.score} pts)
          </div>
        )}
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text2)' }}>
          Waiting for Mission Control to start next level...
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, maxWidth: 500, width: '100%', marginTop: 20 }}>
        <button className={`btn btn-sm ${activeTab === 'ranks' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ flex: 1 }} onClick={() => { SFX.click(); setActiveTab('ranks'); }}>
          🏆 GLOBAL RANKS
        </button>
        <button className={`btn btn-sm ${activeTab === 'performance' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ flex: 1 }} onClick={() => { SFX.click(); setActiveTab('performance'); }}>
          📊 MY PERFORMANCE
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ranks' ? (
          <motion.div key="ranks" className="card" style={{ maxWidth: 500, width: '100%' }}
            initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}>
            <div className="label t-gold" style={{ marginBottom: 12 }}>TOP 25 OPERATIVES</div>
            <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
              {top25.map((e, i) => (
                <div key={e.usn} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: e.usn.toUpperCase() === user.usn.toUpperCase() ? 'rgba(56,189,248,0.1)' : 'transparent',
                  margin: '0 -10px', paddingLeft: 10, paddingRight: 10, borderRadius: 6
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span className="font-orb" style={{ color: i < 3 ? 'var(--gold)' : 'var(--text2)', width: 22, fontSize: '0.8rem' }}>#{e.rank}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: e.usn.toUpperCase() === user.usn.toUpperCase() ? 700 : 400 }}>{e.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span className="hide-mobile" style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>+{e.currentLevelScore}</span>
                    <span className="font-orb t-gold" style={{ fontSize: '0.9rem' }}>{e.totalScore}</span>
                  </div>
                </div>
              ))}
              
              {!isInTop25 && myEntry && (
                <>
                  <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '10px 0' }}>•••</div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px', borderRadius: 8, border: '1px solid var(--accent)',
                    background: 'rgba(56,189,248,0.1)', boxShadow: 'var(--glow)'
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span className="font-orb t-accent" style={{ width: 28, fontSize: '0.85rem' }}>#{myEntry.rank}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{myEntry.name} (YOU)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>+{myEntry.currentLevelScore}</span>
                      <span className="font-orb t-gold" style={{ fontSize: '0.95rem' }}>{myEntry.totalScore}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="performance" style={{ maxWidth: 500, width: '100%' }}
            initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
            <PerformanceCharts telemetry={myTelemetry} />

            {/* Achievements Section */}
            <div className="card card-sm" style={{ marginTop: 15 }}>
              <div className="label t-gold" style={{ marginBottom: 12, fontSize: '0.6rem' }}>OPERATIVE MILESTONES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {useGameSyncStore.getState().myScore?.achievements?.map(id => {
                  const a = ACHIEVEMENTS[id];
                  if (!a) return null;
                  return (
                    <div key={id} className={`badge badge-${a.rarity}`} title={a.desc} 
                      style={{ padding: '8px 12px', height: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span>{a.icon}</span>
                      <span style={{ fontSize: '0.7rem' }}>{a.name}</span>
                    </div>
                  );
                })}
                {(!useGameSyncStore.getState().myScore?.achievements || useGameSyncStore.getState().myScore!.achievements.length === 0) && (
                  <div style={{ color: 'var(--text3)', fontSize: '0.75rem', padding: '10px 0' }}>No milestones reached yet.</div>
                )}
              </div>
            </div>
            
            <div className="card card-sm" style={{ marginTop: 15 }}>
              <div className="label t-accent" style={{ marginBottom: 12, fontSize: '0.6rem' }}>RAW LOGS</div>
              <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {myTelemetry.map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '6px 4px' }}>Q{t.qIndex + 1}</td>
                        <td style={{ padding: '6px 4px' }}>{t.timeTaken}s</td>
                        <td style={{ padding: '6px 4px' }}>{t.correct ? '✅' : '❌'}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', color: 'var(--accent2)' }}>+{t.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
