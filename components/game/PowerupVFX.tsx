'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

/* ─────────────────────────────────────────────────────────
   OrbitalSweepVFX — Radar-sweep that fills the screen
   Triggered when powerupResult.type === 'radar_pulse'
───────────────────────────────────────────────────────── */
function OrbitalSweepVFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const cx = cv.getContext('2d')!;
    const cx0 = cv.width / 2;
    const cy0 = cv.height / 2;
    const maxR = Math.hypot(cx0, cy0) * 1.1;

    let angle = -Math.PI / 2; // start from top
    let alpha = 1;
    let raf: number;

    const draw = () => {
      cx.clearRect(0, 0, cv.width, cv.height);

      // Draw sweep as a rotated arc segment with linear gradient
      cx.save();
      cx.globalAlpha = alpha * 0.55;
      cx.translate(cx0, cy0);
      cx.rotate(angle);
      const sweep = cx.createLinearGradient(0, 0, maxR, 0);
      sweep.addColorStop(0, 'rgba(0,255,136,0.0)');
      sweep.addColorStop(0.5, 'rgba(0,255,136,0.5)');
      sweep.addColorStop(1, 'rgba(0,255,136,0.0)');
      cx.fillStyle = sweep;
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.arc(0, 0, maxR, -Math.PI / 10, Math.PI / 10);
      cx.closePath();
      cx.fill();
      cx.restore();

      // Concentric scan rings
      for (let i = 1; i <= 4; i++) {
        const r = (maxR / 4) * i;
        cx.save();
        cx.globalAlpha = alpha * 0.15;
        cx.strokeStyle = '#00ff88';
        cx.lineWidth = 1;
        cx.setLineDash([6, 10]);
        cx.beginPath();
        cx.arc(cx0, cy0, r, 0, Math.PI * 2);
        cx.stroke();
        cx.restore();
      }

      // Centre origin dot
      cx.save();
      cx.globalAlpha = alpha * 0.9;
      cx.fillStyle = '#00ff88';
      cx.beginPath();
      cx.arc(cx0, cy0, 6, 0, Math.PI * 2);
      cx.fill();
      cx.restore();

      angle += 0.06; // ~3.4 deg/frame ≈ full rotation in ~1.7 sec
      if (angle > Math.PI * 6) {
        // 3 full sweeps, then fade
        alpha -= 0.04;
      }

      if (alpha > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        cx.clearRect(0, 0, cv.width, cv.height);
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9800,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   NeuralSyncVFX — RGB glitch flash + scanline overlay
   Triggered when powerupResult.type === 'thermal_scan'
───────────────────────────────────────────────────────── */
function NeuralSyncVFX() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.6, 1, 0.4, 1, 0] }}
      transition={{ duration: 0.9, times: [0, 0.1, 0.2, 0.35, 0.6, 0.75, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9800,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.04) 0px, rgba(0,255,255,0.04) 1px, transparent 1px, transparent 4px)',
        mixBlendMode: 'screen',
      }}
    >
      {/* Chromatic aberration layers */}
      <motion.div
        animate={{ x: [-4, 4, -2, 3, 0] }}
        transition={{ duration: 0.5, times: [0, 0.2, 0.5, 0.75, 1] }}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,0,80,0.08)',
          mixBlendMode: 'screen',
        }}
      />
      <motion.div
        animate={{ x: [4, -4, 2, -3, 0] }}
        transition={{ duration: 0.5, times: [0, 0.2, 0.5, 0.75, 1] }}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,200,255,0.08)',
          mixBlendMode: 'screen',
        }}
      />
      {/* White flash pulse */}
      <motion.div
        animate={{ opacity: [0, 0.18, 0, 0.1, 0] }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', inset: 0, background: '#fff' }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PowerupVFX — Master controller, mounts the right VFX
───────────────────────────────────────────────────────── */
export default function PowerupVFX() {
  const powerupResult = useGameSyncStore(s => s.powerupResult);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!powerupResult) { setActive(null); return; }
    setActive(powerupResult.type);
    // Auto-dismiss VFX after animation completes
    const t = setTimeout(() => setActive(null), powerupResult.type === 'radar_pulse' ? 3200 : 1200);
    return () => clearTimeout(t);
  }, [powerupResult]);

  return (
    <AnimatePresence>
      {active === 'radar_pulse'  && <OrbitalSweepVFX key="radar" />}
      {active === 'thermal_scan' && <NeuralSyncVFX   key="neural" />}
    </AnimatePresence>
  );
}
