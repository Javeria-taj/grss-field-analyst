'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import Toast from '@/components/ui/Toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useGameStore();
  const { entries, connected, init, socket } = useLeaderboardStore();
  
  const [activeConnections, setActiveConnections] = useState(0);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  useEffect(() => {
    // Auth guard with self-healing for legacy cache
    if (!user || (!user.isAdmin && user.usn !== 'SUPER_ADMIN')) {
      router.replace('/');
      return;
    }
    
    // Connect to sockets
    init();
    
    // Cleanup is handled when tab closes or we log out. We won't destroy immediately so stats stay.
  }, [user, router, init]);

  useEffect(() => {
    if (!socket) return;
    
    const handleStats = (data: { connectedCount: number }) => {
      setActiveConnections(data.connectedCount);
    };
    
    socket.on('admin_stats', handleStats);
    
    return () => {
      socket.off('admin_stats', handleStats);
    };
  }, [socket]);

  const handleLogout = () => {
    SFX.click();
    logout();
    router.replace('/');
  };

  const handleResetBoard = () => {
    if (!confirm('Are you sure you want to completely RESET the leaderboard?')) return;
    SFX.click();
    socket?.emit('admin_reset_board');
    toast('Leaderboard reset command sent.', 'ok');
  };

  const handleDeleteScore = (usn: string) => {
    SFX.click();
    if (!confirm(`Delete score for USN: ${usn}?`)) return;
    socket?.emit('admin_delete_score', usn);
    toast(`Deleted score for ${usn}`, 'inf');
  };

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    SFX.click();
    socket?.emit('admin_global_broadcast', broadcastMsg.trim());
    toast('Global broadcast sent to all agents.', 'ok');
    setBroadcastMsg('');
  };

  if (!user || !user.isAdmin) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StarfieldCanvas />
      <Toast />
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
            borderBottom: '1px solid var(--danger)',
            background: 'rgba(3,7,15,0.96)',
            backdropFilter: 'blur(12px)',
            position: 'sticky', top: 0, zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="font-orb t-danger" style={{ fontSize: '1.05rem', letterSpacing: 1 }}>🛡️ SUPER ADMIN CENTER</div>
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
              {connected ? 'LINK SECURE' : 'OFFLINE'}
            </span>
          </div>
          <motion.button
            className="btn btn-outline btn-sm"
            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
            onClick={handleLogout}
            whileHover={{ scale: 1.04, background: 'rgba(251,113,133,0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            ← Disconnect
          </motion.button>
        </motion.div>

        <div className="page-content" style={{ gap: 20 }}>
          {/* Top Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, width: '100%', maxWidth: 900 }}>
            {/* Server Stats */}
            <motion.div 
              className="card card-glow" 
              style={{ borderTop: '2px solid var(--accent)' }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="label t-accent">📡 LIVE TELEMETRY</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
                <span className="font-orb" style={{ fontSize: '2.4rem', color: 'var(--accent)' }}>{activeConnections}</span>
                <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Active Sockets</span>
              </div>
            </motion.div>

            {/* Broadcast Terminal */}
            <motion.div 
              className="card" 
              style={{ borderTop: '2px solid var(--warning)' }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="label t-warning">📢 GLOBAL BROADCAST</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input 
                  className="input" 
                  style={{ flex: 1 }} 
                  placeholder="Intercept all HUDs..." 
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBroadcast()}
                />
                <button className="btn btn-primary" onClick={handleBroadcast}>SEND</button>
              </div>
            </motion.div>
          </div>

          {/* Personnel Roster */}
          <motion.div 
            className="card" 
            style={{ width: '100%', maxWidth: 900, borderTop: '2px solid var(--danger)' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="label t-danger">🛰️ GLOBAL PERSONNEL ROSTER</div>
              <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleResetBoard}>
                ⚠️ WIPE ROSTER
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.length === 0 ? (
                <div className="t-center t-muted" style={{ padding: '20px 0' }}>No agents registered.</div>
              ) : (
                entries.map((req, i) => (
                  <div key={req.usn} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center', width: 44, borderRight: '1px solid var(--border)', paddingRight: 10 }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>RANK</div>
                        <div className="font-orb t-muted" style={{ fontSize: '1.2rem' }}>#{i+1}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--white)' }}>{req.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>USN: {req.usn}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>POINTS</div>
                        <div className="font-orb t-gold" style={{ fontSize: '1.1rem' }}>{req.score}</div>
                      </div>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        onClick={() => handleDeleteScore(req.usn)}
                      >
                        REVOKE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
