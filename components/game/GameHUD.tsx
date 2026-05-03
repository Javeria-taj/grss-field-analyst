'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

export default function GameHUD({ user, connected, paused, onLogout }: {
  user: { name: string; usn: string; faction?: string };
  connected: boolean;
  paused: boolean;
  onLogout: () => void;
}) {
  const { timerEndTime, timerTotal, leaderboard, currentLevel, phase, myTotalScore, serverTimeOffset, myStreak } = useGameSyncStore();
  const myEntry = leaderboard.find(e => e.usn === user.usn.toUpperCase());
  
  // Real-time score: prioritize store state (immediate feedback) over leaderboard entries (throttled)
  const displayScore = myTotalScore > 0 ? myTotalScore : (myEntry?.totalScore ?? 0);
  
  const showTimer = phase === 'question_active' || phase === 'auction_active' || phase === 'disaster_active' || phase === 'level_intro';

  // Local butter-smooth timer
  const [localRemaining, setLocalRemaining] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!showTimer || timerEndTime === 0) {
      setLocalRemaining(0);
      setPct(0);
      return;
    }

    let frameId: number;
    const tick = () => {
      if (paused) {
        // When paused, don't tick down, wait for next frame
        frameId = requestAnimationFrame(tick);
        return;
      }
      
      const now = Date.now();
      const remainingMs = Math.max(0, timerEndTime - (now - serverTimeOffset));
      const remainingSec = Math.ceil(remainingMs / 1000);
      
      setLocalRemaining(remainingSec);
      
      // Dynamic music intensity
      if (remainingSec <= 5 && remainingSec > 0) {
        SFX.setMusicIntensity(1.5);
      } else {
        SFX.setMusicIntensity(1.0);
      }

      if (timerTotal > 0) {
        setPct((remainingMs / 1000 / timerTotal) * 100);
      } else {
        setPct(0);
      }

      if (remainingMs > 0) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [timerEndTime, timerTotal, paused, showTimer]);

  const isFire = myStreak >= 3;
  const isAnomaly = phase === 'anomaly_active';
  const factionColor = user.faction === 'team_sentinel' ? '#3b82f6' : user.faction === 'team_landsat' ? '#10b981' : user.faction === 'team_modis' ? '#a855f7' : 'var(--accent)';

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        borderBottomColor: isFire ? '#f97316' : isAnomaly ? '#ff0033' : 'var(--border)',
        boxShadow: isFire 
          ? '0 0 20px rgba(249, 115, 22, 0.2)' 
          : isAnomaly 
            ? '0 0 20px rgba(255, 0, 51, 0.2)' 
            : 'none',
        x: isAnomaly ? [0, -2, 2, -1, 1, 0] : 0
      }}
      transition={isAnomaly ? { repeat: Infinity, duration: 0.2 } : {}}
      className="hud"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <motion.div
          animate={{ opacity: connected ? [0.5, 1, 0.5] : 1 }}
          transition={{ duration: 1.5, repeat: connected ? Infinity : 0 }}
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: connected ? factionColor : 'var(--danger)',
            boxShadow: connected ? `0 0 10px ${factionColor}` : 'none',
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div className="font-orb hud-user-name" style={{ fontSize: '1rem', color: factionColor, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name.toUpperCase()}
            {isFire && <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>🔥</motion.span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{user.usn}</div>
        </div>
      </div>

      {paused && (
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="font-orb"
          style={{ color: 'var(--warning)', fontSize: '0.7rem', letterSpacing: 1 }}
        >
          ⏸
        </motion.div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {currentLevel > 0 && (
          <div style={{ textAlign: 'center', display: 'none' }} className="hud-mission-label">
            <div style={{ fontSize: '0.5rem', color: 'var(--text2)' }}>MISSION</div>
            <div className="font-orb hud-level" style={{ color: factionColor }}>{currentLevel}</div>
          </div>
        )}
        {showTimer && (
          <div style={{ width: 60 }} className="hud-timer">
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <motion.div
                style={{
                  height: '100%', borderRadius: 2,
                  background: pct > 30 ? 'var(--accent2)' : pct > 10 ? 'var(--warning)' : 'var(--danger)',
                  width: `${Math.min(100, Math.max(0, pct))}%`,
                }}
              />
            </div>
            <div className="font-orb" style={{ textAlign: 'center', fontSize: '0.75rem', color: localRemaining <= 10 ? 'var(--danger)' : 'var(--text)' }}>
              {localRemaining}s
            </div>
          </div>
        )}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text2)' }}>SCORE</div>
          <div className="font-orb t-gold hud-score" style={{ fontSize: '1.25rem' }}>{displayScore}</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onLogout} style={{ fontSize: '0.75rem', padding: '8px 16px', minHeight: 40, marginLeft: 8 }}>LOGOUT</button>
      </div>

      <style jsx>{`
        @media (min-width: 480px) {
          .hud-mission-label { display: block !important; }
          .hud-timer { width: 90px !important; }
        }
        @media (max-width: 400px) {
          .hud-user-name { display: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
