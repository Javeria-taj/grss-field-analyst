import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SFX } from '@/lib/sfx';

export default function WireRouting({ onComplete, glitchPhase }: { onComplete: () => void, glitchPhase: number }) {
  const [path, setPath] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const corruptNodes = [2, 6];
  const completedRef = useRef(false);

  const handlePointerDown = (i: number) => {
    if (i === 0) {
      SFX.click();
      setPath([0]);
      setDragging(true);
    } else {
      setPath([]);
    }
  };

  // ── Core enter logic (shared by mouse hover and touch move) ──
  const enterNode = (i: number, currentPath: number[]) => {
    if (corruptNodes.includes(i)) {
      setDragging(false);
      setPath([]);
      return currentPath; // reset
    }

    const last = currentPath[currentPath.length - 1];
    if (last === undefined) return currentPath;

    const rA = Math.floor(last / 3), cA = last % 3;
    const rB = Math.floor(i / 3),   cB = i % 3;
    const isAdjacent = Math.abs(rA - rB) + Math.abs(cA - cB) === 1;

    if (isAdjacent && !currentPath.includes(i)) {
      SFX.click();
      const newPath = [...currentPath, i];
      if (i === 8 && !completedRef.current) {
        completedRef.current = true;
        setDragging(false);
        setPath(newPath);
        onComplete();
      } else {
        setPath(newPath);
      }
      return newPath;
    }
    return currentPath;
  };

  // ── For mouse: onPointerEnter per node works fine ──
  const handlePointerEnter = (i: number) => {
    if (!dragging) return;
    setPath(prev => enterNode(i, prev));
  };

  // ── For touch: onPointerMove on the grid container detects which node is under finger ──
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    // elementFromPoint finds the DOM element currently under the touch/pointer
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!el) return;
    const idxAttr = el.closest('[data-node]')?.getAttribute('data-node');
    if (idxAttr === null || idxAttr === undefined) return;
    const i = parseInt(idxAttr, 10);
    if (isNaN(i)) return;
    setPath(prev => {
      if (prev[prev.length - 1] === i) return prev; // already there
      return enterNode(i, prev);
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
    setPath(prev => {
      if (!prev.includes(8)) return []; // reset if didn't reach OUT
      return prev;
    });
  };

  return (
    <div
      style={{ width: '100%', touchAction: 'none', userSelect: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.9rem', fontWeight: 'bold' }}>
        BYPASS CORRUPT NODES: CONNECT IN → OUT
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        padding: 20, background: '#000', border: '4px solid #fff',
      }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const isCorrupt = corruptNodes.includes(i);
          const isInPath  = path.includes(i);
          const isStart   = i === 0;
          const isEnd     = i === 8;

          return (
            <motion.div
              key={i}
              data-node={i}                           // ← used by elementFromPoint
              ref={el => { nodeRefs.current[i] = el; }}
              onPointerDown={() => handlePointerDown(i)}
              onPointerEnter={() => handlePointerEnter(i)} // still fires on desktop
              style={{
                aspectRatio: '1/1',
                background: isCorrupt
                  ? (glitchPhase % 2 === 0 ? '#ff9900' : '#330000')
                  : isInPath ? '#00ff66' : '#1a1a1a',
                border: `4px solid ${isInPath ? '#fff' : '#444'}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 'bold',
                color: isInPath ? '#000' : isCorrupt ? '#fff' : '#444',
                boxShadow: isInPath ? '0 0 10px #00ff66' : 'none',
                // Make nodes easier to tap on mobile
                minHeight: 56,
              }}
              whileTap={{ scale: 0.92 }}
            >
              {isStart ? 'IN' : isEnd ? 'OUT' : isCorrupt ? 'ERR' : '•'}
            </motion.div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.75rem', color: '#888' }}>
        {dragging ? '⚡ Routing...' : path.includes(8) ? '✅ Path Secured' : 'Press IN and drag to OUT'}
      </div>
    </div>
  );
}
