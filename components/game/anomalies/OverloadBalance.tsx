import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SFX } from '@/lib/sfx';

export default function OverloadBalance({ onComplete, glitchPhase }: { onComplete: () => void, glitchPhase: number }) {
  const [heats, setHeats] = useState<number[]>(Array(9).fill(20));
  const [drainedCount, setDrainedCount] = useState(0);
  const targetDrain = 15;

  useEffect(() => {
    const interval = setInterval(() => {
      setHeats(prev => prev.map(h => Math.min(100, h + Math.random() * 8 + 2)));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleTap = (index: number) => {
    SFX.click();
    setHeats(prev => {
      const next = [...prev];
      if (next[index] > 0) {
        setDrainedCount(c => {
          const newC = c + 1;
          if (newC >= targetDrain) onComplete();
          return newC;
        });
      }
      next[index] = 0;
      return next;
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.9rem', fontWeight: 'bold' }}>
        DRAIN HEAT TO STABILIZE: {drainedCount}/{targetDrain} SECTORS CLEARED
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        padding: 20, background: '#000', border: '4px solid #fff'
      }}>
        {heats.map((heat, i) => (
          <motion.button
            key={i}
            onClick={() => handleTap(i)}
            whileTap={{ scale: 0.9 }}
            style={{
              aspectRatio: '1/1',
              background: '#1a1a1a',
              border: `2px solid ${heat > 80 ? '#ff0033' : '#fff'}`,
              position: 'relative', overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: heat > 80 ? '0 0 10px #ff0033' : 'none'
            }}
          >
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: \`\${heat}%\`,
              background: heat > 80 ? (glitchPhase % 2 === 0 ? '#ff0033' : '#fff') : '#ff0033',
              transition: 'height 0.2s',
              opacity: 0.8
            }} />
            <div style={{ position: 'relative', zIndex: 2, color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {Math.round(heat)}%
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
