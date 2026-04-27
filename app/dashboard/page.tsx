'use client';
import { useEffect } from 'react';
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
export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useGameStore();
  const { phase, init, destroy, connected, paused, lastAnnouncement, preloadedAssets } = useGameSyncStore();

  useEffect(() => {
    if (!user) { router.replace('/'); return; }
    if (user.isAdmin) { router.replace('/admin'); return; }
    init();
    return () => { 
      destroy(); 
      SFX.stopMusic();
    };
  }, [user, router, init, destroy]);

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

  if (!user) return null;

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
