'use client';
import { useEffect, useRef } from 'react';

interface Props {
  target: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({ target, duration = 900, className }: Props) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const start = parseInt(el.current.textContent?.replace(/,/g, '') || '0') || 0;
    const diff = target - start;
    if (diff === 0) { el.current.textContent = target.toLocaleString(); return; }
    const steps = Math.min(60, Math.abs(diff));
    const stepTime = duration / steps;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      const current = Math.round(start + diff * (count / steps));
      if (el.current) {
        el.current.textContent = current.toLocaleString();
        el.current.classList.remove('score-counter');
        void el.current.offsetWidth;
        el.current.classList.add('score-counter');
      }
      if (count >= steps) {
        clearInterval(timer);
        if (el.current) el.current.textContent = target.toLocaleString();
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span ref={el} className={className}>0</span>;
}
