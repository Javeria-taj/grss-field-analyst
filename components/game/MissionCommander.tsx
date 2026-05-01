'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { useGameStore } from '@/stores/useGameStore';
import { useEffect, useState } from 'react';

export default function MissionCommander() {
  const missionCommentary = useGameSyncStore(s => s.missionCommentary);
  const { user } = useGameStore();
  const [displayText, setDisplayText] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);

  useEffect(() => {
    if (!missionCommentary) {
      setDisplayText('');
      return;
    }

    // When a new message arrives while minimized, show a pip badge
    if (minimized) setHasNewMsg(true);
    setMinimized(false); // auto-expand on new message

    let i = 0;
    const text = missionCommentary.text;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 28);

    return () => clearInterval(interval);
  }, [missionCommentary]);

  if (!missionCommentary || user?.isAdmin || user?.usn === 'SUPER_ADMIN') return null;

  const moodColors: Record<string, string> = {
    snarky: '#fb7185',
    proud: '#34d399',
    neutral: '#38bdf8',
    urgent: '#fbbf24',
    encouraging: '#a78bfa',
    celebratory: '#fbbf24',
  };

  const color = moodColors[missionCommentary.mood] || moodColors.neutral;

  return (
    <AnimatePresence>
      <motion.div
        key="mc-container"
        initial={{ opacity: 0, y: 20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.92 }}
        drag
        dragConstraints={{ left: -300, right: 300, top: -60, bottom: 400 }}
        dragElastic={0.15}
        style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          translateX: '-50%',
          zIndex: 8000,
          width: minimized ? 'auto' : '90%',
          maxWidth: minimized ? 'none' : 600,
          cursor: 'grab',
        }}
      >
        {minimized ? (
          /* ─── Minimized Bubble ─── */
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => { setMinimized(false); setHasNewMsg(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(3,7,15,0.9)',
              backdropFilter: 'blur(14px)',
              border: `1px solid ${color}55`,
              borderRadius: 40,
              padding: '8px 16px',
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 14px ${color}22`,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🛰️</span>
            <span style={{ fontSize: '0.65rem', color, fontWeight: 900, letterSpacing: 1.5, fontFamily: 'var(--font-orbitron, monospace)' }}>
              MISSION COMMANDER
            </span>
            {hasNewMsg && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 10, height: 10, borderRadius: '50%',
                background: '#ff3355', border: '2px solid #030712',
              }} />
            )}
          </motion.button>
        ) : (
          /* ─── Expanded Card ─── */
          <div style={{
            background: 'rgba(3,7,15,0.88)',
            backdropFilter: 'blur(14px)',
            border: `1px solid ${color}44`,
            borderLeft: `4px solid ${color}`,
            padding: '14px 18px',
            borderRadius: 10,
            boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${color}11`,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 6, flexShrink: 0,
              background: `${color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', border: `1px solid ${color}44`,
            }}>
              🛰️
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.58rem', color, fontWeight: 900,
                letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase',
                fontFamily: 'var(--font-orbitron, monospace)',
              }}>
                MISSION COMMANDER // {missionCommentary.mood.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.55, minHeight: '1.4em' }}>
                {displayText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.55 }}
                  style={{ display: 'inline-block', width: 2, height: '1em', background: color, marginLeft: 3, verticalAlign: 'middle' }}
                />
              </div>
            </div>
            {/* Minimize button */}
            <button
              onClick={e => { e.stopPropagation(); setMinimized(true); }}
              title="Minimize"
              style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: 4,
                border: `1px solid ${color}33`, background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text2)', fontSize: '0.75rem', cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ─
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
