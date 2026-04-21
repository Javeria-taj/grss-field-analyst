'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';
import { getTitle, getTotalScore } from '@/lib/scoring';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import DATA, { LEVEL_INTROS } from '@/lib/gameData';

const LEVEL_CONFIG = [
  { id: 1, icon: '🔤', label: 'TRAINING\nMISSION', color: '#38bdf8', glow: 'rgba(56,189,248,0.25)' },
  { id: 2, icon: '🛰️', label: 'INTEL\nGATHERING', color: '#4ade80', glow: 'rgba(74,222,128,0.25)' },
  { id: 3, icon: '🔐', label: 'CODE\nBREAKING', color: '#818cf8', glow: 'rgba(129,140,248,0.25)' },
  { id: 4, icon: '⚡', label: 'RAPID\nASSESSMENT', color: '#fb923c', glow: 'rgba(251,146,60,0.25)' },
  { id: 5, icon: '🌍', label: 'CORE\nSIMULATION', color: '#f472b6', glow: 'rgba(244,114,182,0.25)' },
];

const POWERUP_ICONS = ['💡', '⏭', '❄️'];
const POWERUP_LABELS = ['HINT', 'SKIP', 'FREEZE'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, scores, powerups, unlocked, completed, logout, telemetry } = useGameStore();
  const [shakeLevel, setShakeLevel] = useState<number | null>(null);
  const [showTelemetry, setShowTelemetry] = useState(false);

  const total = getTotalScore(scores);
  const title = getTitle(total);

  const { init } = useLeaderboardStore();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else if (user.usn === 'SUPER_ADMIN' || user.isAdmin) {
      router.replace('/admin');
    } else {
      init();
    }
  }, [user, router, init]);

  const handleLevelClick = (id: number) => {
    SFX.click();
    if (!unlocked.includes(id)) {
      setShakeLevel(id);
      toast('🔒 Complete previous missions first!', 'err');
      setTimeout(() => setShakeLevel(null), 500);
      return;
    }
    router.push(`/mission/${id}/intro`);
  };

  const handleLogout = async () => {
    SFX.click();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { /* best-effort — proceed regardless */ }
    logout();
    router.replace('/');
  };

  if (!user) return null;

  const powerupValues = [powerups.hint, powerups.skip, powerups.freeze];

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <div className="earth-deco" />

      <div style={{ position: 'relative', zIndex: 3 }}>
        {/* Top Nav */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          style={{
            padding: '12px 16px',
            background: 'rgba(3,7,15,0.96)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            backdropFilter: 'blur(12px)',
            position: 'sticky', top: 0, zIndex: 50,
          }}
        >
          <div style={{ flex: '1 1 auto' }}>
            <div className="font-orb t-accent" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {user.name.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text2)' }}>{user.usn}</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right', minWidth: '85px' }}>
              <div className="label" style={{ fontSize: '0.55rem' }}>TOTAL SCORE</div>
              <motion.div
                key={total}
                className="hud-score font-orb"
                style={{ fontSize: '1.1rem', color: 'var(--accent2)' }}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {total.toLocaleString()}
              </motion.div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {completed.includes(5) && (
                <motion.button
                  className="btn btn-outline btn-sm"
                  onClick={() => { SFX.click(); router.push('/leaderboard'); }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ borderColor: 'var(--gold)', color: 'var(--gold)', padding: '6px 10px', fontSize: '0.7rem' }}
                >
                  🏆 <span className="hide-tablet">Leaderboard</span>
                </motion.button>
              )}

              <motion.button
                className="btn btn-outline btn-sm"
                onClick={() => { SFX.click(); SFX.dataStream(); setShowTelemetry(true); }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                style={{ borderColor: 'var(--accent2)', color: 'var(--accent2)', padding: '6px 10px', fontSize: '0.7rem' }}
              >
                📊 <span className="hide-tablet">Telemetry</span>
              </motion.button>

              <motion.button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '6px 10px', fontSize: '0.7rem' }}
              >
                ↩ <span className="hide-tablet">Logout</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="page-content" style={{ justifyContent: 'center', gap: 18 }}>

          {/* Mission briefing */}
          <motion.div
            className="t-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 4 }}
          >
            <div className="font-orb t-accent" style={{ fontSize: '1.05rem' }}>MISSION BRIEFING</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text2)', maxWidth: 480, margin: '7px auto 0' }}>
              Earth is under threat. Complete all 5 missions as a GRSS Field Analyst.
              Speed, accuracy and strategy determine your rank.
            </div>
          </motion.div>

          {/* Level Map */}
          <motion.div
            className="card"
            style={{ maxWidth: 600, width: '100%', padding: '20px 16px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260 }}
          >
            <div className="label t-center" style={{ marginBottom: 16 }}>⚡ MISSION MAP</div>
            <div className="lv-map" id="levelMap">
              {LEVEL_CONFIG.map((lv, idx) => {
                const isDone = completed.includes(lv.id);
                const isOpen = unlocked.includes(lv.id);
                const stateClass = isDone ? 'done' : isOpen ? 'open' : 'lock';
                const isShaking = shakeLevel === lv.id;
                return (
                  <div key={lv.id} className="lv-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <motion.div
                      className="lv-node"
                      role="button"
                      aria-label={`Mission ${lv.id}: ${lv.label.replace('\n', ' ')}`}
                      aria-disabled={!isOpen}
                      onClick={() => handleLevelClick(lv.id)}
                      onMouseEnter={() => isOpen && SFX.hover()}
                      whileHover={isOpen ? { scale: 1.1 } : {}}
                      whileTap={isOpen ? { scale: 0.9 } : {}}
                      animate={isShaking ? { x: [-8, 8, -8, 8, 0] } : {}}
                      transition={isShaking ? { duration: 0.4 } : { type: 'spring', stiffness: 400 }}
                    >
                      <motion.div
                        className={`lv-icon ${stateClass}`}
                        style={isDone ? { boxShadow: `0 0 20px ${lv.glow}` } : isOpen ? { boxShadow: `0 0 20px ${lv.glow}` } : {}}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: isOpen || isDone ? 1 : 0.35, scale: 1 }}
                        transition={{ delay: idx * 0.08, type: 'spring', stiffness: 380 }}
                      >
                        {isDone ? '✅' : isOpen ? lv.icon : '🔒'}
                      </motion.div>
                      <div className="lv-label-group">
                        <div style={{ fontSize: '0.62rem', color: 'var(--text2)', textAlign: 'center', fontWeight: 600 }}>
                          LVL {lv.id}
                        </div>
                        <div style={{ fontSize: '0.58rem', textAlign: 'center', color: isDone ? lv.color : 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {lv.label.replace('\n', ' ')}
                        </div>
                        {isDone && (
                          <motion.div
                            className="font-orb"
                            style={{ fontSize: '0.6rem', color: 'var(--gold)', textAlign: 'center', marginTop: 1 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {scores[lv.id]}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    {idx < LEVEL_CONFIG.length - 1 && (
                      <motion.div
                        className={`lv-connector ${isDone ? 'done' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Power-up arsenal */}
          <motion.div
            className="card card-sm"
            style={{ maxWidth: 440, width: '100%' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <div className="label t-center" style={{ marginBottom: 11 }}>⚡ POWER-UP ARSENAL</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {POWERUP_ICONS.map((icon, i) => (
                <motion.div
                  key={POWERUP_LABELS[i]}
                  style={{ textAlign: 'center', padding: 11, background: 'rgba(0,200,255,.05)', border: '1px solid var(--border)', borderRadius: 9 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 + i * 0.07 }}
                >
                  <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', margin: '3px 0' }}>{POWERUP_LABELS[i]}</div>
                  <div className="font-orb t-accent2">{powerupValues[i]}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Current rank */}
          <motion.div
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="label">CURRENT RANK</div>
            <motion.div
              className="title-badge-big revealed"
              style={{ fontSize: '0.95rem', marginTop: 8 }}
              whileHover={{ scale: 1.04 }}
            >
              {title.toUpperCase()}
            </motion.div>
          </motion.div>

        </div>
      </div>
      {/* MISSION TELEMETRY MODAL */}
      <AnimatePresence>
        {showTelemetry && (
          <motion.div
            className="center-col"
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(3,7,15,0.7)', backdropFilter: 'blur(10px)',
              padding: 16
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTelemetry(false)}
          >
            <motion.div
              className="card"
              style={{
                maxWidth: 800, width: '100%', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                border: '1px solid var(--border-accent)',
                boxShadow: 'var(--glow), var(--shadow-lg)',
                padding: '28px 24px', overflow: 'hidden',
                background: 'rgba(5, 10, 22, 0.95)'
              }}
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: '2.4rem' }}>📊</div>
                  <div>
                    <div className="font-orb t-accent" style={{ fontSize: '1.3rem', letterSpacing: '1px' }}>AGENT DOSSIER</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>Satellite telemetry log for {user?.name}</div>
                  </div>
                </div>
                <motion.button
                  className="btn btn-outline btn-sm"
                  aria-label="Close Telemetry Feed"
                  onClick={() => { SFX.click(); setShowTelemetry(false); }}
                  whileHover={{ scale: 1.05 }}
                  style={{ border: '1px solid var(--danger)', color: 'var(--danger)' }}
                >
                  Terminate Connection [ESC]
                </motion.button>
              </div>

              {/* Stats Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                   { label: 'AVG ACCURACY', val: telemetry.length ? `${Math.round((telemetry.filter((r: any) => r.isCorrect).length / telemetry.length) * 100)}%` : '0%', color: 'var(--accent2)' },
                   { label: 'TOTAL SESSIONS', val: telemetry.length, color: 'var(--accent)' },
                   { label: 'MISSIONS REACHED', val: completed.length, color: 'var(--gold)' }
                ].map(s => (
                  <div key={s.label} className="card card-sm" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                    <div className="label" style={{ fontSize: '0.6rem' }}>{s.label}</div>
                    <div className="font-orb" style={{ fontSize: '1.2rem', color: s.color, marginTop: 4 }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Feed Content */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }} className="custom-scroll">
                {telemetry.length === 0 ? (
                  <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: 16 }}>📡</div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>No telemetry data captured. Complete missions to populate dossier.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {telemetry.slice().reverse().map((rec: any, i: number) => (
                      <motion.div 
                        key={i} 
                        className={`card card-sm ${rec.isCorrect ? 'card-active-border' : 'card-danger'}`}
                        style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: 16, alignItems: 'center' }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                         <div style={{ textAlign: 'center', minWidth: 60 }}>
                            <div className="font-orb t-accent" style={{ fontSize: '0.8rem' }}>LVL {rec.level}</div>
                            <div className="badge badge-purple" style={{ fontSize: '0.55rem', marginTop: 4 }}>INTEL {i+1}</div>
                         </div>
                         <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{rec.question}</div>
                            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                               <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>⏱ {rec.timeTaken}s</div>
                               <div style={{ fontSize: '0.7rem', fontWeight: 700, color: rec.isCorrect ? 'var(--accent2)' : 'var(--danger)' }}>
                                 {rec.isCorrect ? '✓ ANALYZED' : '✗ FAILED'}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 24, padding: '12px 18px', background: 'rgba(0,180,240,0.05)', borderRadius: '12px', border: '1px solid rgba(0,180,240,0.1)' }}>
                 <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontFamily: 'var(--font-orbitron)', letterSpacing: '1px' }}>
                    &gt; ENCRYPTED SESSION LOG COMPLETE // 256-BIT SECURITY ACTIVE
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

