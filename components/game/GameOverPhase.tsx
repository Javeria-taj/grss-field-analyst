'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { getTitle } from '@/lib/gameData';

export default function GameOverPhase() {
  const { finalLeaderboard } = useGameSyncStore();

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 24, minHeight: '70vh' }}>
      <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div style={{ fontSize: '5rem' }} animate={{ y: [0, -12, 0] }} transition={{ duration: 2, repeat: Infinity }}>🏆</motion.div>
        <div className="font-orb t-gold" style={{ fontSize: '1.8rem', letterSpacing: 3, marginTop: 12 }}>MISSION COMPLETE</div>
        <div style={{ color: 'var(--text2)', marginTop: 8, fontSize: '0.9rem' }}>All 5 missions have been completed. Final standings:</div>
      </motion.div>

      <motion.div className="card" style={{ maxWidth: 550, width: '100%' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="label t-gold" style={{ marginBottom: 16 }}>🏅 FINAL LEADERBOARD</div>
        {finalLeaderboard.map((e, i) => (
          <motion.div key={e.usn}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
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
    </div>
  );
}
