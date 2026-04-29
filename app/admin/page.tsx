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
import AdminLiveView from '@/components/admin/AdminLiveView';

const LEVELS = [
  { id: 1, icon: '🔤', label: 'SCRAMBLE/RIDDLES' },
  { id: 2, icon: '🛰️', label: 'IMAGE GUESS' },
  { id: 3, icon: '🔐', label: 'EMOJI HANGMAN' },
  { id: 4, icon: '⚡', label: 'RAPID FIRE' },
  { id: 5, icon: '🌍', label: 'AUCTION' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, _hasHydrated, rehydrateFromCookie } = useGameStore();
  const {
    init, destroy, connected, phase, adminStats, leaderboard,
    adminStartLevel, adminPause, adminReset, adminBroadcast,
    timerEndTime, paused, adminTimerAdd10, adminTimerPauseResume, adminUpdateLevelLimit,
    adminForceEndQuestion, adminKickPlayer, adminLiveStats, adminTriggerAnomaly, adminTriggerScenario
  } = useGameSyncStore();
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [localRemaining, setLocalRemaining] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

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

  // Session recovery for admin (same pattern as dashboard)
  useEffect(() => {
    if (!_hasHydrated) return;
    if (user) { setSessionChecked(true); return; }
    rehydrateFromCookie().finally(() => setSessionChecked(true));
  }, [_hasHydrated, user, rehydrateFromCookie]);

  useEffect(() => {
    if (!sessionChecked) return;
    if (!user || (!user.isAdmin && user.usn !== 'SUPER_ADMIN')) { router.replace('/'); return; }
    init();
    return () => { destroy(); };
  }, [sessionChecked, user, router, init, destroy]);

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

  if (!sessionChecked || !user || (!user.isAdmin && user.usn !== 'SUPER_ADMIN')) {
    return (
      <div style={{
        position: 'relative', zIndex: 1, minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '3rem' }}
        >
          🛰️
        </motion.div>
        <div className="font-orb" style={{ color: 'var(--accent)', fontSize: '0.85rem', letterSpacing: 2 }}>
          RESTORING SESSION…
        </div>
      </div>
    );
  }

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
            <a href="/api/admin/export" download className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>REPORT (.CSV)</a>
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

            {/* Control Row 1: Core Operations */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
               <motion.button className="btn btn-primary btn-sm" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                 onClick={() => { SFX.click(); setIsMenuOpen(true); }} whileHover={{ scale: 1.02 }}>
                 📋 OPEN QUESTION MENU
               </motion.button>
               <div style={{ flex: 1, minWidth: 16 }} /> {/* Spacer */}
               <motion.button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
                 onClick={() => { SFX.click(); adminTimerPauseResume(); }} whileHover={{ scale: 1.04 }}>
                 {paused ? '▶ RESUME TIMER/GAME' : '⏸ PAUSE TIMER/GAME'}
               </motion.button>
               <motion.button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                 onClick={() => { if (!confirm('Reset entire game?')) return; SFX.click(); adminReset(); toast('Game reset', 'inf'); }}
                 whileHover={{ scale: 1.04 }}>🔄 RESET GAME</motion.button>
            </div>

            {/* Control Row 2: Advanced Actions & Scenarios */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <motion.button className="btn btn-outline btn-sm" 
                disabled={phase !== 'question_active'}
                style={{ 
                  borderColor: 'var(--danger)', color: 'var(--danger)', 
                  background: phase === 'question_active' ? 'rgba(251,113,133,0.1)' : 'transparent',
                  opacity: phase === 'question_active' ? 1 : 0.5
                }}
                onClick={() => { if(confirm('⚠️ FORCE END CURRENT QUESTION?')) adminForceEndQuestion(); }}
                whileHover={phase === 'question_active' ? { scale: 1.04 } : {}}>
                ⚠️ FORCE END QUESTION
              </motion.button>
              
              <motion.button className="btn btn-outline btn-sm" 
                disabled={phase === 'anomaly_active' || phase === 'idle' || phase === 'game_over'}
                style={{ 
                  borderColor: '#ff0033', color: '#ff0033', 
                  background: 'rgba(255,0,51,0.1)',
                  opacity: (phase === 'anomaly_active' || phase === 'idle' || phase === 'game_over') ? 0.5 : 1
                }}
                onClick={() => { if(confirm('🚀 INJECT ZERO-DAY ANOMALY?\nThis will sabotage all players immediately.')) adminTriggerAnomaly(); }}
                whileHover={{ scale: 1.04 }}>
                💀 TRIGGER ZERO-DAY
              </motion.button>

              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} className="hidden sm:block" />

              <div style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: 1, fontWeight: 700 }}>SCENARIOS:</div>
              <button className="btn btn-outline btn-sm" 
                style={{ borderColor: '#f97316', color: '#f97316', fontSize: '0.7rem' }}
                onClick={() => adminTriggerScenario('solar_flare')}>🔥 SOLAR FLARE</button>
              <button className="btn btn-outline btn-sm" 
                style={{ borderColor: '#a855f7', color: '#a855f7', fontSize: '0.7rem' }}
                onClick={() => adminTriggerScenario('data_corruption')}>☣️ DATA CORRUPTION</button>
            </div>
          </motion.div>

          {/* Live Answer Distribution */}
          {phase === 'question_active' && adminLiveStats && (
            <motion.div className="card" style={{ maxWidth: 900, width: '100%', borderTop: '2px solid var(--accent2)' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="label t-accent2" style={{ marginBottom: 12 }}>👁️ LIVE ANSWER DISTRIBUTION</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(adminLiveStats.distribution).map(([ans, count]) => {
                  const pct = Math.min(100, (count / (adminStats?.totalPlayers || 1)) * 100);
                  return (
                    <div key={ans} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 120, fontSize: '0.75rem', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ans}</div>
                      <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          style={{ height: '100%', background: 'var(--accent2)' }} />
                      </div>
                      <div style={{ width: 40, fontSize: '0.75rem', textAlign: 'right' }}>{count}</div>
                    </div>
                  );
                })}
                {Object.keys(adminLiveStats.distribution).length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text3)', padding: 10 }}>Waiting for first submission...</div>
                )}
              </div>
            </motion.div>
          )}

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

          {/* Operative Monitor */}
          <AdminLiveView />

          {/* Broadcast */}
        </div>
      </div>
      <QuestionManagerModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
