'use client';

import { useEffect, useRef } from 'react';

const BLIPS = [
  { a: 0.8, r: 0.45 }, { a: 2.1, r: 0.7 },
  { a: 3.8, r: 0.35 }, { a: 5.0, r: 0.6 },
  { a: 1.4, r: 0.82 }, { a: 4.4, r: 0.55 },
];

/**
 * RadarCanvas component
 * Renders a high-performance radar sweep background using HTML5 Canvas.
 * Centered precisely relative to its parent container.
 */
export default function RadarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d')!;
    let W: number, H: number, angle = 0, animId: number;

    const resize = () => {
      const parent = cv.parentElement;
      if (parent) {
        W = cv.width = parent.clientWidth;
        H = cv.height = parent.clientHeight;
      }
    };

    // Initial size
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!cv.width || !cv.height) return;
      W = cv.width;
      H = cv.height;
      const cx_ = W / 2;
      const cy_ = H / 2;
      const maxR = Math.min(W, H) * 0.42;

      cx.clearRect(0, 0, W, H);

      // 1. Grid lines (faint)
      cx.strokeStyle = 'rgba(0,240,255,0.04)';
      cx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const y = cy_ + (i / 4) * maxR;
        cx.beginPath();
        cx.moveTo(cx_ - maxR, y);
        cx.lineTo(cx_ + maxR, y);
        cx.stroke();
        
        const x = cx_ + (i / 4) * maxR;
        cx.beginPath();
        cx.moveTo(x, cy_ - maxR);
        cx.lineTo(x, cy_ + maxR);
        cx.stroke();
      }

      // 2. Concentric rings
      for (let r = 1; r <= 5; r++) {
        const rad = (r / 5) * maxR;
        cx.strokeStyle = r === 3 ? 'rgba(0,240,255,0.10)' : 'rgba(0,240,255,0.05)';
        cx.lineWidth = r === 3 ? 1.5 : 1;
        cx.beginPath();
        cx.arc(cx_, cy_, rad, 0, Math.PI * 2);
        cx.stroke();
      }

      // 3. Cross hairs
      cx.strokeStyle = 'rgba(0,240,255,0.06)';
      cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(cx_, cy_ - maxR); cx.lineTo(cx_, cy_ + maxR); cx.stroke();
      cx.beginPath(); cx.moveTo(cx_ - maxR, cy_); cx.lineTo(cx_ + maxR, cy_); cx.stroke();

      // 4. Wedge Trail (80 steps)
      for (let t = 0; t < 80; t++) {
        const trailAngle = angle - (t / 80) * (Math.PI * 0.75);
        const alpha = ((80 - t) / 80) * 0.15;
        cx.save();
        cx.beginPath();
        cx.moveTo(cx_, cy_);
        cx.arc(cx_, cy_, maxR, trailAngle, trailAngle + 0.05);
        cx.closePath();
        cx.fillStyle = `rgba(0,240,255,${alpha})`;
        cx.fill();
        cx.restore();
      }

      // 5. Sweep line
      const sweepGrad = cx.createLinearGradient(cx_, cy_, cx_ + Math.cos(angle) * maxR, cy_ + Math.sin(angle) * maxR);
      sweepGrad.addColorStop(0, 'rgba(0,240,255,0.7)');
      sweepGrad.addColorStop(1, 'rgba(0,240,255,0)');
      cx.beginPath();
      cx.moveTo(cx_, cy_);
      cx.lineTo(cx_ + Math.cos(angle) * maxR, cy_ + Math.sin(angle) * maxR);
      cx.strokeStyle = sweepGrad;
      cx.lineWidth = 2.5;
      cx.stroke();

      // 6. Center dot
      cx.beginPath();
      cx.arc(cx_, cy_, 3, 0, Math.PI * 2);
      cx.fillStyle = '#00f0ff'; // var(--nir)
      cx.shadowColor = '#00f0ff';
      cx.shadowBlur = 10;
      cx.fill();
      cx.shadowBlur = 0;

      // 7. Blips
      BLIPS.forEach(b => {
        const diff = ((angle - b.a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (diff < Math.PI * 0.8) {
          const fade = 1 - diff / (Math.PI * 0.8);
          cx.beginPath();
          cx.arc(cx_ + Math.cos(b.a) * b.r * maxR, cy_ + Math.sin(b.a) * b.r * maxR, 2.5, 0, Math.PI * 2);
          cx.fillStyle = `rgba(0,255,136,${fade * 0.8})`;
          cx.shadowColor = '#00ff88';
          cx.shadowBlur = 6 * fade;
          cx.fill();
          cx.shadowBlur = 0;
        }
      });

      angle = (angle + 0.012) % (Math.PI * 2);
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
      className="w-full h-full block" 
      style={{ display: 'block' }}
    />
  );
}
