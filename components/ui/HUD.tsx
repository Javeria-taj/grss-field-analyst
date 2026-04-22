'use client';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { toast } from '@/components/ui/Toast';
import { SFX } from '@/lib/sfx';
import ProgressDots from './ProgressDots';
import TimerBar from './TimerBar';

interface Props {
  levelName: string;
  totalQuestions: number;
  currentQuestion: number;
}

const POWERUP_CONFIG = [
  { type: 'hint' as const, icon: '💡', label: 'Hint' },
  { type: 'skip' as const, icon: '⏭', label: 'Skip' },
  { type: 'freeze' as const, icon: '❄️', label: 'Freeze' },
];

export default function HUD({ levelName, totalQuestions, currentQuestion }: Props) {
  const router = useRouter();
  const { powerups, currentLevel, l1score, l2score, l3score, l4score, auctScore } = useGameStore();
  const { freeze, unfreeze, frozen } = useTimerStore();
  const usePowerup = useGameStore((s: any) => s.usePowerup);
  const currentHint = useGameStore((s: any) => s.currentHint);
  const freezeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const levelScores: Record<number, number> = { 1: l1score, 2: l2score, 3: l3score, 4: l4score, 5: auctScore };
  const currentScore = levelScores[currentLevel] ?? 0;

  const handlePowerup = (type: 'hint' | 'skip' | 'freeze') => {
    if (!usePowerup(type)) {
      toast(`No ${type} power-ups left!`, 'err');
      return;
    }
    SFX.powerup();

    if (type === 'hint') {
      toast('💡 ' + (currentHint || 'No hint available for this question.'), 'inf');
    } else if (type === 'freeze') {
      if (frozen) { toast('Timer already frozen!', 'err'); return; }
      freeze();
      toast('❄️ Timer frozen for 15 seconds!', 'inf');
      if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
      freezeTimeoutRef.current = setTimeout(() => {
        unfreeze();
        toast('❄️ Timer resumed!', 'inf');
      }, 15000);
    } else if (type === 'skip') {
      toast('⏭ Question skipped!', 'inf');
      window.dispatchEvent(new CustomEvent('grss-skip'));
    }
  };

  const handleAbort = () => {
    useTimerStore.getState().stopTimer();
    if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
    router.push('/dashboard');
  };

  return (
    <div className="hud" id="gameHud">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        <motion.button
          className="btn btn-outline btn-sm"
          onClick={handleAbort}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          style={{ minWidth: '70px', padding: '6px 10px' }}
        >
          ← EXIT
        </motion.button>
        <div className="hud-level font-orb t-accent" style={{ fontWeight: 700 }}>{levelName}</div>
        <div className="hide-mobile">
          <ProgressDots total={totalQuestions} current={currentQuestion} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="pu-bar">
          {POWERUP_CONFIG.map(({ type, icon, label }, idx) => (
            <motion.button
              key={type}
              className="pu-btn"
              disabled={powerups[type] <= 0}
              onClick={() => handlePowerup(type)}
              aria-label={`Use ${label} power-up`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, type: 'spring', stiffness: 400 }}
              whileTap={{ scale: 0.88 }}
              whileHover={powerups[type] > 0 ? { scale: 1.08 } : {}}
            >
              <span className="pu-icon">{icon}</span>
              <span className="pu-label">{label}</span>
              <span className="pu-count">{powerups[type]}</span>
            </motion.button>
          ))}
        </div>
        <motion.div
          key={currentScore}
          className="hud-score font-orb"
          style={{ fontSize: '1.2rem', color: 'var(--accent2)', minWidth: '90px', textAlign: 'right' }}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {currentScore.toLocaleString()}
        </motion.div>
      </div>
    </div>
  );
}

