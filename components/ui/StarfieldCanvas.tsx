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

    const shootingStars: any[] = [];
    const createShootingStar = () => {
      shootingStars.push({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height * 0.5,
        len: Math.random() * 80 + 40,
        spd: Math.random() * 10 + 10,
        opacity: 1,
      });
    };

    let animId: number;
    const draw = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      
      // Draw static stars
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

      // Draw shooting stars
      if (Math.random() < 0.015) createShootingStar();
      
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.spd;
        ss.y += ss.spd * 0.5;
        ss.opacity -= 0.02;

        if (ss.opacity <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const grad = cx.createLinearGradient(ss.x, ss.y, ss.x - ss.len, ss.y - ss.len * 0.5);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        cx.strokeStyle = grad;
        cx.lineWidth = 2;
        cx.beginPath();
        cx.moveTo(ss.x, ss.y);
        cx.lineTo(ss.x - ss.len, ss.y - ss.len * 0.5);
        cx.stroke();
      }

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
