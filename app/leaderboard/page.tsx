'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { getTitle } from '@/lib/gameData';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useGameStore();
  const { leaderboard, init, destroy, connected } = useGameSyncStore();

  useEffect(() => {
    if (!user) { router.replace('/'); return; }
    init();
    return () => { destroy(); };
  }, [user, router, init, destroy]);

  if (!user) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3 }}>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ padding: '14px 20px', background: 'rgba(3,7,15,0.96)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div className="font-orb t-gold" style={{ fontSize: '1.1rem' }}>🏆 GLOBAL LEADERBOARD</div>
          <button className="btn btn-outline btn-sm" onClick={() => router.push('/dashboard')}>← BACK</button>
        </motion.div>

        <div className="page-content" style={{ gap: 12, paddingTop: 20 }}>
          <div style={{ maxWidth: 600, width: '100%' }}>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text2)', padding: 40 }}>No scores yet.</div>
            ) : (
              leaderboard.map((e, i) => (
                <motion.div key={e.usn} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', marginBottom: 8, borderRadius: 10,
                    background: i < 3 ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                    border: i < 3 ? '1px solid rgba(255,215,0,0.15)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span className="font-orb" style={{ fontSize: '1rem', color: i < 3 ? 'var(--gold)' : 'var(--text2)', width: 32 }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${e.rank}`}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>{e.usn} · {getTitle(e.totalScore)}</div>
                    </div>
                  </div>
                  <div className="font-orb t-gold" style={{ fontSize: '1.1rem' }}>{e.totalScore.toLocaleString()}</div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
