'use client';
import { useEffect, useRef } from 'react';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentLevel, phase } = useGameSyncStore();
  const mouseRef = useRef({ x: 0.5, y: 0.5 }); // normalized 0-1

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d')!;

    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener('mousemove', onMouseMove);

    // Three-layer parallax star layers
    const isMobile = window.innerWidth < 768;
    const layers = [
      // far layer — barely moves, dim, tiny
      Array.from({ length: isMobile ? 150 : 450 }, () => ({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 0.9 + 0.2,
        spd: Math.random() * 0.06 + 0.01,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.015 + 0.003,
        col: Math.random() > 0.94 ? '#00c8ff' : '#b8d8ff',
        depth: 0.2,
      })),
      // mid layer
      Array.from({ length: isMobile ? 100 : 250 }, () => ({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.3 + 0.3,
        spd: Math.random() * 0.12 + 0.03,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.025 + 0.005,
        col: Math.random() > 0.92 ? '#00ff9d' : '#cce8ff',
        depth: 0.5,
      })),
      // near layer — most parallax, bigger, brighter
      Array.from({ length: isMobile ? 40 : 80 }, () => ({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 2.0 + 0.5,
        spd: Math.random() * 0.22 + 0.06,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.04 + 0.008,
        col: Math.random() > 0.9 ? '#7c3aed' : '#e0f0ff',
        depth: 1.0,
      })),
    ];

    // Shooting stars pool
    const shootingStars: {
      x: number; y: number; len: number; spd: number; opacity: number; angle: number;
    }[] = [];

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height * 0.5,
        len: Math.random() * 100 + 60,
        spd: Math.random() * 12 + 8,
        opacity: 1,
        angle: Math.PI / 5 + (Math.random() - 0.5) * 0.4,
      });
    };

    let animId: number;

    const draw = () => {
      const isAnomaly = phase === 'anomaly_active';
      const isDisaster = phase === 'disaster_active';
      const mx = mouseRef.current.x - 0.5; // -0.5 to +0.5
      const my = mouseRef.current.y - 0.5;

      // Phase-reactive background tint
      cx.clearRect(0, 0, cv.width, cv.height);
      if (isAnomaly) {
        cx.fillStyle = 'rgba(80,0,20,0.18)';
        cx.fillRect(0, 0, cv.width, cv.height);
      } else if (isDisaster) {
        cx.fillStyle = 'rgba(40,20,0,0.14)';
        cx.fillRect(0, 0, cv.width, cv.height);
      }

      // Draw layers with parallax
      for (const layer of layers) {
        const parallaxStrength = layer[0].depth * 30; // px shift at max tilt
        const ox = mx * parallaxStrength;
        const oy = my * parallaxStrength;

        for (const s of layer) {
          s.tw += s.tws * (isAnomaly ? 3.5 : 1);
          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(s.tw));
          // In anomaly: stars shift red; in disaster: orange tint
          let col = s.col;
          if (isAnomaly) col = '#ff3355';
          else if (isDisaster) col = '#ff8833';

          cx.globalAlpha = twinkle * (isAnomaly ? 0.9 : 0.7);
          cx.fillStyle = col;
          cx.beginPath();
          const px = (s.x * cv.width + ox + cv.width) % cv.width;
          const py = (s.y * cv.height + oy + cv.height) % cv.height;
          cx.arc(px, py, s.r * (isAnomaly ? 1.4 : 1), 0, Math.PI * 2);
          cx.fill();
          cx.globalAlpha = 1;

          // Drift downward slowly
          s.y += s.spd * 0.0006 * (isAnomaly ? 3 : 1);
          if (s.y > 1) { s.y = 0; s.x = Math.random(); }
        }
      }

      // Shooting stars — spawn less in tense phases
      if (Math.random() < (isAnomaly ? 0.006 : 0.025)) spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.spd;
        ss.y += Math.sin(ss.angle) * ss.spd;
        ss.opacity -= 0.018;
        if (ss.opacity <= 0) { shootingStars.splice(i, 1); continue; }
        const grad = cx.createLinearGradient(ss.x, ss.y, ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
        grad.addColorStop(0, `rgba(255,255,255,${ss.opacity})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        cx.strokeStyle = grad;
        cx.lineWidth = 1.8;
        cx.beginPath();
        cx.moveTo(ss.x, ss.y);
        cx.lineTo(ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
        cx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [phase]); // re-init when phase changes so star color mode reacts immediately

  const moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕'];
  const moonPhase = currentLevel >= 1 && currentLevel <= 5 ? moonPhases[currentLevel - 1] : null;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      />
      {moonPhase && (
        <div style={{
          position: 'fixed', top: '20%', left: '10%',
          fontSize: '8rem', opacity: 0.7,
          pointerEvents: 'none', zIndex: 1,
          textShadow: '0 0 40px rgba(255,255,255,0.4)',
          filter: 'grayscale(0.1) contrast(1.1)',
          transition: 'opacity 1s ease',
        }}>
          {moonPhase}
        </div>
      )}
    </>
  );
}
