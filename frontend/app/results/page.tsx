'use client';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { getTitle, getTotalScore } from '@/lib/scoring';
import { SFX } from '@/lib/sfx';
import { useConfetti } from '@/components/ui/ConfettiCanvas';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { Suspense } from 'react';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';

const LEVEL_META: Record<number, { icon: string; name: string; confetti: string[]; next: number | null }> = {
  1: { icon: '🔤', name: 'TRAINING MISSION COMPLETE', confetti: ['#00c8ff', '#00ff9d', '#7c3aed'], next: 2 },
  2: { icon: '🛰️', name: 'INTEL GATHERING COMPLETE', confetti: ['#00ff9d', '#00c8ff', '#ffd700'], next: 3 },
  3: { icon: '🔐', name: 'CODE BREAKING COMPLETE', confetti: ['#7c3aed', '#a78bfa', '#00c8ff'], next: 4 },
  4: { icon: '⚡', name: 'RAPID ASSESSMENT COMPLETE', confetti: ['#ffaa00', '#ffd700', '#ff6b35'], next: 5 },
  5: { icon: '🌍', name: 'CORE SIMULATION COMPLETE', confetti: ['#ff6b35', '#ffd700', '#00ff9d'], next: null },
};

const STAT_ROWS = [
  { label: 'Questions Correct', key: 'correct' },
  { label: 'Accuracy', key: 'accuracy' },
];

function ResultsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const lvl = parseInt(params.get('level') ?? '1');
  const gs = useGameStore();
  const { fire } = useConfetti();
  const fired = useRef(false);
  const meta = LEVEL_META[lvl];
  const levelScore = gs.scores[lvl] ?? 0;
  const total = getTotalScore(gs.scores);
  const correct = [gs.l1correct, gs.l2correct, gs.l3correct, gs.l4correct][lvl - 1] ?? 0;
  const totalQ = [10, 5, 5, 10][lvl - 1] ?? 1;
  const accuracy = Math.round((correct / totalQ) * 100);

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
    if (!fired.current) {
      fired.current = true;
      SFX.levelUp();
      setTimeout(() => fire(meta?.confetti), 300);

      // PERSIST PROGRESS TO BACKEND AFTER EACH MISSION
      const ls = useLeaderboardStore.getState();
      ls.submitScore({
        name: gs.user.name,
        usn: gs.user.usn,
        score: total,
        progress: {
          unlocked: gs.unlocked,
          completed: gs.completed,
          scores: gs.scores,
          powerups: gs.powerups,
          telemetry: gs.telemetry
        }
      });
    }
  }, []); // eslint-disable-line

  const goNext = () => {
    SFX.click();
    if (meta?.next) router.push(`/mission/${meta.next}/intro`);
    else router.push('/final');
  };

  if (!gs.user || !meta) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <div className="earth-deco" />

      <div className="center-col" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>

          {/* Icon */}
          <motion.div
            style={{ fontSize: '3.2rem', display: 'block', marginBottom: 12 }}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 14 }}
          >
            {meta.icon}
          </motion.div>

          {/* Mission name */}
          <motion.div
            className="font-orb t-accent"
            style={{ fontSize: '0.85rem', letterSpacing: 2, marginBottom: 6 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {meta.name}
          </motion.div>

          {/* Score */}
          <motion.div
            className="final-score"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 220 }}
          >
            <AnimatedCounter target={levelScore} />
          </motion.div>

          <motion.div
            style={{ fontSize: '0.88rem', color: 'var(--text2)', marginBottom: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            points earned this mission
          </motion.div>

          {/* Stats card */}
          <motion.div
            className="card"
            style={{ marginBottom: 20, textAlign: 'left' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {lvl <= 4 && (
              <>
                {/* Accuracy bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Accuracy</span>
                    <span className="font-orb t-accent2" style={{ fontSize: '0.88rem' }}>{correct}/{totalQ} correct · {accuracy}%</span>
                  </div>
                  <div style={{ width: '100%', height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                      style={{
                        height: '100%',
                        borderRadius: 4,
                        background: accuracy >= 80
                          ? 'linear-gradient(90deg, var(--accent2), #38bdf8)'
                          : accuracy >= 50
                          ? 'linear-gradient(90deg, var(--warning), var(--accent4))'
                          : 'linear-gradient(90deg, var(--danger), #f97316)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${accuracy}%` }}
                      transition={{ delay: 0.85, duration: 0.9, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="metric-row" style={{ border: 'none' }}>
              <span style={{ fontSize: '0.88rem' }}>Total Score So Far</span>
              <span className="metric-val">{total.toLocaleString()}</span>
            </div>
            <div className="metric-row" style={{ border: 'none', marginTop: 4 }}>
              <span style={{ fontSize: '0.88rem' }}>Current Rank</span>
              <span className="metric-val" style={{ color: 'var(--accent3)' }}>{getTitle(total)}</span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <motion.button
              className="btn btn-outline"
              onClick={() => { SFX.click(); router.push('/leaderboard'); }}
              onMouseEnter={() => SFX.hover()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              🏆 Leaderboard
            </motion.button>
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={goNext}
              onMouseEnter={() => SFX.hover()}
              id="nextMissionBtn"
              whileHover={{ scale: 1.04, translateY: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              {meta.next ? 'NEXT MISSION →' : '🌍 FINAL DEBRIEF →'}
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
