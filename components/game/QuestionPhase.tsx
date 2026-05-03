'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';
import AnalystToolkit from './AnalystToolkit';

function SlidingHint({ hint, disabled, noScore }: { hint: string; disabled: boolean; noScore: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const useHint = useGameSyncStore(s => s.useHint);
  const isBlocked = disabled || noScore;

  if (isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 12,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          margin: '0 auto',
          maxWidth: 480,
        }}
      >
        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💡</span>
        <span style={{ fontSize: '0.88rem', color: 'var(--warning)', fontStyle: 'italic', lineHeight: 1.5 }}>
          {hint}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: isBlocked ? 1 : 1.03 }}
      whileTap={{ scale: isBlocked ? 1 : 0.97 }}
      style={{
        borderRadius: 10,
        padding: '8px 18px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: `1px solid ${noScore ? 'var(--danger)' : 'rgba(245, 158, 11, 0.5)'}`,
        color: noScore ? 'var(--danger)' : 'var(--warning)',
        opacity: isBlocked ? 0.45 : 1,
        background: noScore ? 'rgba(251,113,133,0.05)' : 'rgba(245, 158, 11, 0.05)',
        cursor: isBlocked ? 'not-allowed' : 'pointer',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
      disabled={isBlocked}
      title={noScore ? 'Need at least 1 point to use hints' : 'Reveal hint'}
      onClick={() => { SFX.click(); useHint(); setIsOpen(true); }}
    >
      <span style={{ fontSize: '1rem' }}>💡</span>
      {noScore ? 'NO CREDITS' : 'DECRYPT HINT  −50 PTS'}
    </motion.button>
  );
}

/* ── Divider helper ─────────────────────────────────────────── */
function Divider() {
  return (
    <div style={{
      width: '100%', height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
      margin: '4px 0',
    }} />
  );
}

/* ── Answer input row ───────────────────────────────────────── */
function AnswerRow({ val, setVal, onSubmit, disabled }: {
  val: string; setVal: (v: string) => void;
  onSubmit: (a: string) => void; disabled: boolean;
}) {
  return (
    <div className="answer-row-wrap" style={{ display: 'flex', width: '100%', maxWidth: 460, margin: '0 auto' }}>
      <input
        className="input answer-input"
        style={{
          flex: 1, textTransform: 'uppercase', textAlign: 'center',
          fontSize: '1rem', borderRadius: '10px 0 0 10px', borderRight: 'none',
          padding: '13px 16px', letterSpacing: 2,
        }}
        placeholder="Type answer…"
        value={val}
        disabled={disabled}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onSubmit(val.trim()); }}
      />
      <button
        className="btn btn-primary answer-btn"
        style={{ borderRadius: '0 10px 10px 0', padding: '13px 24px', fontWeight: 800, letterSpacing: 1 }}
        disabled={disabled || !val.trim()}
        onClick={() => onSubmit(val.trim())}
      >
        {disabled ? 'LOCKED' : '📤 SEND'}
      </button>
    </div>
  );
}

/* ── Section label ──────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: 2.5,
      textTransform: 'uppercase', fontWeight: 900, opacity: 0.7,
    }}>
      {children}
    </div>
  );
}

/* ── SCRAMBLE ───────────────────────────────────────────────── */
function ScrambleQ({ q, onSubmit, disabled, myScore }: {
  q: any; onSubmit: (a: string) => void; disabled: boolean; myScore: number;
}) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%' }}>
      {/* Category badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.2)',
        borderRadius: 20, padding: '4px 14px',
        fontSize: '0.62rem', color: 'var(--accent)', letterSpacing: 2, fontWeight: 900,
      }}>
        {q.category}
      </div>

      {/* Scrambled word */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <SectionLabel>📡 Scrambled Signal</SectionLabel>
        <div style={{
          fontFamily: 'var(--font-orbitron)', color: 'var(--warning)',
          fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', letterSpacing: '6px',
          marginTop: 10, wordBreak: 'break-all', lineHeight: 1.3,
        }}>
          {q.scrambled}
        </div>
      </div>

      <Divider />

      {/* Hint */}
      {q.hint && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <SectionLabel>Intel Brief</SectionLabel>
          <div style={{
            fontSize: '0.88rem', color: 'var(--text2)', marginTop: 8,
            lineHeight: 1.6, padding: '0 8px',
          }}>
            {q.hint}
          </div>
        </div>
      )}

      {/* Hint 2 unlock */}
      {q.hint2 && (
        <div style={{ textAlign: 'center' }}>
          <SlidingHint hint={q.hint2} disabled={disabled} noScore={myScore <= 0} />
        </div>
      )}

      <Divider />

      {/* Answer input */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <SectionLabel>Transmit Answer</SectionLabel>
        <div style={{ marginTop: 12 }}>
          <AnswerRow val={val} setVal={setVal} onSubmit={onSubmit} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}

