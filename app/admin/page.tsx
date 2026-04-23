'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import QuestionBankPanel from '@/components/admin/QuestionBankPanel';
import QuestionManagerModal from '@/components/admin/QuestionManagerModal';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';

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
    timerEndTime, paused, adminTimerAdd10, adminTimerPauseResume, adminUpdateLevelLimit
  } = useGameSyncStore();
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [localRemaining, setLocalRemaining] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <StarfieldCanvas />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="font-orb t-accent" style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: 2 }}>COMMAND CENTER</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text2)', marginTop: 2 }}>MISSION OVERSEER PORTAL · {connected ? '🟢 ONLINE' : '🔴 OFFLINE'}</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>LOGOUT</button>
          </div>
        </motion.div>

        <div className="center-col" style={{ flex: 1, padding: 24, gap: 24, justifyContent: 'flex-start' }}>
          
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

            <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', display: 'grid', gap: 10, marginBottom: 16 }}>
              {LEVELS.map(lv => {
                const limit = adminStats?.levelLimits?.[lv.id] ?? (lv.id === 1 || lv.id === 4 ? 10 : 5);
                return (
                  <div key={lv.id} style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 8, border: '1px solid var(--border)' }}>
                    <motion.button className="btn btn-outline"
                      disabled={!canStartLevel}
                      style={{
                        flex: 1, padding: '8px 12px', fontSize: '0.75rem',
                        borderColor: canStartLevel && lv.id === nextLevel ? 'var(--accent2)' : 'transparent',
                        opacity: canStartLevel ? 1 : 0.5,
                        textAlign: 'left', justifyContent: 'flex-start'
                      }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { SFX.click(); adminStartLevel(lv.id); toast(`Starting Level ${lv.id}`, 'ok'); }}>
                      {lv.icon} LVL {lv.id}
                    </motion.button>
                    {lv.id < 5 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 8 }}>
                        <span style={{ fontSize: '0.5rem', color: 'var(--text2)', marginBottom: 2 }}>Qs LIMIT</span>
                        <input type="number" min={1} max={50} 
                          className="input"
                          style={{ width: 50, padding: '2px 4px', fontSize: '0.75rem', textAlign: 'center', border: '1px solid var(--accent)' }}
                          value={limit}
                          onChange={e => adminUpdateLevelLimit(lv.id, parseInt(e.target.value) || 1)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
               <motion.button className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }}
                 onClick={() => { SFX.click(); setIsMenuOpen(true); }} whileHover={{ scale: 1.02 }}>
                 📋 OPEN QUESTION MENU
               </motion.button>
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
            <div className="label t-warning" style={{ marginBottom: 16 }}>📡 GLOBAL BROADCAST</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" placeholder="Emergency announcement..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBroadcast()} />
              <button className="btn btn-primary" onClick={handleBroadcast}>SEND</button>
            </div>
          </motion.div>

          {/* Leaderboard Slice */}
          <motion.div className="card" style={{ maxWidth: 900, width: '100%', borderTop: '2px solid var(--accent2)' }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="label t-accent2" style={{ marginBottom: 16 }}>📊 LIVE LEADERS (TOP 20)</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {leaderboard.length === 0 ? (
                <div className="t-muted" style={{ fontSize: '0.8rem' }}>No data yet.</div>
              ) : (
                leaderboard.slice(0, 20).map((e, i) => (
                  <div key={e.usn} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span className="t-accent">#{i + 1}</span>
                      <span>{e.name}</span>
                      <span className="t-muted">({e.usn})</span>
                    </div>
                    <div className="font-orb t-accent2" style={{ fontWeight: 700 }}>{e.totalScore}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <QuestionManagerModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
