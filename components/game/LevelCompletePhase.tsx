'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function LevelCompletePhase() {
  const { levelCompleteData, leaderboard } = useGameSyncStore();
  if (!levelCompleteData) return null;
  const { level, levelStats } = levelCompleteData;

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 20, minHeight: '70vh' }}>
      <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div style={{ fontSize: '3rem' }}>🎖️</div>
        <div className="font-orb t-accent2" style={{ fontSize: '1.4rem', marginTop: 8 }}>MISSION {level} COMPLETE</div>
        <div style={{ color: 'var(--text2)', marginTop: 8, fontSize: '0.85rem' }}>
          Accuracy: {levelStats.avgAccuracy}% across {levelStats.totalQuestions} questions
        </div>
        {levelStats.topScorer && (
          <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--gold)' }}>
            🏆 Top: {levelStats.topScorer.name} (+{levelStats.topScorer.score} pts)
          </div>
        )}
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text2)' }}>
          Waiting for Mission Control to start next level...
        </motion.div>
      </motion.div>

      <motion.div className="card" style={{ maxWidth: 500, width: '100%' }}
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="label t-gold" style={{ marginBottom: 12 }}>🏆 CUMULATIVE LEADERBOARD</div>
        {leaderboard.slice(0, 15).map((e, i) => (
          <div key={e.usn} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="font-orb" style={{ color: i < 3 ? 'var(--gold)' : 'var(--text2)', width: 28, fontSize: '0.85rem' }}>#{e.rank}</span>
              <span style={{ fontSize: '0.88rem' }}>{e.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>+{e.currentLevelScore}</span>
              <span className="font-orb t-gold" style={{ fontSize: '0.95rem' }}>{e.totalScore}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
