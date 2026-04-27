'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { useEffect, useState } from 'react';

export default function MissionCommander() {
  const missionCommentary = useGameSyncStore(s => s.missionCommentary);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!missionCommentary) {
      setDisplayText('');
      return;
    }

    let i = 0;
    const text = missionCommentary.text;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [missionCommentary]);

  if (!missionCommentary) return null;

  const moodColors: Record<string, string> = {
    snarky: '#fb7185',
    proud: '#34d399',
    neutral: '#38bdf8',
    urgent: '#fbbf24'
  };

  const color = moodColors[missionCommentary.mood] || moodColors.neutral;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 8000,
          width: '90%',
          maxWidth: 600,
          pointerEvents: 'none'
        }}
      >
        <div style={{
          background: 'rgba(3, 7, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${color}44`,
          borderLeft: `4px solid ${color}`,
          padding: '16px 20px',
          borderRadius: 8,
          boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${color}11`,
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 4,
            background: `${color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
            border: `1px solid ${color}44`
          }}>
            🛰️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '0.6rem', 
              color, 
              fontWeight: 900, 
              letterSpacing: 1.5, 
              marginBottom: 4,
              textTransform: 'uppercase'
            }}>
              MISSION COMMANDER // {missionCommentary.mood}
            </div>
            <div className="font-exo" style={{ 
              fontSize: '0.95rem', 
              color: 'var(--text)', 
              lineHeight: 1.5,
              minHeight: '1.5em'
            }}>
              {displayText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                style={{ display: 'inline-block', width: 2, height: '1em', background: color, marginLeft: 2, verticalAlign: 'middle' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
