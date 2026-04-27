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

        {myAnswer && (
          <div style={{ 
            borderTop: '1px solid var(--border)', 
            paddingTop: 16, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 10 
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>YOUR MISSION STATUS:</span>
            <span className="font-orb" style={{ 
              fontSize: '0.9rem', 
              color: myAnswer.correct ? 'var(--accent2)' : 'var(--danger)',
              fontWeight: 700 
            }}>
              {myAnswer.correct ? `SUCCESS (+${myAnswer.score})` : 'FAILED'}
            </span>
          </div>
        )}
      </motion.div>
      <ReactionRow />
    </div>
  );
}
