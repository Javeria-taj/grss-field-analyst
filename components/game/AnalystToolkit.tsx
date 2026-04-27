'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

export default function AnalystToolkit() {
  const { usePowerup, powerupResult, hasAnswered, phase } = useGameSyncStore();

  if (phase !== 'question_active' || hasAnswered) return null;

  const tools = [
    { id: 'radar_pulse', name: 'RADAR PULSE', cost: 200, icon: '🛰️', desc: 'Remove 2 wrong answers' },
    { id: 'thermal_scan', name: 'THERMAL SCAN', cost: 300, icon: '🌡️', desc: 'Show player trends' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 100,
      right: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      zIndex: 5000
    }}>
      <div style={{
        fontSize: '0.6rem', color: 'var(--text3)', textAlign: 'right', fontWeight: 900, letterSpacing: 1
      }}>ANALYST TOOLKIT</div>
      {tools.map(t => {
        const isUsed = powerupResult?.type === t.id;
        return (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { SFX.click(); usePowerup(t.id as any); }}
            disabled={isUsed}
            style={{
              background: isUsed ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isUsed ? 'var(--accent2)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: isUsed ? '0 0 15px var(--accent2)44' : 'none',
              opacity: isUsed ? 0.6 : 1
            }}
          >
            <div style={{ fontSize: '1.2rem' }}>{t.icon}</div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isUsed ? 'var(--accent2)' : 'var(--text)' }}>{t.name}</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text2)' }}>{t.cost} PTS • {t.desc}</div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
