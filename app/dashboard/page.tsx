'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import IdlePhase from '@/components/game/IdlePhase';
import LevelIntroPhase from '@/components/game/LevelIntroPhase';
import QuestionPhase from '@/components/game/QuestionPhase';
import ReviewPhase from '@/components/game/ReviewPhase';
import LevelCompletePhase from '@/components/game/LevelCompletePhase';
import AuctionPhase from '@/components/game/AuctionPhase';
import DisasterPhase from '@/components/game/DisasterPhase';
import GameOverPhase from '@/components/game/GameOverPhase';
import GameHUD from '@/components/game/GameHUD';
import Toast, { toast } from '@/components/ui/Toast';
import { SFX } from '@/lib/sfx';
import AnomalyPhase from '@/components/game/AnomalyPhase';
import MissionLockout from '@/components/game/MissionLockout';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, _hasHydrated, rehydrateFromCookie } = useGameStore();
  const { phase, init, destroy, connected, paused, lastAnnouncement, preloadedAssets } = useGameSyncStore();
  const [sessionChecked, setSessionChecked] = useState(false);

  // ── Session Recovery ──
  // Wait for Zustand persist to hydrate from localStorage.
  // If localStorage has no user, attempt cookie-based recovery via /api/auth/me.
  // Only redirect to login after BOTH checks fail.
  useEffect(() => {
    if (!_hasHydrated) return; // Wait for localStorage hydration

    if (user) {
      // User already in store (localStorage had them)
      setSessionChecked(true);
      return;
    }

    // localStorage is empty — try to recover from the HTTP-only cookie
    rehydrateFromCookie().finally(() => {
      setSessionChecked(true);
    });
  }, [_hasHydrated, user, rehydrateFromCookie]);

  // ── Routing Guard ──
  // Only redirect after we've fully attempted session recovery.
  useEffect(() => {
    if (!sessionChecked) return;
    if (!user) { router.replace('/'); return; }
    if (user.isAdmin) { router.replace('/admin'); return; }
  }, [sessionChecked, user, router]);

  // ── Socket Init ──
  useEffect(() => {
    if (!user || user.isAdmin) return;
    init();
    return () => { 
      destroy(); 
      SFX.stopMusic();
    };
  }, [user, init, destroy]);

  useEffect(() => {
    if (phase === 'question_active') SFX.playMusic('active');
    else if (phase === 'auction_active' || phase === 'disaster_active' || phase === 'anomaly_active') SFX.playMusic('tense');
    else SFX.playMusic('ambient');
  }, [phase]);

  useEffect(() => {
    if (lastAnnouncement) {
      toast(`📢 ${lastAnnouncement}`, 'inf');
    }
  }, [lastAnnouncement]);

  // ── Loading State ──
  // Show a branded loading indicator while we check the session,
  // instead of returning null (which caused the blank screen).
  if (!sessionChecked || !user) {
    return (
      <div style={{
        position: 'relative', zIndex: 1, minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '3rem' }}
        >
          🛰️
        </motion.div>
        <div className="font-orb" style={{ color: 'var(--accent)', fontSize: '0.85rem', letterSpacing: 2 }}>
          RESTORING SESSION…
        </div>
      </div>
    );
  }

  const renderPhase = () => {
    switch (phase) {
      case 'idle': return <IdlePhase />;
      case 'level_intro': return <LevelIntroPhase />;
      case 'question_active': return <QuestionPhase />;
      case 'question_review': return <ReviewPhase />;
      case 'level_complete': return <LevelCompletePhase user={user} />;
      case 'auction_active': return <AuctionPhase />;
      case 'disaster_active': return <DisasterPhase />;
      case 'game_over': return <GameOverPhase />;
      case 'anomaly_active': return <AnomalyPhase />;
      default: return <IdlePhase />;
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div className="earth-deco" />
      <Toast />
      <MissionLockout />
      <GameHUD user={user} connected={connected} paused={paused} onLogout={async () => {
        try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
        logout(); router.replace('/');
      }} />
      <div style={{ position: 'relative', zIndex: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'none' }}>
          {preloadedAssets.map(url => (
            <link key={url} rel="preload" as="image" href={url} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

