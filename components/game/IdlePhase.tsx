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

      {leaderboard.length > 0 && (
        <motion.div
          className="card"
          style={{ maxWidth: 500, width: '100%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="label t-gold" style={{ marginBottom: 12 }}>🏆 CURRENT STANDINGS</div>
          {leaderboard.slice(0, 10).map((e, i) => (
            <div key={e.usn} style={{
              display: 'flex', justifyContent: 'space-between', padding: '6px 0',
              borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <span style={{ color: i < 3 ? 'var(--gold)' : 'var(--text2)', fontSize: '0.85rem' }}>
                #{e.rank} {e.name}
              </span>
              <span className="font-orb t-accent2" style={{ fontSize: '0.85rem' }}>{e.totalScore}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