/* ── RIDDLE ─────────────────────────────────────────────────── */
function RiddleQ({ q, onSubmit, disabled, myScore }: {
  q: any; onSubmit: (a: string) => void; disabled: boolean; myScore: number;
}) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%' }}>
      {/* Category badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.2)',
        borderRadius: 20, padding: '4px 14px',
        fontSize: '0.62rem', color: 'var(--accent)', letterSpacing: 2, fontWeight: 900,
      }}>
        {q.category}
      </div>

      {/* Question */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <SectionLabel>🔐 Riddle</SectionLabel>
        <div style={{
          fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', color: 'var(--text)',
          lineHeight: 1.75, marginTop: 10, padding: '0 4px',
        }}>
          {q.question}
        </div>
      </div>

      <Divider />

      {/* Hint */}
      {q.hint && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <SectionLabel>Intel Brief</SectionLabel>
          <div style={{
            fontSize: '0.88rem', color: 'var(--text2)', marginTop: 8, lineHeight: 1.6, padding: '0 8px',
          }}>
            {q.hint}
          </div>
        </div>
      )}

      {/* Hint 2 unlock */}
      {q.hint2 && (
        <div style={{ textAlign: 'center' }}>
          <SlidingHint hint={q.hint2} disabled={disabled} noScore={myScore <= 0} />
        </div>
      )}

      <Divider />

      {/* Answer input */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <SectionLabel>Transmit Answer</SectionLabel>
        <div style={{ marginTop: 12 }}>
          <AnswerRow val={val} setVal={setVal} onSubmit={onSubmit} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}

