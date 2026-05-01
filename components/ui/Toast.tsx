'use client';
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ToastType } from '@/lib/types';

interface ToastItem {
  id: number;
  msg: string;
  type: ToastType;
}

type ToastFn = (msg: string, type?: ToastType) => void;

let _toastFn: ToastFn | null = null;

export function toast(msg: string, type: ToastType = 'inf'): void {
  _toastFn?.(msg, type);
}

const TOAST_CONFIG: Record<ToastType, { bg: string; border: string; label: string; dot: string; icon: string }> = {
  ok:  { bg: 'rgba(0,20,10,0.92)',  border: '#00ff9d', label: 'SIGNAL ACQUIRED', dot: '#00ff9d', icon: '📡' },
  err: { bg: 'rgba(25,0,5,0.94)',   border: '#ff3355', label: 'TRANSMISSION LOST', dot: '#ff3355', icon: '⚠️' },
  inf: { bg: 'rgba(0,8,25,0.92)',   border: '#00c8ff', label: 'INCOMING COMMS',  dot: '#00c8ff', icon: '🛰️' },
};

let _nextId = 0;

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast: ToastFn = useCallback((msg, type = 'inf') => {
    const id = _nextId++;
    setToasts(prev => [...prev.slice(-3), { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    _toastFn = addToast;
    return () => { _toastFn = null; };
  }, [addToast]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
        maxWidth: 'min(340px, 90vw)',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => {
          const cfg = TOAST_CONFIG[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: -60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}44`,
                borderLeft: `3px solid ${cfg.border}`,
                borderRadius: 10,
                backdropFilter: 'blur(16px)',
                boxShadow: `0 4px 30px rgba(0,0,0,0.6), 0 0 16px ${cfg.border}22`,
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              {/* Top bar with label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px',
                borderBottom: `1px solid ${cfg.border}22`,
                background: `${cfg.border}08`,
              }}>
                {/* Animated ping dot */}
                <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: cfg.dot, animation: 'toast-ping 1.2s ease-out infinite', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: cfg.dot }} />
                </div>
                <span style={{ fontSize: '0.55rem', letterSpacing: 2, fontWeight: 900, color: cfg.dot, fontFamily: 'var(--font-orbitron, monospace)', textTransform: 'uppercase' }}>
                  {cfg.label}
                </span>
                {/* Waveform SVG */}
                <svg viewBox="0 0 40 12" style={{ marginLeft: 'auto', width: 36, height: 10, opacity: 0.5 }}>
                  <polyline
                    points="0,6 5,6 7,2 9,10 11,4 13,8 15,6 20,6 22,1 24,11 26,6 30,6 32,3 34,9 36,6 40,6"
                    fill="none"
                    stroke={cfg.dot}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* Message body */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
                <span style={{ fontSize: '0.84rem', color: '#e8f4ff', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {t.msg}
                </span>
              </div>
              <style>{`
                @keyframes toast-ping {
                  0%   { transform: scale(1);   opacity: 0.6; }
                  75%  { transform: scale(2.2); opacity: 0; }
                  100% { transform: scale(2.2); opacity: 0; }
                }
              `}</style>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
