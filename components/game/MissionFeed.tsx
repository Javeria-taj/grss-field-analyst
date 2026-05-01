'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { ACHIEVEMENTS } from '@/lib/achievements';

const EVENT_ICONS: Record<string, string> = {
  achievement:  '🏆',
  powerup:      '⚡',
  answer:       '📡',
  level_up:     '🎖️',
  sabotage:     '⚠️',
  default:      '📢',
};

const EVENT_COLORS: Record<string, string> = {
  achievement:  '#fde047',
  powerup:      '#00c8ff',
  answer:       '#4ade80',
  level_up:     '#a78bfa',
  sabotage:     '#fb7185',
  default:      '#38bdf8',
};

export default function MissionFeed() {
  const missionEvents = useGameSyncStore(s => s.missionEvents);
  if (!missionEvents || missionEvents.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 6000,
        pointerEvents: 'none',
        overflow: 'hidden',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(90deg, rgba(3,7,15,0.95) 0%, rgba(3,7,15,0.8) 50%, rgba(3,7,15,0.95) 100%)',
        borderTop: '1px solid rgba(56,189,248,0.12)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Scrolling ticker rail */}
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: missionEvents.length * 7,
          ease: 'linear',
          repeat: Infinity,
        }}
        style={{
          display: 'flex',
          gap: 40,
          alignItems: 'center',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {/* Duplicate array twice for seamless looping */}
        {[...missionEvents, ...missionEvents].map((ev, i) => {
          const type = ev.type || 'default';
          const icon = EVENT_ICONS[type] || EVENT_ICONS.default;
          const color = EVENT_COLORS[type] || EVENT_COLORS.default;
          const label = ev.type === 'achievement' && ev.achievementId
            ? `earned ${ACHIEVEMENTS[ev.achievementId]?.name || 'a milestone'}`
            : (ev.text || 'performed an action');

          return (
            <div
              key={`${ev.id}-${i}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 20px',
              }}
            >
              {/* Separator */}
              <span style={{ color: 'rgba(56,189,248,0.25)', fontSize: '0.7rem' }}>◆</span>
              {/* Icon */}
              <span style={{ fontSize: '0.95rem' }}>{icon}</span>
              {/* Agent name */}
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color,
                fontFamily: 'var(--font-orbitron, monospace)',
                letterSpacing: 1,
              }}>
                {(ev.user || 'AGENT').toUpperCase()}
              </span>
              {/* Action */}
              <span style={{
                fontSize: '0.72rem',
                color: 'rgba(241,245,249,0.65)',
                letterSpacing: 0.3,
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Left + Right fade gradients for cinema effect */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 80,
        background: 'linear-gradient(90deg, rgba(3,7,15,1), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
        background: 'linear-gradient(270deg, rgba(3,7,15,1), transparent)',
        pointerEvents: 'none',
      }} />

      {/* LIVE badge */}
      <div style={{
        position: 'absolute', left: 12,
        display: 'flex', alignItems: 'center', gap: 5,
        zIndex: 1,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#ff3355',
          animation: 'live-ping 1.2s ease-out infinite',
          boxShadow: '0 0 6px #ff3355',
        }} />
        <span style={{
          fontSize: '0.55rem', fontWeight: 900, letterSpacing: 2,
          color: '#ff3355', fontFamily: 'var(--font-orbitron, monospace)',
        }}>
          LIVE
        </span>
      </div>

      <style>{`
        @keyframes live-ping {
          0%   { opacity: 1; transform: scale(1); }
          60%  { opacity: 0; transform: scale(2.2); }
          100% { opacity: 0; transform: scale(2.2); }
        }
      `}</style>
    </div>
  );
}
