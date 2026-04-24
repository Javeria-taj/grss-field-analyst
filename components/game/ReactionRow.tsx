'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

export default function ReactionRow() {
  const { sendReaction } = useGameSyncStore();
  const reactions = ['🤯', '🔥', '💀', '🚀', '⭐', '💎'];

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
      {reactions.map(r => (
        <motion.button
          key={r}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            SFX.click();
            sendReaction(r);
          }}
          style={{
            fontSize: '1.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {r}
        </motion.button>
      ))}
    </div>
  );
}
