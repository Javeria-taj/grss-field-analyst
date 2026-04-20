'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { calcScore } from '@/lib/scoring';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import HUD from '@/components/ui/HUD';
import TimerBar from '@/components/ui/TimerBar';
import FeedbackOverlay from '@/components/ui/FeedbackOverlay';
import { motion } from 'framer-motion';

import { useLeaderboardStore } from '@/stores/useLeaderboardStore';
import { getTotalScore } from '@/lib/scoring';

type FBState = { type: 'ok' | 'bad' | 'timeout'; icon: string; title: string; body: string } | null;

export default function Level1Play() {
  const router = useRouter();
  const gs = useGameStore();
  const { startTimer, stopTimer, timeVal } = useTimerStore();
  const [fb, setFb] = useState<FBState>(null);
  const [inputVal, setInputVal] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const qStateRef = useRef<{ ans: string; timeWhenSubmitted: number } | null>(null);

  const q = gs.l1q[gs.l1idx];

  const goNext = useCallback(() => {
    setFb(null);
    setInputVal('');
    setInputDisabled(false);
    qStateRef.current = null;
    gs.incL1Idx();
    gs.syncState();
  }, [gs]);

  const onTimerDone = useCallback(() => {
    const qs = qStateRef.current;
    const correctRaw = q ? (q.type === 'scramble' ? q.word : q.ans) : '';
    const correct = correctRaw.toUpperCase();
    if (!qs) {
      SFX.wrong();
      setFb({ type: 'timeout', icon: '⏰', title: "TIME'S UP!", body: `The answer was: <strong>${correct}</strong>.<br><br>${q?.hint}` });
    } else {
      const userAns = qs.ans;
      const isCorrect = userAns === correct || userAns === correct.replace(/\s+/g, '');
      
      // RECORD TELEMETRY
      gs.addTelemetry({
        id: `L1-Q${gs.l1idx + 1}`,
        level: 1,
        question: isScramble ? `Unscramble: ${(q as any).sc}` : (q as any).q,
        isCorrect,
        timeTaken: 60 - qs.timeWhenSubmitted, // timeWhenSubmitted IS timeVal at submission
        timestamp: Date.now()
      });

      if (isCorrect) {
        const earned = calcScore(true, qs.timeWhenSubmitted, 60, q?.pts || 100);
        gs.addL1Score(earned);
        gs.incL1Correct();
        SFX.correct();
        setFb({ type: 'ok', icon: '✅', title: 'CORRECT!', body: `+${earned} pts earned!<br><br>${q?.hint}` });
      } else {
        SFX.wrong();
        setFb({ type: 'bad', icon: '❌', title: 'INCORRECT!', body: `Answer: <strong>${correct}</strong><br><br>${q?.hint}` });
      }
    }
  }, [q, gs]);

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
    if (gs.l1q.length === 0) gs.startL1();
  }, []);

  useEffect(() => {
    if (!q) return;
    gs.setCurrentHint(q.hint);
    gs.setCurrentLevel(1);
    gs.setQState(null);
    qStateRef.current = null;
    setInputVal('');
    setInputDisabled(false);
    setFb(null);
    startTimer(60, onTimerDone);
    return () => stopTimer();
  }, [gs.l1idx]); // eslint-disable-line

  // Skip handler
  useEffect(() => {
    const handleSkip = () => { stopTimer(); onTimerDone(); };
    window.addEventListener('grss-skip', handleSkip);
    return () => window.removeEventListener('grss-skip', handleSkip);
  }, [onTimerDone]);

  const submit = useCallback(() => {
    if (qStateRef.current || inputDisabled) return;
    const ans = inputVal.trim().toUpperCase();
    if (!ans) return;
    qStateRef.current = { ans, timeWhenSubmitted: timeVal };
    gs.setQState({ ans, timeWhenSubmitted: timeVal });
    setInputDisabled(true);
    SFX.click();
    toast('Answer locked! Waiting for timer...', 'inf');
  }, [inputVal, inputDisabled, timeVal, gs]);

  // Finish level if all questions done
  if (gs.l1q.length > 0 && gs.l1idx >= gs.l1q.length) {
    gs.finishL1();
    stopTimer();
    router.replace('/results?level=1');
    return null;
  }

  if (!q) return null;

  const isScramble = q.type === 'scramble';

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <HUD levelName="LEVEL 1 — TRAINING" totalQuestions={gs.l1q.length} currentQuestion={gs.l1idx} />
        <TimerBar />
        <div className="page-content">
          <div style={{ maxWidth: 620, width: '100%' }}>
            {/* Header badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 6 }}>
              <span className={`badge ${isScramble ? 'badge-blue' : 'badge-green'}`}>
                {isScramble ? `WORD SCRAMBLE ${gs.l1idx + 1}/10` : `FIELD RIDDLE ${gs.l1idx + 1}/10`}
              </span>
              <span className="badge badge-purple">{('cat' in q ? q.cat : '')}</span>
              <span className="badge badge-gold">+{q.pts} pts</span>
            </div>

            {/* Question display */}
            <div className="card" style={{ marginBottom: 14 }}>
              {isScramble ? (
                <>
                  <div className="label t-center" style={{ marginBottom: 10 }}>UNSCRAMBLE THIS SATELLITE TERM</div>
                  <div className="scramble-disp">{(q as any).sc}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text2)', textAlign: 'center', marginTop: 7 }}>
                    {(q as any).sc.length} letters
                  </div>
                </>
              ) : (
                <>
                  <div className="label t-center" style={{ marginBottom: 10 }}>DECODE THE FIELD RIDDLE</div>
                  <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--white)' }}>{(q as any).q}</p>
                </>
              )}
            </div>

            {/* Input */}
            <input
              className="input input-lg"
              placeholder="TYPE YOUR ANSWER"
              maxLength={20}
              value={inputVal}
              disabled={inputDisabled}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
              id="l1answer"
            />
            <motion.button
              className="btn btn-primary btn-full"
              style={{ marginTop: 10 }}
              onClick={submit}
              onMouseEnter={() => !inputDisabled && SFX.hover()}
              whileHover={!inputDisabled ? { scale: 1.02 } : {}}
              whileTap={!inputDisabled ? { scale: 0.98 } : {}}
              disabled={inputDisabled}
              id="l1submitBtn"
            >
              {inputDisabled ? '⏳ Waiting for timer...' : '✅ SUBMIT ANSWER'}
            </motion.button>
          </div>
        </div>

        {fb && (
          <FeedbackOverlay
            type={fb.type}
            icon={fb.icon}
            title={fb.title}
            body={fb.body}
            onContinue={goNext}
          />
        )}
      </div>
    </div>
  );
}
