'use client';
import { useEffect, useRef } from 'react';
import { SFX, getACtx } from '@/lib/sfx';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const ambianceStarted = useRef(false);

  useEffect(() => {
    const handleInteraction = () => {
      const ctx = getACtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      if (!ambianceStarted.current) {
        SFX.ambience();
        ambianceStarted.current = true;
      }
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <div id="app-viewport">
      {children}
    </div>
  );
}