/* ── IMAGE MCQ ──────────────────────────────────────────────── */
function ImageMCQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: string) => void; disabled: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', opacity: disabled ? 0.6 : 1 }}>
      {/* Image */}
      {q.imageUrl && (
        <div style={{
          position: 'relative', width: '100%', borderRadius: 14,
          overflow: 'hidden', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {!loaded && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
          <img
            src={q.imageUrl} alt="Satellite Intel"
            style={{
              width: '100%', maxHeight: 260, objectFit: 'contain',
              borderRadius: 14, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s',
            }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}

      {/* Question */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <SectionLabel>🛰️ Visual Intel</SectionLabel>
        <div style={{
          fontSize: 'clamp(0.85rem, 2.4vw, 1rem)', color: 'var(--text)',
          lineHeight: 1.65, marginTop: 8, padding: '0 4px',
        }}>
          {q.question}
        </div>
      </div>

      <Divider />

      {/* Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 10, width: '100%',
      }}>
        {q.options?.map((opt: string, i: number) => {
          const powerup = useGameSyncStore.getState().powerupResult;
          const isRemoved = powerup?.type === 'radar_pulse' && powerup?.removed?.includes(i);
          const distribution = powerup?.type === 'thermal_scan' ? powerup?.distribution : null;
          const popularity = distribution ? (distribution[String.fromCharCode(65 + i)] || 0) : 0;
          return (
            <motion.button
              key={i}
              style={{
                position: 'relative', textAlign: 'left', padding: '12px 16px',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.03)', cursor: isRemoved || disabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, minHeight: 52,
                fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
              }}
              disabled={disabled || !!isRemoved}
              animate={isRemoved ? { opacity: 0.1, scale: 0.95 } : { opacity: 1, scale: 1 }}
              whileHover={{ scale: (disabled || isRemoved) ? 1 : 1.02, borderColor: 'rgba(0,200,255,0.4)' }}
              whileTap={{ scale: (disabled || isRemoved) ? 1 : 0.97 }}
              onClick={() => onSubmit(opt)}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 900, flexShrink: 0, fontSize: '0.85rem' }}>
                {String.fromCharCode(65 + i)}.
              </span>
              <span style={{ lineHeight: 1.4 }}>{opt}</span>
              {popularity > 0 && (
                <div style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'var(--accent)', color: '#000', padding: '2px 6px',
                  borderRadius: 6, fontSize: '0.65rem', fontWeight: 900,
                }}>
                  {popularity}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Matrix letter slot — cycles random chars until revealed ── */
function MatrixLetterSlot({ char, isSpace, isRevealed }: { char: string; isSpace: boolean; isRevealed: boolean }) {
  const [display, setDisplay] = useState(isRevealed ? char : '?');
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%';

  useEffect(() => {
    if (isSpace || isRevealed) { setDisplay(char); return; }
    // Scramble while unrevealed
    const id = setInterval(() => {
      setDisplay(CHARS[Math.floor(Math.random() * CHARS.length)]);
    }, 90);
    return () => clearInterval(id);
  }, [isRevealed, char, isSpace]);

  // Lock-in spring when revealed
  useEffect(() => {
    if (isRevealed) setDisplay(char);
  }, [isRevealed, char]);

  if (isSpace) return <div style={{ width: 16 }} />;

  return (
    <motion.div
      animate={isRevealed
        ? { scale: [1.25, 1], color: '#00ff9d' }
        : { scale: 1, color: 'rgba(0,200,80,0.35)' }
      }
      transition={{ type: 'spring', stiffness: 350, damping: 12 }}
      style={{
        width: 'clamp(28px, 6vw, 42px)',
        height: 'clamp(36px, 7vw, 52px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-orbitron, monospace)',
        fontSize: 'clamp(0.95rem, 3vw, 1.4rem)',
        fontWeight: 900,
        borderBottom: isRevealed ? '2px solid #00ff9d' : '2px solid rgba(0,200,80,0.3)',
        background: isRevealed ? 'rgba(0,255,100,0.06)' : 'rgba(0,100,40,0.04)',
        borderRadius: 4,
        letterSpacing: 1,
        textShadow: isRevealed ? '0 0 12px rgba(0,255,136,0.8)' : 'none',
        transition: 'border-color 0.2s',
      }}
    >
      {display}
    </motion.div>
  );
}

/* ── HANGMAN ────────────────────────────────────────────────── */
function HangmanQ({ disabled }: { disabled: boolean }) {
  const {
    currentQuestion: q, hangmanGuessed, hangmanLives,
    hangmanRevealed, hangmanMaskedWord, hangmanSolved, guessLetter,
  } = useGameSyncStore();
  const [isSubmittingLetter, setIsSubmittingLetter] = useState(false);
  if (!q) return null;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const blanks = hangmanMaskedWord.split('');
  const handleGuess = (l: string) => {
    setIsSubmittingLetter(true);
    guessLetter(l);
    setTimeout(() => setIsSubmittingLetter(false), 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', opacity: disabled ? 0.6 : 1 }}>

      {/* Emoji clue */}
      <div style={{ textAlign: 'center' }}>
        <SectionLabel>🔐 Emoji Clue</SectionLabel>
        <div style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', marginTop: 8, letterSpacing: 4 }}>{q.emoji}</div>
      </div>

      <Divider />

      {/* Hint */}
      {q.hint && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <SectionLabel>Intel Brief</SectionLabel>
          <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: 8, lineHeight: 1.6 }}>
            {q.hint}
          </div>
        </div>
      )}

      {/* Word blanks — Matrix Decryption Effect */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <SectionLabel>🔐 Decrypting Signal</SectionLabel>
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: 6, marginTop: 12,
        }}>
          {blanks.map((char, i) => {
            const isSpace = char === ' ';
            const isRevealed = char !== '_' && !isSpace;
            return (
              <MatrixLetterSlot
                key={i}
                char={isRevealed ? char : '_'}
                isSpace={isSpace}
                isRevealed={isRevealed}
              />
            );
          })}
        </div>
      </div>

      {/* Lives */}
      <div style={{ fontSize: '1.1rem', letterSpacing: 4 }}>
        <span style={{ color: hangmanLives <= 2 ? 'var(--danger)' : 'var(--text2)' }}>
          {'❤️'.repeat(hangmanLives)}{'🖤'.repeat(6 - hangmanLives)}
        </span>
      </div>

      <Divider />

      {/* Keyboard */}
      <div style={{ width: '100%' }}>
        <SectionLabel>Keyboard</SectionLabel>
        <div className="alpha-grid" style={{ maxWidth: 480, margin: '10px auto 0' }}>
          {alphabet.map(l => (
            <button
              key={l}
              className="alpha-key"
              disabled={disabled || isSubmittingLetter || hangmanGuessed.includes(l) || hangmanSolved}
              style={{
                opacity: hangmanGuessed.includes(l) ? 0.25 : 1,
                borderColor: hangmanGuessed.includes(l)
                  ? (hangmanRevealed.length > 0 ? 'var(--accent2)' : 'var(--danger)')
                  : 'var(--border)',
              }}
              onClick={() => handleGuess(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MCQ ────────────────────────────────────────────────────── */
function MCQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: string) => void; disabled: boolean }) {
  const stars = '⭐'.repeat(q.difficulty ?? 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', opacity: disabled ? 0.6 : 1 }}>
      {/* Difficulty + Question */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: '0.85rem', marginBottom: 10, letterSpacing: 2 }}>{stars}</div>
        <SectionLabel>⚡ Rapid Fire</SectionLabel>
        <div style={{
          fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', color: 'var(--text)',
          lineHeight: 1.7, marginTop: 10, padding: '0 4px',
        }}>
          {q.question}
        </div>
      </div>

      <Divider />

      {/* Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 10, width: '100%',
      }}>
        {q.options?.map((opt: string, i: number) => {
          const powerup = useGameSyncStore.getState().powerupResult;
          const isRemoved = powerup?.type === 'radar_pulse' && powerup?.removed?.includes(i);
          const distribution = powerup?.type === 'thermal_scan' ? powerup?.distribution : null;
          const popularity = distribution ? (distribution[String.fromCharCode(65 + i)] || 0) : 0;
          return (
            <motion.button
              key={i}
              style={{
                position: 'relative', textAlign: 'left', padding: '12px 16px',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.03)', cursor: isRemoved || disabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, minHeight: 52,
                fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
              }}
              disabled={disabled || !!isRemoved}
              animate={isRemoved ? { opacity: 0.1, scale: 0.95 } : { opacity: 1, scale: 1 }}
              whileHover={{ scale: (disabled || isRemoved) ? 1 : 1.02, borderColor: 'rgba(0,200,255,0.4)' }}
              whileTap={{ scale: (disabled || isRemoved) ? 1 : 0.97 }}
              onClick={() => onSubmit(opt)}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 900, flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}.
              </span>
              <span style={{ lineHeight: 1.4 }}>{opt}</span>
              {popularity > 0 && (
                <div style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'var(--accent)', color: '#000', padding: '2px 6px',
                  borderRadius: 6, fontSize: '0.65rem', fontWeight: 900,
                }}>
                  {popularity}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN PHASE COMPONENT ───────────────────────────────────── */
export default function QuestionPhase() {
  const { currentQuestion: q, hasAnswered, myAnswer, submitAnswer, currentLevel, myStreak, myTotalScore } = useGameSyncStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prevStreakRef = useRef(0);
  const prevAnswerRef = useRef<any>(null);

  useEffect(() => {
    if (myStreak > 0) prevStreakRef.current = myStreak;
  }, [myStreak]);

  useEffect(() => {
    if (hasAnswered) setIsSubmitting(false);
  }, [hasAnswered]);

  useEffect(() => {
    if (!myAnswer) return;
    if (myAnswer === prevAnswerRef.current) return;
    prevAnswerRef.current = myAnswer;
    if (myAnswer.correct) {
      SFX.correct();
    } else {
      if (prevStreakRef.current >= 3) { SFX.glassShatter(); prevStreakRef.current = 0; }
      else { SFX.wrong(); }
    }
  }, [myAnswer]);

  const handleSubmit = (answer: string | number) => {
    if (isSubmitting || hasAnswered) return;
    setIsSubmitting(true);
    submitAnswer(answer);
    setTimeout(() => { setIsSubmitting((prev) => prev ? false : prev); }, 3000);
  };

  if (!q) return null;
  const disabled = hasAnswered || isSubmitting;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', minHeight: '70vh',
      padding: 'clamp(16px, 4vw, 32px) clamp(12px, 4vw, 24px)',
      gap: 20,
    }}>
      {/* Progress label */}
      <div style={{
        fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: 2.5,
        textTransform: 'uppercase', fontWeight: 700,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <span>Intel {q.index + 1} / {q.total}</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span style={{ color: 'var(--accent2)' }}>{q.points} pts</span>
      </div>

      {/* Question card */}
      <motion.div
        key={`${currentLevel}-${q.index}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%', maxWidth: 640,
          background: 'rgba(10, 15, 30, 0.55)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: 'clamp(20px, 5vw, 36px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {q.type === 'scramble' && <ScrambleQ q={q} onSubmit={handleSubmit} disabled={disabled} myScore={myTotalScore} />}
        {q.type === 'riddle'   && <RiddleQ   q={q} onSubmit={handleSubmit} disabled={disabled} myScore={myTotalScore} />}
        {q.type === 'image_mcq' && <ImageMCQ  q={q} onSubmit={handleSubmit} disabled={disabled} />}
        {q.type === 'hangman'  && <HangmanQ  disabled={disabled} />}
        {q.type === 'mcq'      && <MCQ       q={q} onSubmit={handleSubmit} disabled={disabled} />}
      </motion.div>

      {/* Answer result */}
      {myAnswer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{
            opacity: 1, scale: [0.85, 1.04, 1], y: 0,
            boxShadow: myAnswer.correct
              ? '0 0 32px rgba(74,222,128,0.22)'
              : '0 0 32px rgba(251,113,133,0.22)',
          }}
          style={{
            width: '100%', maxWidth: 400, textAlign: 'center',
            background: myAnswer.correct ? 'rgba(74,222,128,0.07)' : 'rgba(251,113,133,0.07)',
            border: `1px solid ${myAnswer.correct ? 'var(--accent2)' : 'var(--danger)'}`,
            borderRadius: 16, padding: '24px 20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.4, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 220 }}
            style={{ fontSize: '2.4rem', marginBottom: 10 }}
          >
            {myAnswer.correct ? '✅' : '❌'}
          </motion.div>
          <div style={{
            fontFamily: 'var(--font-orbitron)',
            color: myAnswer.correct ? 'var(--accent2)' : 'var(--danger)',
            fontSize: '1.15rem', fontWeight: 800, marginBottom: 6,
          }}>
            {myAnswer.correct ? `+${myAnswer.score} PTS ACQUIRED` : 'TRANSMISSION FAILED'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.5 }}>
            {myAnswer.correct
              ? 'Standing by for next intel package…'
              : 'Signal lost. Maintain operational focus.'}
          </div>
        </motion.div>
      )}

      {/* Analyst Toolkit (Powerups) */}
      <AnalystToolkit />
    </div>
  );
}
