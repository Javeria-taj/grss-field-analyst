'use client';
import { useEffect, useRef } from 'react';

interface ToastItem {
  id: number;
  msg: string;
  type: 'ok' | 'err' | 'inf';
}

let _toastFn: ((msg: string, type?: 'ok' | 'err' | 'inf') => void) | null = null;

export function toast(msg: string, type: 'ok' | 'err' | 'inf' = 'inf') {
  _toastFn?.(msg, type);
}

export default function Toast() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    _toastFn = (msg, type = 'inf') => {
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3200);
    };
    return () => { _toastFn = null; };
  }, []);

  return <div ref={containerRef} />;
}
