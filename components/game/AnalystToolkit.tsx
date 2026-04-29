'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';
import { useGameStore } from '@/stores/useGameStore';

// PHASE 1: Thematic power-up names aligned with geospatial/cyber-security narrative
const TOOLKIT_ITEMS = [
  {
    id: 'radar_pulse',
    name: 'ORBITAL SWEEP',
    cost: 200,
    icon: '🛰️',
    desc: 'Eliminate 2 corrupted signals',
    tooltip: 'Costs 200 pts — removes 2 wrong options'
  },
  {
    id: 'thermal_scan',
    name: 'NEURAL SYNC',
    cost: 300,
    icon: '🌡️',
    desc: 'Intercept agent consensus feed',
    tooltip: 'Costs 300 pts — reveals answer distribution'
  },
];

export default function AnalystToolkit() {
  const { usePowerup, powerupResult, hasAnswered, phase } = useGameSyncStore();
  const { user } = useGameStore();

  if (phase !== 'question_active' || hasAnswered || user?.isAdmin || user?.usn === 'SUPER_ADMIN') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 100, right: 16,
      display: 'flex', flexDirection: 'column',
      gap: 10, zIndex: 5000,
    }}>
      <div style={{ fontSize: '0.58rem', color: 'var(--text3)', textAlign: 'right', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        ⚡ ANALYST TOOLKIT
      </div>
      {TOOLKIT_ITEMS.map(t => {
        const isUsed = powerupResult?.type === t.id;
        return (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            title={t.tooltip}
            onClick={() => { SFX.click(); usePowerup(t.id as any); }}
            disabled={isUsed}
            style={{
              background: isUsed ? 'rgba(74,222,128,0.08)' : 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isUsed ? 'var(--accent2)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              textAlign: 'left',
              cursor: isUsed ? 'default' : 'pointer',
              boxShadow: isUsed ? '0 0 15px rgba(74,222,128,0.3)' : 'none',
              opacity: isUsed ? 0.65 : 1,
              minWidth: 180,
            }}
          >
            <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>{isUsed ? '✅' : t.icon}</div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isUsed ? 'var(--accent2)' : 'var(--text)', letterSpacing: 0.5 }}>
                {isUsed ? 'DEPLOYED' : t.name}
              </div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text2)', marginTop: 1 }}>
                {t.cost} PTS • {t.desc}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
