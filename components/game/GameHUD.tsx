'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function GameHUD({ user, connected, paused, onLogout }: {
  user: { name: string; usn: string };
  connected: boolean;
  paused: boolean;
  onLogout: () => void;
}) {
  const { timerRemaining, timerTotal, leaderboard, currentLevel, phase } = useGameSyncStore();
  const myEntry = leaderboard.find(e => e.usn === user.usn.toUpperCase());
  const pct = timerTotal > 0 ? (timerRemaining / timerTotal) * 100 : 0;
  const showTimer = phase === 'question_active' || phase === 'auction_active' || phase === 'disaster_active';

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        padding: '10px 16px', background: 'rgba(3,7,15,0.96)',
        borderBottom: '1px solid var(--border)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: 10,
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <motion.div
          animate={{ opacity: connected ? [0.5, 1, 0.5] : 1 }}
          transition={{ duration: 1.5, repeat: connected ? Infinity : 0 }}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: connected ? 'var(--accent2)' : 'var(--danger)',
            boxShadow: connected ? '0 0 6px var(--accent2)' : 'none',
          }}
        />
        <div>
          <div className="font-orb t-accent" style={{ fontSize: '0.85rem' }}>{user.name.toUpperCase()}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>{user.usn}</div>
        </div>
      </div>

      {paused && (
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="font-orb"
          style={{ color: 'var(--warning)', fontSize: '0.8rem', letterSpacing: 2 }}
        >
          ⏸ PAUSED
        </motion.div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {currentLevel > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text2)' }}>MISSION</div>
            <div className="font-orb t-accent" style={{ fontSize: '1rem' }}>{currentLevel}</div>
          </div>
        )}
        {showTimer && (
          <div style={{ width: 100 }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text2)', textAlign: 'center' }}>TIME</div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <motion.div
                style={{
                  height: '100%', borderRadius: 3,
                  background: pct > 30 ? 'var(--accent)' : pct > 10 ? 'var(--warning)' : 'var(--danger)',
                }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="font-orb" style={{ textAlign: 'center', fontSize: '0.85rem', color: timerRemaining <= 10 ? 'var(--danger)' : 'var(--text)' }}>
              {timerRemaining}s
            </div>
          </div>
        )}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text2)' }}>SCORE</div>
          <div className="font-orb t-gold" style={{ fontSize: '1.1rem' }}>{myEntry?.totalScore ?? 0}</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onLogout} style={{ fontSize: '0.65rem', padding: '4px 8px' }}>↩</button>
      </div>
    </motion.div>
  );
}
