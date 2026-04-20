'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';
import { SFX } from '@/lib/sfx';
import type { LeaderboardEntry } from '@/lib/types';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const RANK_COLORS: Record<number, string> = {
  1: 'rgba(255, 215, 0, 0.10)',
  2: 'rgba(192, 192, 192, 0.06)',
  3: 'rgba(205, 127, 50, 0.06)',
};

interface RankedEntry extends LeaderboardEntry {
  rank: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useGameStore();
  const { entries, connected, init, destroy } = useLeaderboardStore();

  useEffect(() => {
    init();
    return () => destroy();
  }, [init, destroy]);

  const lb: RankedEntry[] = [...entries]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="earth-deco" />

      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(3,7,15,0.96)',
            backdropFilter: 'blur(12px)',
            position: 'sticky', top: 0, zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="font-orb t-accent" style={{ fontSize: '1.05rem' }}>🏆 GLOBAL LEADERBOARD</div>
            <motion.div
              animate={{ opacity: connected ? [0.5, 1, 0.5] : 1 }}
              transition={{ duration: 1.5, repeat: connected ? Infinity : 0 }}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: connected ? 'var(--accent2)' : 'var(--danger)',
                boxShadow: connected ? '0 0 6px var(--accent2)' : 'none',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>
              {connected ? 'LIVE' : 'CONNECTING...'}
            </span>
          </div>
          <motion.button
            className="btn btn-outline btn-sm"
            onClick={() => { SFX.click(); router.push('/dashboard'); }}
            onMouseEnter={() => SFX.hover()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back
          </motion.button>
        </motion.div>

        <div className="page-content" style={{ gap: 8 }}>
          <div style={{ maxWidth: 600, width: '100%' }}>
            <AnimatePresence mode="popLayout">
              {lb.length === 0 ? (
                <motion.div
                  key="empty"
                  className="card t-center"
                  style={{ padding: 40 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.span
                    style={{ fontSize: '2rem', display: 'block', marginBottom: 10 }}
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    📡
                  </motion.span>
                  <div style={{ color: 'var(--text2)' }}>
                    {connected ? 'Waiting for mission data...' : 'Connecting to satellite...'}
                  </div>
                </motion.div>
              ) : (
                lb.map((entry, idx) => {
                  const isMe = user?.usn === entry.usn;
                  const isTop3 = entry.rank <= 3;
                  return (
                    <motion.div
                      key={entry.usn}
                      layout
                      className={`lb-row ${isMe ? 'me' : ''} ${entry.rank === 1 ? 'r1' : ''}`}
                      initial={{ opacity: 0, x: isMe ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.5), type: 'spring', stiffness: 300 }}
                      style={isTop3 ? { background: RANK_COLORS[entry.rank] } : {}}
                    >
                      <div className="lb-rank" style={entry.rank === 1 ? { color: 'var(--gold)', fontSize: '1.1rem' } : {}}>
                        {MEDALS[entry.rank] ?? `#${entry.rank}`}
                      </div>
                      <div className="lb-name-col">
                        <div className="lb-name">
                          {entry.name}
                          {isMe && <span className="badge badge-blue" style={{ marginLeft: 6 }}>YOU</span>}
                        </div>
                        <div className="lb-usn">{entry.usn}</div>
                      </div>
                      <motion.div
                        className="lb-score"
                        key={entry.score}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {entry.score.toLocaleString()}
                      </motion.div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>

            <div className="t-center t-muted" style={{ marginTop: 14, fontSize: '0.78rem' }}>
              Scores are live and persist across sessions. Play all 5 missions for a final score!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
