'use client';
import { useEffect, useRef, ReactNode } from 'react';
import { SFX, getACtx } from '@/lib/sfx';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { toast } from '@/components/ui/Toast';

export default function ClientShell({ children }: { children: ReactNode }) {
  const ambianceStarted = useRef(false);
  const wakeLockRef = useRef<any>(null);
  const focusLostRef = useRef(false);
  const { phase } = useGameSyncStore();

  // Screen Wake Lock API & Visibility Tracking
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
      focusLostRef.current = false; // Reset on phase change
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (phase === 'question_active') {
          focusLostRef.current = true;
        }
      } else if (document.visibilityState === 'visible') {
        if (phase === 'question_active' || phase === 'auction_active' || phase === 'disaster_active') {
          requestWakeLock();
        }
        
        if (focusLostRef.current && phase === 'question_active') {
          SFX.urgency();
          toast('WARNING: Focus lost. Ensure you remain on this screen during active missions.', 'err');
          focusLostRef.current = false;
        }
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

  // Prevent accidental navigation during active game phases
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase !== 'idle' && phase !== 'game_over') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  return (
    <div id="app-viewport">
      {children}
    </div>
  );
}
