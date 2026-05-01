'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevel5Store } from '@/stores/useLevel5Store';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import Phase5A from './Phase5A';
import Phase5B from './Phase5B';
import Phase5C from './Phase5C';

export default function Level5Finale() {
  const { l5Phase, setBudget, resetLevel5 } = useLevel5Store();
  const { myTotalScore, currentLevel } = useGameSyncStore();

  // Set the starting budget from previous level scores + 100 bonus
  useEffect(() => {
    // Reset store each time this component mounts (new Level 5 session)
    resetLevel5();
    // Budget = all previously accumulated score + 100 bonus
    const startBudget = myTotalScore + 1000;
    setBudget(startBudget);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  const phaseLabel: Record<typeof l5Phase, string> = {
    '5A': 'Phase A · Threat Analysis',
    '5B': 'Phase B · Live Auction & Segregation',
    '5C': 'Phase C · Mission Debrief',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── Sticky Phase Header ── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(3,7,15,0.96)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 980,
          margin: '0 auto',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)' }}>
              Level 5 · {phaseLabel[l5Phase]}
            </div>
            <h1 className="font-orb t-accent" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.3rem)' }}>
              {l5Phase === '5A' && 'THREAT ANALYSIS'}
              {l5Phase === '5B' && 'TOOL MARKETPLACE'}
              {l5Phase === '5C' && 'FINAL EVALUATION'}
            </h1>
          </div>

          {/* Phase Progress Indicators */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {(['5A', '5B', '5C'] as const).map((p) => (
              <div
                key={p}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontFamily: "'Orbitron', monospace",
                  fontWeight: 700, letterSpacing: 0.5,
                  border: `2px solid ${l5Phase === p ? 'var(--accent)' : l5Phase > p ? 'var(--accent2)' : 'var(--border)'}`,
                  background: l5Phase === p
                    ? 'rgba(0,200,255,0.15)'
                    : l5Phase > p
                      ? 'rgba(0,255,136,0.1)'
                      : 'transparent',
                  color: l5Phase === p ? 'var(--accent)' : l5Phase > p ? 'var(--accent2)' : 'var(--text2)',
                  transition: 'all 0.3s',
                }}
              >
                {l5Phase > p ? '✓' : p.replace('5', '')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Phase Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={l5Phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {l5Phase === '5A' && <Phase5A />}
            {l5Phase === '5B' && <Phase5B />}
            {l5Phase === '5C' && <Phase5C />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
