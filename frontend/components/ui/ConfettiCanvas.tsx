'use client';
import { useEffect, useRef, useCallback } from 'react';

let fireRef: ((colors?: string[]) => void) | null = null;

export function useConfetti() {
  return {
    fire: (colors?: string[]) => fireRef?.(colors),
  };
}

export default function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fire = useCallback((colors?: string[]) => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const cx = cv.getContext('2d')!;
    const cols = colors || ['#00c8ff', '#00ff9d', '#7c3aed', '#ffd700', '#ff6b35', '#ff2d55'];
    const ps = Array.from({ length: 150 }, () => ({
      x: Math.random() * cv.width,
      y: cv.height * Math.random() * 0.25 - 20,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * 5 + 2,
      col: cols[Math.floor(Math.random() * cols.length)],
      w: Math.random() * 12 + 4,
      h: Math.random() * 6 + 2,
      rot: Math.random() * 360,
      rsp: (Math.random() - 0.5) * 14,
    }));
    let frame = 0;
    const loop = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      let any = false;
      ps.forEach(p => {
        if (p.y > cv.height + 30) return;
        any = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.13; p.rot += p.rsp;
        const a = Math.max(0, 1 - p.y / cv.height);
        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate(p.rot * Math.PI / 180);
        cx.globalAlpha = a;
        cx.fillStyle = p.col;
        cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cx.restore();
      });
      frame++;
      if (any && frame < 400) requestAnimationFrame(loop);
      else cx.clearRect(0, 0, cv.width, cv.height);
    };
    loop();
  }, []);

  useEffect(() => {
    fireRef = fire;
    return () => { fireRef = null; };
  }, [fire]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}
    />
  );
}
