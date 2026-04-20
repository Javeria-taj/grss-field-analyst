'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { getTitle, getTotalScore } from '@/lib/scoring';
import { SFX } from '@/lib/sfx';
import { useConfetti } from '@/components/ui/ConfettiCanvas';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import ConfettiCanvas from '@/components/ui/ConfettiCanvas';
import Toast from '@/components/ui/Toast';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';

const LEVEL_NAMES: Record<number, string> = {
  1: '🔤 Training Mission',
  2: '🛰️ Intel Gathering',
  3: '🔐 Code Breaking',
  4: '⚡ Rapid Assessment',
  5: '🌍 Core Simulation',
};

export default function FinalPage() {
  const router = useRouter();
  const gs = useGameStore();
  const { entries, init, submitScore } = useLeaderboardStore();
  const { fire } = useConfetti();
  const fired = useRef(false);
  const total = getTotalScore(gs.scores);
  const title = getTitle(total);

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }

    init();

    if (!fired.current) {
      fired.current = true;
      SFX.final();
      setTimeout(() => fire(['#00c8ff', '#00ff9d', '#7c3aed', '#ffd700', '#ff6b35', '#ff2d55']), 300);

      submitScore({
        name: gs.user.name,
        usn: gs.user.usn,
        score: total,
      });
    }
  }, []); // eslint-disable-line

  if (!gs.user) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <StarfieldCanvas />
      <ConfettiCanvas />
      <Toast />
      <div className="earth-deco" />

      <div className="center-col" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 580, width: '100%', textAlign: 'center' }}>

          {/* Earth Icon */}
          <motion.div
            style={{ fontSize: '4rem', marginBottom: 12, display: 'block' }}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          >
            🌍
          </motion.div>

          {/* Subtitle */}
          <motion.div
            className="font-orb t-accent"
            style={{ fontSize: '0.85rem', letterSpacing: 3, marginBottom: 4 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            ALL MISSIONS COMPLETE
          </motion.div>

          {/* Title */}
          <motion.h2
            className="font-orb"
            style={{ marginBottom: 16 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            FINAL DEBRIEF
          </motion.h2>

          {/* Score */}
          <motion.div
            className="final-score"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <AnimatedCounter target={total} duration={1400} />
          </motion.div>
          <motion.div
            style={{ color: 'var(--text2)', marginBottom: 16 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            total mission score
          </motion.div>

          {/* Rank badge */}
          <motion.div
            className="title-badge-big revealed"
            style={{ marginBottom: 20 }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, type: 'spring', stiffness: 260 }}
          >
            {title.toUpperCase()}
          </motion.div>

          {/* Breakdown card */}
          <motion.div
            className="card"
            style={{ margin: '18px 0', textAlign: 'left' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15 }}
          >
            <div className="label t-center" style={{ marginBottom: 12 }}>📊 MISSION SCORE BREAKDOWN</div>
            {[1, 2, 3, 4, 5].map((lvl, i) => (
              <motion.div
                key={lvl}
                className="metric-row"
                style={{ border: lvl === 5 ? 'none' : undefined }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.25 + i * 0.08 }}
              >
                <span style={{ fontSize: '0.88rem' }}>{LEVEL_NAMES[lvl]}</span>
                <span className="metric-val">{(gs.scores[lvl] || 0).toLocaleString()} pts</span>
              </motion.div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--white)' }}>TOTAL</span>
              <span className="font-orb t-gold" style={{ fontSize: '1rem' }}>{total.toLocaleString()} pts</span>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
          >
            <motion.button
              className="btn btn-outline"
              onClick={() => { SFX.click(); router.push('/leaderboard'); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              🏆 Leaderboard
            </motion.button>
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => { SFX.click(); gs.logout(); router.push('/'); }}
              id="playAgainBtn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              🔄 Play Again
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
