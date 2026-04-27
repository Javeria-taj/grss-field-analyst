'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { ACHIEVEMENTS } from '@/lib/achievements';

export default function MissionFeed() {
  const missionEvents = useGameSyncStore(s => s.missionEvents);

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      zIndex: 9000,
      pointerEvents: 'none',
      alignItems: 'flex-end'
    }}>
      <AnimatePresence>
        {missionEvents.map(ev => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              borderLeft: '3px solid var(--accent)',
              padding: '8px 16px',
              borderRadius: '4px 8px 8px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ fontSize: '1.2rem' }}>
              {ev.type === 'achievement' ? '🏆' : '📢'}
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {ev.type === 'achievement' ? 'Achievement Unlocked' : 'Global Update'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                <span className="t-accent">{ev.user}</span>
                <span style={{ color: 'var(--text2)', margin: '0 4px' }}>
                  {ev.type === 'achievement' ? 'earned' : 'did'}
                </span>
                <span className="t-gold">
                  {ev.type === 'achievement' && ev.achievementId ? ACHIEVEMENTS[ev.achievementId]?.name : ev.text}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
