'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import QuestionBankPanel from '@/components/admin/QuestionBankPanel';

const LEVELS = [
  { id: 1, icon: '🔤', label: 'SCRAMBLE/RIDDLES' },
  { id: 2, icon: '🛰️', label: 'IMAGE GUESS' },
  { id: 3, icon: '🔐', label: 'EMOJI HANGMAN' },
  { id: 4, icon: '⚡', label: 'RAPID FIRE' },
  { id: 5, icon: '🌍', label: 'AUCTION' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useGameStore();
  const {
    init, destroy, connected, phase, adminStats, leaderboard,
    adminStartLevel, adminPause, adminReset, adminBroadcast,
    timerEndTime, paused, adminTimerAdd10, adminTimerPauseResume
  } = useGameSyncStore();
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [localRemaining, setLocalRemaining] = useState(0);

  useEffect(() => {
    let frameId: number;
    const tick = () => {
      const now = Date.now();
      const remainingMs = Math.max(0, timerEndTime - now);
      setLocalRemaining(Math.ceil(remainingMs / 1000));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [timerEndTime]);

  useEffect(() => {
    if (!user || (!user.isAdmin && user.usn !== 'SUPER_ADMIN')) { router.replace('/'); return; }
    init();
    return () => { destroy(); };
  }, [user, router, init, destroy]);

  const handleLogout = async () => {
    SFX.click();
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    logout(); router.replace('/');
  };

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    SFX.click();
    adminBroadcast(broadcastMsg.trim());
    toast('Broadcast sent.', 'ok');
    setBroadcastMsg('');
  };

  const canStartLevel = phase === 'idle' || phase === 'level_complete';
  const nextLevel = (adminStats?.currentLevel ?? 0) + (phase === 'level_complete' ? 1 : phase === 'idle' ? 1 : 0);

  if (!user || (!user.isAdmin && user.usn !== 'SUPER_ADMIN')) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--danger)', background: 'rgba(3,7,15,0.96)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="font-orb t-danger" style={{ fontSize: '1.05rem', letterSpacing: 1 }}>🛡️ MISSION CONTROL</div>
            <motion.div animate={{ opacity: connected ? [0.5, 1, 0.5] : 1 }} transition={{ duration: 1.5, repeat: connected ? Infinity : 0 }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? 'var(--accent2)' : 'var(--danger)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{connected ? 'LINK SECURE' : 'OFFLINE'}</span>
          </div>
          <motion.button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
            onClick={handleLogout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>← Disconnect</motion.button>
        </motion.div>

        <div className="page-content" style={{ gap: 20 }}>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, width: '100%', maxWidth: 900 }}>
            {[
              { label: 'PHASE', val: phase.toUpperCase().replace('_', ' '), color: 'var(--accent)' },
              { label: 'PLAYERS', val: adminStats?.totalPlayers ?? 0, color: 'var(--accent2)' },
              { label: 'SOCKETS', val: adminStats?.connectedCount ?? 0, color: 'var(--accent)' },
              { label: 'LEVEL', val: adminStats?.currentLevel ?? '-', color: 'var(--warning)' },
              { label: 'QUESTION', val: adminStats ? `${adminStats.currentQIndex + 1}/${adminStats.totalQuestions || '-'}` : '-', color: 'var(--text)' },
              { label: 'ANSWERED', val: adminStats?.answeredCount ?? 0, color: 'var(--gold)' },
            ].map(s => (
              <div key={s.label} className="card card-sm" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--text2)' }}>{s.label}</div>
                <div className="font-orb" style={{ fontSize: '1rem', color: s.color, marginTop: 4 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Game Control */}
          <motion.div className="card" style={{ maxWidth: 900, width: '100%', borderTop: '2px solid var(--accent)' }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="label t-accent" style={{ marginBottom: 16 }}>🎮 GAME CONTROL</div>

            {localRemaining > 0 && (
              <div style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 10 }}>
                ⏱ Timer: {localRemaining}s {paused ? '(PAUSED)' : ''}
                <button className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => adminTimerAdd10()}>+10s</button>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {LEVELS.map(lv => (
                <motion.button key={lv.id} className="btn btn-outline"
                  disabled={!canStartLevel}
                  style={{
                    padding: '10px 16px', fontSize: '0.8rem',
                    borderColor: canStartLevel && lv.id === nextLevel ? 'var(--accent2)' : 'var(--border)',
                    opacity: canStartLevel ? 1 : 0.5,
                  }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => { SFX.click(); adminStartLevel(lv.id); toast(`Starting Level ${lv.id}`, 'ok'); }}>
                  {lv.icon} LVL {lv.id}
                </motion.button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
                onClick={() => { SFX.click(); adminTimerPauseResume(); }} whileHover={{ scale: 1.04 }}>
                {paused ? '▶ RESUME TIMER/GAME' : '⏸ PAUSE TIMER/GAME'}
              </motion.button>
              <motion.button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                onClick={() => { if (!confirm('Reset entire game?')) return; SFX.click(); adminReset(); toast('Game reset', 'inf'); }}
                whileHover={{ scale: 1.04 }}>🔄 RESET GAME</motion.button>
            </div>
          </motion.div>

          {/* Question Bank */}
          <QuestionBankPanel />

          {/* Broadcast */}
          <motion.div className="card" style={{ maxWidth: 900, width: '100%', borderTop: '2px solid var(--warning)' }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="label t-warning" style={{ marginBottom: 10 }}>📢 GLOBAL BROADCAST</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Message all players..."
                value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBroadcast()} />
              <button className="btn btn-primary" onClick={handleBroadcast}>SEND</button>
            </div>
          </motion.div>

          {/* Live Leaderboard */}
          <motion.div className="card" style={{ maxWidth: 900, width: '100%', borderTop: '2px solid var(--gold)' }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="label t-gold" style={{ marginBottom: 16 }}>🏆 LIVE LEADERBOARD</div>
            {leaderboard.length === 0 ? (
              <div className="t-center t-muted" style={{ padding: '20px 0' }}>No players yet.</div>
            ) : (
              leaderboard.slice(0, 20).map((e, i) => (
                <div key={e.usn} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 6 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="font-orb" style={{ color: i < 3 ? 'var(--gold)' : 'var(--text2)', width: 28, fontSize: '0.85rem' }}>#{e.rank}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{e.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>{e.usn}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>+{e.currentLevelScore}</span>
                    <span className="font-orb t-gold" style={{ fontSize: '1rem' }}>{e.totalScore}</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
