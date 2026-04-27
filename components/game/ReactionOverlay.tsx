'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { useEffect, useState } from 'react';

export default function ReactionOverlay() {
  const activeReactions = useGameSyncStore(s => s.activeReactions);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      <AnimatePresence>
        {activeReactions.map(r => (
          <FloatingEmoji key={r.id} emoji={r.emoji} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FloatingEmoji({ emoji }: { emoji: string }) {
  // Random start position (bottom)
  const [startX] = useState(() => Math.random() * 80 + 10); // 10% to 90%
  const [duration] = useState(() => Math.random() * 2 + 3); // 3-5 seconds
  const [scale] = useState(() => Math.random() * 0.5 + 1); // 1x to 1.5x
  const [rotation] = useState(() => Math.random() * 40 - 20); // -20 to 20 deg

  return (
    <motion.div
      initial={{ opacity: 0, y: '100vh', x: `${startX}vw`, scale: 0.5, rotate: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: '-10vh', 
        scale, 
        rotate: rotation,
        x: `${startX + (Math.random() * 10 - 5)}vw` 
      }}
      exit={{ opacity: 0 }}
      transition={{ duration, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        fontSize: '2rem',
        filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
        userSelect: 'none'
      }}
    >
      {emoji}
    </motion.div>
  );
}
