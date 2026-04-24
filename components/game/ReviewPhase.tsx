'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import ReactionRow from './ReactionRow';

export default function ReviewPhase() {
  const { reviewData, myAnswer } = useGameSyncStore();
  if (!reviewData) return null;
  const s = reviewData.stats;

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 20, minHeight: '70vh' }}>
      <motion.div className="card" style={{ maxWidth: 550, width: '100%', textAlign: 'center' }}
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text2)', marginBottom: 12 }}>CORRECT ANSWER</div>
        <div className="font-orb t-accent2" style={{ fontSize: '1.5rem', marginBottom: 12 }}>{reviewData.correctAnswer}</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>{reviewData.explanation}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div className="card card-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text2)' }}>ANSWERED</div>
            <div className="font-orb t-accent" style={{ fontSize: '1rem' }}>{s.answeredCount}/{s.totalPlayers}</div>
          </div>
          <div className="card card-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text2)' }}>CORRECT</div>
            <div className="font-orb t-accent2" style={{ fontSize: '1rem' }}>{s.correctCount}</div>
          </div>
          <div className="card card-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text2)' }}>AVG TIME</div>
            <div className="font-orb t-warning" style={{ fontSize: '1rem' }}>{s.avgTimeUsed}s</div>
          </div>
        </div>
      </motion.div>
      <ReactionRow />
    </div>
  );
}
