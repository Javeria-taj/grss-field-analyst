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
          style={{ fontSize: '4.5rem', marginBottom: 12 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {levelIntro.icon}
        </motion.div>
        <div className="badge badge-purple" style={{ fontSize: '0.7rem', marginBottom: 12 }}>
          {levelIntro.badge}
        </div>
        <div className="font-orb t-accent" style={{ fontSize: '1.6rem', letterSpacing: 2, marginBottom: 16 }}>
          {levelIntro.title}
        </div>
        <div style={{ color: 'var(--text2)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 20 }}>
          {levelIntro.story}
        </div>
        <div className="card" style={{ textAlign: 'left', fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {levelIntro.rules}
        </div>
        <motion.div
          className="font-orb t-warning"
          style={{ fontSize: '2rem', marginTop: 24 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          STARTS IN {localRemaining}s
        </motion.div>
      </motion.div>
    </div>
  );
}
