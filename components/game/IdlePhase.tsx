'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import ReactionRow from './ReactionRow';

export default function IdlePhase() {
  const { connected, leaderboard } = useGameSyncStore();

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 24, minHeight: '70vh' }}>
      <motion.div
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          style={{ fontSize: '4rem', marginBottom: 16 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🛰️
        </motion.div>
        <div className="font-orb t-accent" style={{ fontSize: '1.4rem', letterSpacing: 2 }}>
          STANDBY MODE
        </div>
        <div style={{ color: 'var(--text2)', fontSize: '0.95rem', marginTop: 12, maxWidth: 400, margin: '12px auto' }}>
          Waiting for Mission Control to initiate the next operation. Stay connected — the game will begin shortly.
        </div>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ marginTop: 20, fontSize: '0.8rem', color: 'var(--accent)' }}
        >
          ● {connected ? 'CONNECTED TO HQ' : 'RECONNECTING...'}
        </motion.div>
        <ReactionRow />
      </motion.div>

    </div>
  );
}
