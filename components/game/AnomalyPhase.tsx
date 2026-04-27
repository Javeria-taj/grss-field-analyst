'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

export default function AnomalyPhase() {
  const { anomalyData, anomalyResult, hasFixedAnomaly, submitAnomalyFix, timerEndTime, serverTimeOffset } = useGameSyncStore();
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

  const nodes = Array.from({ length: anomalyData.gridSize }, (_, i) => `node_${i}`);

  const handleNodeClick = (id: string) => {
    if (hasFixedAnomaly || anomalyResult) return;
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
      {/* Glitch Overlay */}
      <motion.div 
        animate={{ 
          x: [0, -10, 10, -5, 0],
          opacity: [1, 0.8, 1, 0.9, 1]
        }}
        transition={{ duration: 0.2, repeat: Infinity }}
        style={{
          position: 'absolute', inset: 0, 
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%', maxWidth: 500 }}>
        <motion.h1 
          animate={{ scale: [1, 1.1, 1], x: [-2, 2, -2] }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="anomaly-header"
          style={{ 
            fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase',
            background: '#000', color: '#ff0033', padding: '10px 20px',
            border: '4px solid #fff', boxShadow: '10px 10px 0px #fff',
            marginBottom: 30
          }}
        >
          Zero-Day Anomaly
        </motion.h1>

        <div className="anomaly-sub" style={{ 
          background: '#fff', color: '#000', padding: 15, 
          border: '4px solid #000', boxShadow: '8px 8px 0px #000',
          marginBottom: 30, fontSize: '1.2rem', fontWeight: 'bold'
        }}>
          CRITICAL BREACH DETECTED. <br/>
          PATCH THE CORRUPT DATA NODE IMMEDIATELY.
        </div>

        <div className="font-orb anomaly-timer" style={{ 
          fontSize: '4rem', marginBottom: 30, color: localTime <= 5 ? '#ff0033' : '#fff',
          background: '#000', padding: '0 20px', border: '4px solid #fff'
        }}>
          00:{localTime.toString().padStart(2, '0')}
        </div>



        {!anomalyResult ? (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15,
            padding: 20, background: '#000', border: '4px solid #fff'
          }}>
            {nodes.map((id) => {
              const isTarget = id === anomalyData.targetId;
              const isFixed = hasFixedAnomaly && isTarget;
              
              return (
                <motion.button
                  key={id}
                  onClick={() => handleNodeClick(id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    aspectRatio: '1/1',
                    background: isTarget && !hasFixedAnomaly ? (glitchPhase % 2 === 0 ? '#ff0033' : '#fff') : '#222',
                    border: '4px solid #fff',
                    cursor: hasFixedAnomaly ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 'bold',
                    boxShadow: isFixed ? 'none' : '4px 4px 0px #fff',
                    transform: isFixed ? 'translate(4px, 4px)' : 'none',
                    color: isTarget && !hasFixedAnomaly ? '#000' : '#fff'
                  }}
                >
                  {isFixed ? 'OK' : isTarget && !hasFixedAnomaly ? 'ERR' : 'SYNC'}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              padding: 40, border: '8px solid #fff',
              background: anomalyResult.success ? '#00ff66' : '#ff0033',
              color: '#000', fontSize: '2rem', fontWeight: 'black',
              boxShadow: '15px 15px 0px #000'
            }}
          >
            {anomalyResult.success ? (
              <>
                THREAT NEUTRALIZED <br/>
                <span style={{ fontSize: '1rem' }}>SYSTEMS RESTORING...</span>
              </>
            ) : (
              <>
                SECURITY BREACHED <br/>
                <span style={{ fontSize: '1.5rem' }}>-{anomalyResult.penalty} POINTS</span>
              </>
            )}
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .anomaly-overlay {
          animation: shake 0.5s infinite;
        }
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @media (max-width: 600px) {
          .anomaly-header { font-size: 1.8rem !important; box-shadow: 5px 5px 0px #fff !important; }
          .anomaly-sub { font-size: 0.9rem !important; }
          .anomaly-timer { font-size: 2.5rem !important; }
        }
      `}</style>
    </div>
  );
}
