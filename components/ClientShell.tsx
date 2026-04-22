'use client';
import { useEffect, useRef } from 'react';
import { SFX, getACtx } from '@/lib/sfx';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const ambianceStarted = useRef(false);
  const wakeLockRef = useRef<any>(null);
  const { phase } = useGameSyncStore();

  // Screen Wake Lock API
  useEffect(() => {
    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          if (wakeLockRef.current) return; // Already locked
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null;
          });
        } catch (err) {
          console.warn('Wake Lock error:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.warn('Wake Lock release error:', err);
        }
      }
    };

    if (phase === 'question_active' || phase === 'auction_active' || phase === 'disaster_active') {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (phase === 'question_active' || phase === 'auction_active' || phase === 'disaster_active')) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [phase]);

  // Audio initialization
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
