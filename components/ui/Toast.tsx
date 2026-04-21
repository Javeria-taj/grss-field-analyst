'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
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

const TOAST_COLORS: Record<ToastType, string> = {
  ok: 'rgba(0, 180, 80, 0.92)',
  err: 'rgba(220, 30, 60, 0.92)',
  inf: 'rgba(0, 170, 230, 0.92)',
};

const TEXT_COLORS: Record<ToastType, string> = {
  ok: '#000',
  err: '#fff',
  inf: '#000',
};

let _nextId = 0;

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast: ToastFn = useCallback((msg, type = 'inf') => {
    const id = _nextId++;
    setToasts(prev => [...prev.slice(-4), { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    _toastFn = addToast;
    return () => { _toastFn = null; };
  }, [addToast]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              background: TOAST_COLORS[t.type],
              color: TEXT_COLORS[t.type],
              padding: '11px 18px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.88rem',
              maxWidth: 320,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'auto',
              wordBreak: 'break-word',
            }}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

