'use client';
import { useEffect, useRef, ReactNode } from 'react';
import { SFX, getACtx } from '@/lib/sfx';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { toast } from '@/components/ui/Toast';

export default function ClientShell({ children }: { children: ReactNode }) {
  const ambianceStarted = useRef(false);
  const wakeLockRef = useRef<any>(null);
  const focusLostRef = useRef(false);
  const { phase, setFocusViolation } = useGameSyncStore();

  // Screen Wake Lock API & Visibility Tracking
  useEffect(() => {
    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && document.visibilityState === 'visible') {
        try {
          if (wakeLockRef.current) return; // Already locked
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null;
          });
        } catch (err) {
          if ((err as Error).name !== 'NotAllowedError') {
            console.warn('Wake Lock error:', err);
          }
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

    const isStrictPhase = phase === 'question_active' || phase === 'auction_active' || phase === 'disaster_active';

    if (isStrictPhase) {
      requestWakeLock();
      // If phase becomes active and we aren't in fullscreen, flag violation immediately
      if (!document.fullscreenElement) {
        setFocusViolation(true);
      }
    } else {
      releaseWakeLock();
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isStrictPhase) {
        setFocusViolation(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isStrictPhase) {
        setFocusViolation(true);
      } else if (document.visibilityState === 'visible' && isStrictPhase) {
        requestWakeLock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [phase, setFocusViolation]);

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
