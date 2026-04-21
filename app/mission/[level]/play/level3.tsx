'use client';
import { useEffect, useState, useCallback } from 'react';
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

type FBState = { type: 'ok' | 'bad' | 'timeout'; icon: string; title: string; body: string } | null;
type QSt = { status: 'win' | 'lose'; timeWhenSubmitted: number } | null;

export default function Level3Play() {
  const router = useRouter();
  const gs = useGameStore();
  const { startTimer, stopTimer, timeVal } = useTimerStore();
  const [fb, setFb] = useState<FBState>(null);
  const [qst, setQst] = useState<QSt>(null);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [lives, setLives] = useState(6);
  const [wrongShake, setWrongShake] = useState(false);

  const chs = DATA.level3.chs;
  const ch = chs[gs.l3idx];

  const onHalfway = useCallback(() => {
    if (qst) return;
    if (!gs.l3hintGiven) {
      gs.setL3HintGiven(true);
      setGuessed(prev => {
        const hidden = ch.word.split('').filter(c => c !== ' ' && !prev.has(c));
        if (!hidden.length) return prev;
        const r = hidden[Math.floor(Math.random() * hidden.length)];
        toast(`💡 Auto-hint: Letter "${r}" revealed at 1-minute mark!`, 'inf');
        return new Set([...prev, r]);
      });
    }
  }, [ch, gs, qst]);

  const onTimerDone = useCallback(() => {
    const isCorrect = qst?.status === 'win';
    
    // RECORD TELEMETRY
    gs.addTelemetry({
      id: `L3-Q${gs.l3idx + 1}`,
      level: 3,
      question: `Emoji Decode: ${ch.em}`,
      isCorrect,
      timeTaken: 120 - (qst?.timeWhenSubmitted ?? 0),
      timestamp: Date.now()
    });

    if (isCorrect) {
      SFX.correct();
      const earned = calcScore(true, qst!.timeWhenSubmitted, 120, ch.pts);
      gs.addL3Score(earned); gs.incL3Correct();
      setFb({ type: 'ok', icon: '✅', title: `DECODED: ${ch.word}`, body: `+${earned} pts!<br><br>${ch.expl}` });
    } else {
      SFX.wrong();
      const title = qst?.status === 'lose' ? 'DECRYPTION FAILED' : "TIME'S UP!";
      setFb({ type: qst?.status === 'lose' ? 'bad' : 'timeout', icon: qst?.status === 'lose' ? '💀' : '⏰', title, body: `The word was: <strong>${ch.word}</strong><br><br>${ch.expl}` });
    }
  }, [qst, ch, gs]);

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
    gs.startL3();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!ch) return;
    gs.setCurrentHint(ch.hint); gs.setCurrentLevel(3);
    setFb(null); setQst(null); setGuessed(new Set()); setLives(6); setWrongShake(false);
    startTimer(120, onTimerDone, onHalfway);
    return () => stopTimer();
  }, [gs.l3idx]); // eslint-disable-line

  useEffect(() => {
    const handleSkip = () => { stopTimer(); setQst(null); onTimerDone(); };
    window.addEventListener('grss-skip', handleSkip);
    return () => window.removeEventListener('grss-skip', handleSkip);
  }, [onTimerDone]); // eslint-disable-line

  const guessLetter = (c: string) => {
    if (qst || guessed.has(c)) return;
    SFX.click();
    const newGuessedSet = new Set([...guessed, c]);
    const newGuessedArr = [...newGuessedSet];
    const wasCorrect = ch.word.includes(c);
    let newLives = lives;
    
    if (!wasCorrect) {
      newLives = lives - 1;
      setLives(newLives);
      gs.setL3Lives(newLives);
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 450);
    }
    
    setGuessed(newGuessedSet);
    gs.setL3Guessed(newGuessedArr);

    const allDone = ch.word.split('').every(lc => lc === ' ' || newGuessedSet.has(lc));
    if (allDone) {
      setQst({ status: 'win', timeWhenSubmitted: timeVal });
      toast('Word completed! Waiting for timer...', 'inf');
    } else if (newLives <= 0) {
      setQst({ status: 'lose', timeWhenSubmitted: timeVal });
      toast('Decryption failed! Waiting for timer...', 'inf');
    }

    // SYNC STATE TO HQ
    gs.syncState();
  };

  const goNext = () => {
    setFb(null); setQst(null); setGuessed(new Set()); setLives(6); setWrongShake(false);
    gs.incL3Idx();
    gs.syncState();
  };

  if (gs.l3idx >= chs.length) {
    gs.finishL3(); stopTimer();
    router.replace('/results?level=3'); return null;
  }
  if (!ch) return null;

  const wrong = [...guessed].filter(c => !ch.word.includes(c));

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <HUD levelName="LEVEL 3 — CODE BREAKING" totalQuestions={chs.length} currentQuestion={gs.l3idx} />
        <TimerBar />
        <div className="page-content">
          <div style={{ maxWidth: 580, width: '92vw', textAlign: 'center' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>EMOJI DECODE {gs.l3idx + 1}/{chs.length}</span>
              <div className="lives" style={{ gap: 2 }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className={`life${i >= lives ? ' dead' : ''}`} style={{ fontSize: '0.8rem' }}>❤️</span>
                ))}
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>+{ch.pts} pts</span>
            </div>

            {/* Emoji clue */}
            <div className="em-clue" style={{ padding: '15px', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', letterSpacing: '6px' }}>{ch.em}</div>

            {/* Word slots */}
            <div className={`word-slots${wrongShake ? ' wrong-shake' : ''}`} style={{ gap: '4px', margin: '12px 0' }}>
              {ch.word.split('').map((c, i) =>
                c === ' ' ? (
                  <div key={i} className="letter-slot space" style={{ width: '8px' }} />
                ) : (
                  <div key={i} className={`letter-slot${guessed.has(c) ? ' shown' : ''}`} style={{ width: 'clamp(22px, 6vw, 34px)', height: 'clamp(32px, 8vw, 42px)', fontSize: 'clamp(1rem, 4vw, 1.3rem)' }}>
                    {guessed.has(c) ? c : ''}
                  </div>
                )
              )}
            </div>

            {/* Wrong guesses */}
            <div style={{ marginBottom: 10, fontSize: '0.72rem', color: 'var(--text2)' }}>
              Failures ({wrong.length}/6):{' '}
              <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{wrong.join(' ') || 'None'}</span>
            </div>

            {/* Alphabet grid */}
            <div className="alpha-grid" style={{ gap: '4px' }}>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => {
                const isGuessed = guessed.has(c);
                const isHit = ch.word.includes(c);
                return (
                  <button
                    key={c}
                    className={`alpha-key${isGuessed ? (isHit ? ' hit' : ' miss') : ''}`}
                    disabled={isGuessed || !!qst}
                    onMouseEnter={() => !isGuessed && !qst && SFX.hover()}
                    onClick={() => guessLetter(c)}
                    style={{ 
                      width: 'clamp(30px, 8.5vw, 36px)', 
                      height: 'clamp(30px, 8.5vw, 36px)',
                      fontSize: '0.75rem'
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: '0.68rem', color: 'var(--text2)' }}>
              💡 Auto-hint reveals at 60s mark
            </div>
          </div>
        </div>
        {fb && <FeedbackOverlay {...fb} onContinue={goNext} />}
      </div>
    </div>
  );
}
