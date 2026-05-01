'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { getTitle } from '@/lib/gameData';
import { useState } from 'react';

export default function GameOverPhase() {
  const { finalLeaderboard, myTelemetry, auctionOwned, auctionBudget, myTotalScore } = useGameSyncStore();
  const [showCard, setShowCard] = useState(true);

  const calculateArchetype = () => {
    const correctAnswers = myTelemetry.filter(t => t.correct);
    const avgTime = myTelemetry.length > 0 ? myTelemetry.reduce((sum, t) => sum + t.timeTaken, 0) / myTelemetry.length : 0;
    const accuracy = myTelemetry.length > 0 ? (correctAnswers.length / myTelemetry.length) * 100 : 0;
    const level4Fast = myTelemetry.filter(t => t.qIndex >= 30 && t.qIndex < 40 && t.timeTaken < 3).length; // Rapid Fire

    if (level4Fast >= 5) return { title: "Speed Demon", icon: "⚡", color: "#f59e0b", desc: "Reflexes of a supercomputer. You answer before the data even arrives." };
    if (auctionOwned.length >= 3 && auctionBudget > 2000) return { title: "Auction Sniper", icon: "🎯", color: "#10b981", desc: "Master of efficiency. You secured the best tools with credits to spare." };
    if (accuracy >= 95) return { title: "Sentinel Veteran", icon: "🛡️", color: "#3b82f6", desc: "Zero margin for error. Your telemetry is a gold standard for the agency." };
    if (myTotalScore > 10000 && accuracy < 60) return { title: "Chaos Agent", icon: "🌀", color: "#a855f7", desc: "You generate more noise than signal, yet somehow you dominate the field." };
    
    return { title: "Field Analyst", icon: "📡", color: "#60a5fa", desc: "Reliable, consistent, and mission-ready. A true asset to the GRSS." };
  };

  const archetype = calculateArchetype();
  const stats = [
    { label: 'ACCURACY', value: `${Math.round((myTelemetry.filter(t => t.correct).length / Math.max(1, myTelemetry.length)) * 100)}%` },
    { label: 'AVG SPEED', value: `${(myTelemetry.reduce((s, t) => s + t.timeTaken, 0) / Math.max(1, myTelemetry.length)).toFixed(1)}s` },
    { label: 'SCORE', value: myTotalScore.toLocaleString() },
    { label: 'RANK', value: `#${finalLeaderboard.find(e => e.totalScore === myTotalScore)?.rank || '?'}` }
  ];

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 24, minHeight: '70vh', padding: '40px 20px' }}>
      <AnimatePresence mode="wait">
        {showCard ? (
          <motion.div 
            key="card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="player-twin-card"
            style={{
              width: '100%', maxWidth: 420,
              background: '#030712',
              borderRadius: 32,
              padding: 'clamp(20px, 8vw, 40px)',
              border: `2px solid ${archetype.color}44`,
              boxShadow: `0 0 40px ${archetype.color}22, inset 0 0 20px ${archetype.color}11`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Accents */}
            <div style={{ position: 'absolute', top: -100, right: -100, width: 250, height: 250, background: `${archetype.color}11`, filter: 'blur(80px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, background: `${archetype.color}08`, filter: 'blur(60px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 10 }}>
              <div className="label font-orb" style={{ color: archetype.color, letterSpacing: 4, textAlign: 'center', marginBottom: 24 }}>MISSION DEBRIEF // 2026</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                <motion.div 
                  className="arch-icon"
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  style={{ 
                    fontSize: '5rem', marginBottom: 16,
                    filter: `drop-shadow(0 0 20px ${archetype.color}aa)`
                  }}
                >
                  {archetype.icon}
                </motion.div>
                <div className="font-orb arch-title" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1 }}>{archetype.title.toUpperCase()}</div>
                <div style={{ color: 'var(--text2)', fontSize: '0.85rem', textAlign: 'center', marginTop: 12, maxWidth: '90%', fontStyle: 'italic', opacity: 0.8 }}>
                  "{archetype.desc}"
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(10px, 4vw, 20px)', marginBottom: 32 }}>
                {stats.map((s, i) => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', padding: 'clamp(10px, 3vw, 16px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text2)', letterSpacing: 2, marginBottom: 4 }}>{s.label}</div>
                    <div className="font-orb" style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }} className="flex-responsive">
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => alert('Summary card saved to simulation storage. Screenshot to share!')}
                  className="btn" 
                  style={{ width: '100%', background: '#fff', color: '#000', borderRadius: 16, fontSize: '0.85rem', fontWeight: 'bold' }}
                >
                  📥 SAVE CARD
                </motion.button>
              </div>

              <style jsx>{`
                @media (max-width: 600px) {
                  .arch-icon { font-size: 3.5rem !important; }
                  .arch-title { font-size: 1.8rem !important; }
                }
              `}</style>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.6rem', color: 'var(--text2)', opacity: 0.4, letterSpacing: 2 }}>
                GRSS FIELD ANALYST PROGRAM // VER 2.0.4 // SATELLITE LINK STABLE
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="card" style={{ maxWidth: 550, width: '100%', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div className="label t-gold">🏅 FINAL LEADERBOARD</div>
              <button onClick={() => setShowCard(true)} className="t-accent" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: 1 }}>BACK TO DEBRIEF</button>
            </div>
            {finalLeaderboard.map((e, i) => (
              <motion.div key={e.usn}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', marginBottom: 6, borderRadius: 8,
                  background: i < 3 ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                  border: i < 3 ? '1px solid rgba(255,215,0,0.15)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="font-orb" style={{ fontSize: i < 3 ? '1.2rem' : '0.9rem', color: i < 3 ? 'var(--gold)' : 'var(--text2)', width: 30 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${e.rank}`}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>{getTitle(e.totalScore)}</div>
                  </div>
                </div>
                <div className="font-orb t-gold" style={{ fontSize: '1.1rem' }}>{e.totalScore.toLocaleString()}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
