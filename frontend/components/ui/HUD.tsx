'use client';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { toast } from '@/components/ui/Toast';
import { SFX } from '@/lib/sfx';
import ProgressDots from './ProgressDots';

interface Props {
  levelName: string;
  totalQuestions: number;
  currentQuestion: number;
}

export default function HUD({ levelName, totalQuestions, currentQuestion }: Props) {
  const router = useRouter();
  const { powerups, currentLevel, l1score, l2score, l3score, l4score, auctScore } = useGameStore();
  const { freeze, unfreeze, frozen } = useTimerStore();
  const usePowerup = useGameStore(s => s.usePowerup);
  const currentHint = useGameStore(s => s.currentHint);

  const levelScores: Record<number, number> = { 1: l1score, 2: l2score, 3: l3score, 4: l4score, 5: auctScore };
  const currentScore = levelScores[currentLevel] ?? 0;

  const handlePowerup = (type: 'hint' | 'skip' | 'freeze') => {
    if (!usePowerup(type)) { toast('No ' + type + ' power-ups left!', 'err'); return; }
    SFX.powerup();
    if (type === 'hint') {
      toast('💡 ' + (currentHint || 'No hint available for this question.'), 'inf');
    } else if (type === 'freeze') {
      if (frozen) { toast('Timer already frozen!', 'err'); return; }
      freeze();
      toast('❄️ Timer frozen for 15 seconds!', 'inf');
      setTimeout(() => { unfreeze(); toast('❄️ Timer resumed!', 'inf'); }, 15000);
    } else if (type === 'skip') {
      toast('⏭ Question skipped!', 'inf');
      // Skip is handled by parent level component via a skip event
      window.dispatchEvent(new CustomEvent('grss-skip'));
    }
  };

  const handleAbort = () => {
    useTimerStore.getState().stopTimer();
    router.push('/dashboard');
  };

  return (
    <div className="hud" id="gameHud">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-sm" onClick={handleAbort}>← ABORT</button>
        <div className="hud-level font-orb">{levelName}</div>
        <ProgressDots total={totalQuestions} current={currentQuestion} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div className="pu-bar">
          <button
            className="pu-btn"
            disabled={powerups.hint <= 0}
            onClick={() => handlePowerup('hint')}
            aria-label="Use Hint power-up"
          >
            <span className="pu-icon">💡</span>
            <span className="pu-label">Hint</span>
            <span className="pu-count">{powerups.hint}</span>
          </button>
          <button
            className="pu-btn"
            disabled={powerups.skip <= 0}
            onClick={() => handlePowerup('skip')}
            aria-label="Use Skip power-up"
          >
            <span className="pu-icon">⏭</span>
            <span className="pu-label">Skip</span>
            <span className="pu-count">{powerups.skip}</span>
          </button>
          <button
            className="pu-btn"
            disabled={powerups.freeze <= 0}
            onClick={() => handlePowerup('freeze')}
            aria-label="Use Freeze power-up"
          >
            <span className="pu-icon">❄️</span>
            <span className="pu-label">Freeze</span>
            <span className="pu-count">{powerups.freeze}</span>
          </button>
        </div>
        <div className="hud-score">{currentScore.toLocaleString()} pts</div>
      </div>
    </div>
  );
}
