'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

export default function MissionLockout() {
  const { focusViolation, setFocusViolation, breachCount } = useGameSyncStore();

  if (!focusViolation) return null;

  const handleReestablish = () => {
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
    
    // Clear violation state
    setFocusViolation(false);
    SFX.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="lockout-overlay"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(20, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 99999, // Extremely high z-index to cover EVERYTHING
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        color: 'var(--danger)',
        border: '4px solid var(--danger)',
        animation: 'screen-shake 0.3s ease'
      }}
    >
      <motion.div 
        initial={{ scale: 0.8 }} 
        animate={{ scale: 1 }} 
        transition={{ type: 'spring', bounce: 0.5 }}
        style={{ maxWidth: 600 }}
      >
        <div style={{ fontSize: '5rem', marginBottom: 20 }}>⚠️</div>
        <h1 className="font-orb" style={{ fontSize: '2.5rem', marginBottom: 16, letterSpacing: '4px', textShadow: '0 0 20px rgba(251,113,133,0.8)' }}>
          SECURITY BREACH
        </h1>
        
        <p style={{ color: 'var(--text)', fontSize: '1.2rem', marginBottom: 12, lineHeight: 1.6 }}>
          You have left the active mission area or exited fullscreen. 
          <br/>
          <strong style={{ color: 'var(--danger)' }}>This is a violation of the Neural Link Protocol.</strong>
        </p>

        {breachCount > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'rgba(251,113,133,0.15)', 
              padding: '12px 24px', 
              borderRadius: 8, 
              border: '1px solid var(--danger)',
              marginBottom: 32,
              display: 'inline-block'
            }}
          >
            <span className="font-orb" style={{ color: 'var(--warning)', letterSpacing: 2 }}>
              PENALTY APPLIED: -100 POINTS
            </span>
          </motion.div>
        )}

        <div style={{ marginTop: breachCount > 1 ? 0 : 32 }}>
          <button 
            className="btn btn-danger btn-lg" 
            style={{ width: '100%', maxWidth: 300, boxShadow: '0 0 30px rgba(251,113,133,0.4)' }}
            onClick={handleReestablish}
          >
            RE-ESTABLISH LINK
          </button>
        </div>
        
        <p style={{ color: 'var(--text2)', fontSize: '0.8rem', marginTop: 24, opacity: 0.7 }}>
          Continuing to sever the connection will result in further point deductions.
        </p>
      </motion.div>
    </motion.div>
  );
}
