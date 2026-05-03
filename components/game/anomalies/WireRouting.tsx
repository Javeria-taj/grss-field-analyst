import { useState } from 'react';
import { motion } from 'framer-motion';
import { SFX } from '@/lib/sfx';

export default function WireRouting({ onComplete, glitchPhase }: { onComplete: () => void, glitchPhase: number }) {
  const [path, setPath] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const corruptNodes = [2, 6];

  const handlePointerDown = (i: number) => {
    if (i === 0) {
      SFX.click();
      setPath([0]);
      setDragging(true);
    } else {
      setPath([]);
    }
  };

  const handlePointerEnter = (i: number) => {
    if (!dragging) return;
    
    if (corruptNodes.includes(i)) {
      // Hit a corrupt node
      setDragging(false);
      setPath([]);
      return;
    }

    const last = path[path.length - 1];
    if (last === undefined) return;

    // Check adjacency
    const rA = Math.floor(last / 3);
    const cA = last % 3;
    const rB = Math.floor(i / 3);
    const cB = i % 3;
    const isAdjacent = Math.abs(rA - rB) + Math.abs(cA - cB) === 1;

    if (isAdjacent && !path.includes(i)) {
      SFX.click();
      const newPath = [...path, i];
      setPath(newPath);
      
      if (i === 8) {
        setDragging(false);
        onComplete();
      }
    }
  };

  const handlePointerUp = () => {
    setDragging(false);
    if (!path.includes(8)) {
      setPath([]); // Reset if didn't reach the end
    }
  };

  return (
    <div style={{ width: '100%', touchAction: 'none' }} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.9rem', fontWeight: 'bold' }}>
        BYPASS CORRUPT NODES: CONNECT IN TO OUT
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        padding: 20, background: '#000', border: '4px solid #fff'
      }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const isCorrupt = corruptNodes.includes(i);
          const isPath = path.includes(i);
          const isStart = i === 0;
          const isEnd = i === 8;
          
          return (
            <motion.div
              key={i}
              onPointerDown={() => handlePointerDown(i)}
              onPointerEnter={() => handlePointerEnter(i)}
              style={{
                aspectRatio: '1/1',
                background: isCorrupt 
                  ? (glitchPhase % 2 === 0 ? '#ff0033' : '#330000') 
                  : isPath ? '#00ff66' : '#1a1a1a',
                border: \`4px solid \${isPath ? '#fff' : '#444'}\`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 'bold',
                color: isPath ? '#000' : isCorrupt ? '#fff' : '#444',
                boxShadow: isPath ? '0 0 10px #00ff66' : 'none',
              }}
            >
              {isStart ? 'IN' : isEnd ? 'OUT' : isCorrupt ? 'ERR' : '•'}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
