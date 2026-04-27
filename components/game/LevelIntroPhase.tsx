'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function LevelIntroPhase() {
  const { levelIntro, timerEndTime, paused, serverTimeOffset } = useGameSyncStore();
  const [localRemaining, setLocalRemaining] = useState(0);

  useEffect(() => {
    if (!levelIntro || timerEndTime === 0) {
      setLocalRemaining(0);
      return;
    }

    let frameId: number;
    const tick = () => {
      if (paused) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      const now = Date.now();
      const remainingMs = Math.max(0, timerEndTime - (now - serverTimeOffset));
      setLocalRemaining(Math.ceil(remainingMs / 1000));
      if (remainingMs > 0) {
        frameId = requestAnimationFrame(tick);
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [timerEndTime, paused, levelIntro]);

  if (!levelIntro) return null;

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 20, minHeight: '70vh' }}>
      <motion.div
        style={{ textAlign: 'center', maxWidth: 600 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="intro-icon"
          style={{ fontSize: '4rem', marginBottom: 12 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {levelIntro.icon}
        </motion.div>
        <div className="badge badge-purple" style={{ fontSize: '0.7rem', marginBottom: 12 }}>
          {levelIntro.badge}
        </div>
        <div className="font-orb t-accent intro-title" style={{ fontSize: '1.5rem', letterSpacing: 2, marginBottom: 16 }}>
          {levelIntro.title}
        </div>
        <div style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
          {levelIntro.story}
        </div>
        <div className="card" style={{ textAlign: 'left', fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--accent)', background: 'rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ marginBottom: 4 }}>[ SYSTEM ] INITIALIZING NEURAL LINK...</div>
          <div style={{ marginBottom: 4 }}>[ DATA ] FETCHING SATELLITE TELEMETRY...</div>
          <div style={{ marginBottom: 8 }}>[ AUTH ] ANALYST CREDENTIALS VERIFIED.</div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: timerEndTime > 0 ? (timerEndTime - Date.now())/1000 : 5, ease: 'linear' }}
              style={{ height: '100%', background: 'var(--accent)' }}
            />
          </div>
          <motion.div 
            animate={{ opacity: [1, 0, 1] }} 
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ position: 'absolute', right: 12, top: 12, fontSize: '0.6rem' }}
          >
            ● LIVE_LINK
          </motion.div>
        </div>
        <motion.div
          className="font-orb t-warning intro-countdown"
          style={{ fontSize: '1.8rem', marginTop: 24 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          STARTS IN {localRemaining}s
        </motion.div>

        <style jsx>{`
          @media (max-width: 600px) {
            .intro-icon { font-size: 3rem !important; }
            .intro-title { font-size: 1.25rem !important; }
            .intro-countdown { font-size: 1.4rem !important; }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
