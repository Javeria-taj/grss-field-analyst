import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SFX } from '@/lib/sfx';

export default function WhackAMole({ onComplete, glitchPhase }: { onComplete: () => void, glitchPhase: number }) {
  const [activeNode, setActiveNode] = useState(4);
  const [taps, setTaps] = useState(0);
  const targetTaps = 5;

  const handleTap = (index: number) => {
    if (index === activeNode) {
      SFX.click();
      const newTaps = taps + 1;
      setTaps(newTaps);
      if (newTaps >= targetTaps) {
        onComplete();
      } else {
        // Move to a different random node
        let next = Math.floor(Math.random() * 9);
        while (next === activeNode) next = Math.floor(Math.random() * 9);
        setActiveNode(next);
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.9rem', fontWeight: 'bold' }}>
        QUARANTINE MALWARE: {taps}/{targetTaps} NEUTRALIZED
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        padding: 20, background: '#000', border: '4px solid #fff'
      }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const isActive = i === activeNode;
          return (
            <motion.button
              key={i}
              onClick={() => handleTap(i)}
              whileHover={isActive ? { scale: 1.07 } : {}}
              whileTap={isActive ? { scale: 0.93 } : {}}
              style={{
                aspectRatio: '1/1',
                background: isActive ? (glitchPhase % 2 === 0 ? '#ff0033' : '#fff') : '#1a1a1a',
                border: `4px solid ${isActive ? '#fff' : '#444'}`,
                cursor: isActive ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 'bold',
                boxShadow: isActive ? '4px 4px 0px #fff' : 'none',
                color: isActive ? '#000' : '#444',
                transition: 'background 0.1s, border-color 0.2s',
              }}
            >
              {isActive ? 'ERR' : 'SYNC'}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
