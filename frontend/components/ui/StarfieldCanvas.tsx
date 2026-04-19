'use client';
import { useEffect, useRef } from 'react';

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d')!;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.2,
      spd: Math.random() * 0.35 + 0.04,
      tw: Math.random() * Math.PI * 2,
      tws: Math.random() * 0.03 + 0.004,
      col: Math.random() > 0.92 ? '#00c8ff' : Math.random() > 0.96 ? '#00ff9d' : '#b8d8ff',
    }));

    let animId: number;
    const draw = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      stars.forEach(s => {
        s.tw += s.tws;
        const a = 0.3 + 0.7 * Math.abs(Math.sin(s.tw));
        cx.globalAlpha = a;
        cx.fillStyle = s.col;
        cx.beginPath();
        cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        cx.fill();
        cx.globalAlpha = 1;
        s.y += s.spd * 0.12;
        if (s.y > cv.height) { s.y = 0; s.x = Math.random() * cv.width; }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
