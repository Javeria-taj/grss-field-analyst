'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

export default function MissionLockout() {
  const { focusViolation, setFocusViolation, breachCount } = useGameSyncStore();

  if (!focusViolation) return null;

  // PHASE 3: Escalating penalty system
  // breachCount === 1 → Final warning (no penalty yet)
  // breachCount >= 2  → 75pt deduction applied, show penalty popup
  const isFirstOffense = breachCount === 1;
  const penaltyPts = 75;

  const handleReestablish = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setFocusViolation(false);
    SFX.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="lockout-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: isFirstOffense ? 'rgba(10, 0, 20, 0.97)' : 'rgba(20, 0, 0, 0.97)',
        backdropFilter: 'blur(24px)',
        zIndex: 99999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center',
        border: isFirstOffense ? '4px solid var(--warning)' : '4px solid var(--danger)',
        animation: 'screen-shake 0.3s ease',
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        style={{ maxWidth: 620 }}
      >
        <div style={{ fontSize: '4.5rem', marginBottom: 20 }}>
          {isFirstOffense ? '⚠️' : '🚨'}
        </div>

        <h1
          className="font-orb"
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 2.5rem)',
            marginBottom: 16,
            letterSpacing: '4px',
            color: isFirstOffense ? 'var(--warning)' : 'var(--danger)',
            textShadow: isFirstOffense
              ? '0 0 20px rgba(250,204,21,0.8)'
              : '0 0 20px rgba(251,113,133,0.8)',
          }}
        >
          {isFirstOffense ? 'NEURAL LINK DISRUPTED' : 'PROTOCOL VIOLATION'}
        </h1>

        {isFirstOffense ? (
          // First offense — stern final warning
          <div>
            <p style={{ color: 'var(--text)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 24 }}>
              You have exited the active mission area.
              <br />
              <strong style={{ color: 'var(--warning)' }}>
                ⚡ FINAL WARNING — This breach has been logged.
              </strong>
            </p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(250,204,21,0.1)',
                border: '1px solid rgba(250,204,21,0.4)',
                borderRadius: 10, padding: '14px 24px',
                marginBottom: 32, display: 'inline-block'
              }}
            >
              <span className="font-orb" style={{ color: 'var(--warning)', letterSpacing: 2, fontSize: '0.9rem' }}>
                ANY FURTHER TAB SWITCHING WILL DEDUCT {penaltyPts} POINTS FROM YOUR SCORE
              </span>
            </motion.div>
          </div>
        ) : (
          // Subsequent offenses — penalty applied
          <div>
            <p style={{ color: 'var(--text)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 20 }}>
              Repeated breach of the Neural Link Protocol detected.
              <br />
              <strong style={{ color: 'var(--danger)' }}>Score deduction has been applied.</strong>
            </p>
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              style={{
                background: 'rgba(251,113,133,0.15)',
                border: '2px solid var(--danger)',
                borderRadius: 10, padding: '16px 32px',
                marginBottom: 32, display: 'inline-block'
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--danger)', letterSpacing: 3, marginBottom: 4 }}>PENALTY APPLIED</div>
              <span className="font-orb" style={{ color: '#fff', letterSpacing: 2, fontSize: '2rem', fontWeight: 900 }}>
                -{penaltyPts} POINTS
              </span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text2)', marginTop: 4 }}>
                BREACH #{breachCount} · {penaltyPts}pts per violation henceforth
              </div>
            </motion.div>
          </div>
        )}

        <button
          className="btn btn-danger btn-lg"
          style={{
            margin: '0 auto',
            width: '100%', 
            maxWidth: 320,
            height: 'auto',
            minHeight: 56,
            padding: '16px 24px',
            whiteSpace: 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1.2,
            boxShadow: isFirstOffense
              ? '0 0 30px rgba(250,204,21,0.3)'
              : '0 0 30px rgba(251,113,133,0.4)',
            borderColor: isFirstOffense ? 'var(--warning)' : 'var(--danger)',
            background: isFirstOffense
              ? 'linear-gradient(135deg, #7a5000, #f59e0b)'
              : undefined,
          }}
          onClick={handleReestablish}
        >
          🔗 RE-ESTABLISH NEURAL LINK
        </button>

        <p style={{ color: 'var(--text3)', fontSize: '0.75rem', marginTop: 20, opacity: 0.6 }}>
          {isFirstOffense
            ? 'Click to rejoin the mission. Further violations will incur point deductions.'
            : `Violations are cumulative. Each further breach costs ${penaltyPts} points.`}
        </p>
      </motion.div>
    </motion.div>
  );
}
