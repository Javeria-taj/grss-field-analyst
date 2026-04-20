'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { LEVEL_INTROS } from '@/lib/gameData';
import { SFX } from '@/lib/sfx';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import Toast from '@/components/ui/Toast';

export default function LevelIntroPage() {
  const { level } = useParams<{ level: string }>();
  const router = useRouter();
  const { user, unlocked } = useGameStore();
  const lvl = parseInt(level);
  const intro = LEVEL_INTROS[lvl as keyof typeof LEVEL_INTROS];

  useEffect(() => {
    if (!user) router.replace('/');
    else if (!unlocked.includes(lvl)) router.replace('/dashboard');
  }, [user, unlocked, lvl, router]);

  if (!intro) return null;

  const begin = () => {
    SFX.click();
    router.push(`/mission/${lvl}/play`);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <StarfieldCanvas />
      <Toast />
      <div className="earth-deco" />

      <div className="center-col" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

          {/* Mission icon */}
          <motion.div
            style={{ fontSize: '3.2rem', display: 'block', marginBottom: 12 }}
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          >
            {intro.icon}
          </motion.div>

          {/* Badge */}
          <motion.span
            className="badge badge-blue"
            style={{ marginBottom: 12, display: 'inline-block' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {intro.badge}
          </motion.span>

          {/* Title */}
          <motion.h2
            className="font-orb t-accent glow-txt"
            style={{ margin: '10px 0 14px', fontSize: 'clamp(1.1rem,3vw,1.5rem)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {intro.title}
          </motion.h2>

          {/* Story */}
          <motion.p
            style={{ fontSize: '0.9rem', color: 'var(--text3)', lineHeight: 1.85, marginBottom: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
          >
            {intro.story}
          </motion.p>

          {/* Rules card */}
          <motion.div
            className="card card-sm"
            style={{ marginBottom: 22, textAlign: 'left' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, type: 'spring', stiffness: 260 }}
          >
            <div className="label" style={{ marginBottom: 8 }}>📋 MISSION RULES</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              {intro.rules}
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            style={{ display: 'flex', gap: 10, justifyContent: 'center' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <motion.button
              className="btn btn-outline"
              onClick={() => { SFX.click(); router.push('/dashboard'); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back
            </motion.button>
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={begin}
              id="beginMissionBtn"
              whileHover={{ scale: 1.04, translateY: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              🚀 BEGIN MISSION
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
