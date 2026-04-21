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
import DATA from '@/lib/gameData';
import Image from 'next/image';
import { motion } from 'framer-motion';

type FBState = { type: 'ok' | 'bad' | 'timeout'; icon: string; title: string; body: string } | null;

export default function Level2Play() {
  const router = useRouter();
  const gs = useGameStore();
  const { startTimer, stopTimer, timeVal } = useTimerStore();
  const [fb, setFb] = useState<FBState>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [revealState, setRevealState] = useState<Record<number, 'correct' | 'wrong' | ''>>({});
  const qStateRef = useRef<{ ans: number; timeWhenSubmitted: number } | null>(null);

  const qs = DATA.level2.qs;
  const q = qs[gs.l2idx];

  const goNext = useCallback(() => {
    setFb(null); setSelected(null); setLocked(false); setRevealState({});
    qStateRef.current = null;
    gs.incL2Idx();
    gs.syncState();
  }, [gs]);

  const onTimerDone = useCallback(() => {
    const qs2 = qStateRef.current;
    if (!qs2) {
      SFX.wrong();
      setFb({ type: 'timeout', icon: '⏰', title: "TIME'S UP!", body: `Correct: <strong>${q.opts[q.ans]}</strong><br><br>${q.expl}` });
    } else {
      const i = qs2.ans;
      const reveal: Record<number, 'correct' | 'wrong' | ''> = {};
      q.opts.forEach((_, j) => { reveal[j] = j === q.ans ? 'correct' : j === i ? 'wrong' : ''; });
      setRevealState(reveal);
      
      const isCorrect = i === q.ans;

      // RECORD TELEMETRY
      gs.addTelemetry({
        id: `L2-Q${gs.l2idx + 1}`,
        level: 2,
        question: q.q,
        isCorrect,
        timeTaken: 60 - qs2.timeWhenSubmitted,
        timestamp: Date.now()
      });

      if (isCorrect) {
        const earned = calcScore(true, qs2.timeWhenSubmitted, 60, q.pts);
        gs.addL2Score(earned); gs.incL2Correct();
        SFX.correct();
        setTimeout(() => setFb({ type: 'ok', icon: '✅', title: 'CORRECT ANALYSIS!', body: `+${earned} pts!<br><br>${q.expl}` }), 400);
      } else {
        SFX.wrong();
        setTimeout(() => setFb({ type: 'bad', icon: '❌', title: 'MISIDENTIFIED!', body: `Correct: <strong>${q.opts[q.ans]}</strong><br><br>${q.expl}` }), 400);
      }
    }
  }, [q, gs]);

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!q) return;
    gs.setCurrentHint('Study the image carefully — colour patterns, geometric shapes and textures reveal the land process shown.');
    gs.setCurrentLevel(2);
    setFb(null); setSelected(null); setLocked(false); setRevealState({});
    qStateRef.current = null;
    startTimer(60, onTimerDone);
    return () => stopTimer();
  }, [gs.l2idx]); // eslint-disable-line

  useEffect(() => {
    const handleSkip = () => { stopTimer(); onTimerDone(); };
    window.addEventListener('grss-skip', handleSkip);
    return () => window.removeEventListener('grss-skip', handleSkip);
  }, [onTimerDone]);

  const submit = (i: number) => {
    if (locked) return;
    qStateRef.current = { ans: i, timeWhenSubmitted: timeVal };
    setSelected(i); setLocked(true);
    SFX.click();
    toast('Answer locked! Waiting for timer...', 'inf');
  };

  if (gs.l2idx >= qs.length) {
    gs.finishL2(); stopTimer();
    router.replace('/results?level=2'); return null;
  }
  if (!q) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <HUD levelName="LEVEL 2 — INTEL GATHERING" totalQuestions={qs.length} currentQuestion={gs.l2idx} />
        <TimerBar />
        <div className="page-content">
          <div style={{ maxWidth: 640, width: '92vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
              <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>IMAGE ANALYSIS {gs.l2idx + 1}/{qs.length}</span>
              <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>+{q.pts} pts</span>
            </div>

            {/* Image */}
            <div className="img-container" style={{ marginBottom: 13, maxHeight: '200px' }}>
              <Image
                src={q.img}
                alt="Satellite imagery"
                width={640}
                height={200}
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                unoptimized
              />
            </div>

            {/* Question */}
            <div className="card" style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 500, color: 'var(--white)', lineHeight: 1.6 }}>{q.q}</p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.opts.map((opt, i) => {
                const rv = revealState[i];
                return (
                  <button
                    key={i}
                    className={`option ${rv === 'correct' ? 'correct' : rv === 'wrong' ? 'wrong' : selected === i && !rv ? 'selected' : ''}`}
                    onClick={() => submit(i)}
                    onMouseEnter={() => !locked && SFX.hover()}
                    disabled={locked}
                    id={`l2opt${i}`}
                    style={{ 
                      pointerEvents: locked && !rv ? 'none' : 'auto',
                      fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
                      padding: '10px 14px'
                    }}
                  >
                    <span className="option-letter" style={{ width: 24, height: 24, fontSize: '0.65rem' }}>{'ABCD'[i]}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {fb && <FeedbackOverlay {...fb} onContinue={goNext} />}
      </div>
    </div>
  );
}
