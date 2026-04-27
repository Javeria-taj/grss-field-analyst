'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

export default function AnomalyPhase() {
  const {
    anomalyData, anomalyResult, hasFixedAnomaly,
    anomalyPatchedIds, submitAnomalyFix,
    timerEndTime, serverTimeOffset,
  } = useGameSyncStore();
  const [localTime, setLocalTime] = useState(15);
  const [glitchPhase, setGlitchPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((timerEndTime - (now - serverTimeOffset)) / 1000));
      setLocalTime(remaining);
    }, 100);

    const glitch = setInterval(() => {
      setGlitchPhase(prev => (prev + 1) % 4);
    }, 150);

    return () => {
      clearInterval(timer);
      clearInterval(glitch);
    };
  }, [timerEndTime, serverTimeOffset]);

  if (!anomalyData) return null;

  // Support both new (targetIds) and legacy (targetId) server payloads
  const targetIds: string[] = anomalyData.targetIds?.length
    ? anomalyData.targetIds
    : [anomalyData.targetId];

  const nodes = Array.from({ length: anomalyData.gridSize }, (_, i) => `node_${i}`);
  const patchedCount = anomalyPatchedIds.length;
  const totalTargets = targetIds.length;

  const handleNodeClick = (id: string) => {
    // Only allow clicking actual error nodes that haven't been patched yet
    if (hasFixedAnomaly || anomalyResult) return;
    if (!targetIds.includes(id)) return;
    if (anomalyPatchedIds.includes(id)) return;
    submitAnomalyFix(id);
  };

  return (
    <div className="anomaly-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: glitchPhase % 2 === 0 ? '#ff0033' : '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflow: 'hidden',
      color: '#fff', fontFamily: 'monospace'
    }}>
      {/* Scanline overlay */}
      <motion.div
        animate={{ x: [0, -10, 10, -5, 0], opacity: [1, 0.8, 1, 0.9, 1] }}
        transition={{ duration: 0.2, repeat: Infinity }}
        style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%', maxWidth: 520 }}>
        <motion.h1
          animate={{ scale: [1, 1.1, 1], x: [-2, 2, -2] }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="anomaly-header"
          style={{
            fontSize: '2.4rem', fontWeight: 900, textTransform: 'uppercase',
            background: '#000', color: '#ff0033', padding: '10px 20px',
            border: '4px solid #fff', boxShadow: '10px 10px 0px #fff',
            marginBottom: 20
          }}
        >
          Zero-Day Anomaly
        </motion.h1>

        <div className="anomaly-sub" style={{
          background: '#fff', color: '#000', padding: '12px 16px',
          border: '4px solid #000', boxShadow: '8px 8px 0px #000',
          marginBottom: 20, fontSize: '1rem', fontWeight: 'bold'
        }}>
          TRIPLE BREACH DETECTED. PATCH ALL {totalTargets} CORRUPT NODES TO SECURE THE SYSTEM.
        </div>

        {/* Progress indicator */}
        <div style={{
          background: '#000', border: '3px solid #fff', padding: '10px 20px',
          marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
        }}>
          {targetIds.map((_, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid #fff',
              background: i < patchedCount ? '#00ff66' : (glitchPhase % 2 === 0 ? '#ff0033' : '#550000'),
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 'bold', color: '#000'
            }}>
              {i < patchedCount ? '✓' : '!'}
            </div>
          ))}
          <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>
            {patchedCount}/{totalTargets} PATCHED
          </span>
        </div>

        <div className="font-orb anomaly-timer" style={{
          fontSize: '3.5rem', marginBottom: 24, color: localTime <= 5 ? '#ff0033' : '#fff',
          background: '#000', padding: '0 20px', border: '4px solid #fff'
        }}>
          00:{localTime.toString().padStart(2, '0')}
        </div>

        {!anomalyResult ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
            padding: 20, background: '#000', border: '4px solid #fff'
          }}>
            {nodes.map((id) => {
              const isTarget = targetIds.includes(id);
              const isPatched = anomalyPatchedIds.includes(id);
              const isError = isTarget && !isPatched && !hasFixedAnomaly;

              return (
                <motion.button
                  key={id}
                  onClick={() => handleNodeClick(id)}
                  whileHover={isError ? { scale: 1.07 } : {}}
                  whileTap={isError ? { scale: 0.93 } : {}}
                  style={{
                    aspectRatio: '1/1',
                    background: isPatched
                      ? '#003a14'
                      : isError
                        ? (glitchPhase % 2 === 0 ? '#ff0033' : '#fff')
                        : '#1a1a1a',
                    border: `4px solid ${isPatched ? '#00ff66' : '#fff'}`,
                    cursor: isError ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', fontWeight: 'bold',
                    boxShadow: isPatched ? 'none' : isError ? '4px 4px 0px #fff' : 'none',
                    color: isPatched ? '#00ff66' : isError ? '#000' : '#444',
                    transition: 'background 0.1s, border-color 0.2s',
                  }}
                >
                  {isPatched ? '✓ OK' : isError ? 'ERR' : 'SYNC'}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                padding: 40, border: '8px solid #fff',
                background: anomalyResult.success ? '#00ff66' : '#ff0033',
                color: '#000', fontSize: '2rem', fontWeight: 900,
                boxShadow: '15px 15px 0px #000'
              }}
            >
              {anomalyResult.success ? (
                <>
                  ALL THREATS NEUTRALIZED <br />
                  <span style={{ fontSize: '1rem' }}>SYSTEMS RESTORING...</span>
                </>
              ) : (
                <>
                  SECURITY BREACHED <br />
                  <span style={{ fontSize: '1.5rem' }}>-{anomalyResult.penalty} POINTS</span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <style jsx>{`
        .anomaly-overlay {
          animation: shake 0.5s infinite;
        }
        @keyframes shake {
          0%   { transform: translate(1px, 1px) rotate(0deg); }
          10%  { transform: translate(-1px, -2px) rotate(-1deg); }
          20%  { transform: translate(-3px, 0px) rotate(1deg); }
          30%  { transform: translate(3px, 2px) rotate(0deg); }
          40%  { transform: translate(1px, -1px) rotate(1deg); }
          50%  { transform: translate(-1px, 2px) rotate(-1deg); }
          60%  { transform: translate(-3px, 1px) rotate(0deg); }
          70%  { transform: translate(3px, 1px) rotate(-1deg); }
          80%  { transform: translate(-1px, -1px) rotate(1deg); }
          90%  { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @media (max-width: 600px) {
          .anomaly-header { font-size: 1.6rem !important; box-shadow: 5px 5px 0px #fff !important; }
          .anomaly-sub    { font-size: 0.8rem !important; }
          .anomaly-timer  { font-size: 2.2rem !important; }
        }
      `}</style>
    </div>
  );
}
