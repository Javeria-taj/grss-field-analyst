'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

function ScrambleQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: string) => void; disabled: boolean }) {
  const [val, setVal] = useState('');
  const [hint2Shown, setHint2Shown] = useState(false);
  return (
    <div className="w-full text-center transition-opacity duration-300" style={{ opacity: disabled ? 0.6 : 1 }}>
      <div className="label t-accent mb-2">{q.category}</div>
      <div className="font-orb text-warning text-2xl md:text-4xl tracking-[4px] mb-4 break-all px-2">{q.scrambled}</div>
      <div className="text-xs md:text-sm text-accent tracking-widest uppercase font-bold mb-1">
        📡 SIGNAL INTERCEPT
      </div>
      <div className="text-xs md:text-sm text-gray-400 mb-4 px-4">
        {q.hint}
      </div>
      {q.hint2 && (
        hint2Shown ? (
          <div className="text-xs md:text-sm text-yellow-400 mb-4 italic">
            🔓 DEEP DECRYPT: {q.hint2}
          </div>
        ) : (
          <button
            className="btn btn-outline btn-sm text-[10px] md:text-xs mb-4 opacity-70 border-accent3 text-accent3"
            disabled={disabled}
            onClick={() => { SFX.click(); setHint2Shown(true); }}
          >
            🔍 REQUEST DEEP DECRYPT (-50 PTS RISK)
          </button>
        )
      )}
      <div className="flex flex-col md:flex-row gap-3 w-full max-w-md mx-auto px-4">
        <input className="input flex-1 uppercase text-center text-lg py-3"
          placeholder="Transmit answer..." value={val} disabled={disabled}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onSubmit(val.trim()); }}
        />
        <button className="btn btn-primary py-3 px-6" disabled={disabled || !val.trim()} onClick={() => onSubmit(val.trim())}>
          {disabled ? 'LOCKED' : '📤 TRANSMIT'}
        </button>
      </div>
    </div>
  );
}

function RiddleQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: string) => void; disabled: boolean }) {
  const [val, setVal] = useState('');
  const [hint2Shown, setHint2Shown] = useState(false);
  return (
    <div style={{ textAlign: 'center', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.3s' }}>
      <div className="label t-accent" style={{ marginBottom: 8 }}>{q.category}</div>
      <div style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 16, maxWidth: '100%', margin: '0 auto 16px' }}>{q.question}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
        📡 SIGNAL INTERCEPT
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: hint2Shown ? 4 : 16 }}>
        {q.hint}
      </div>
      {q.hint2 && (
        hint2Shown ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginBottom: 16, fontStyle: 'italic' }}>
            🔓 DEEP DECRYPT: {q.hint2}
          </div>
        ) : (
          <button
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.65rem', marginBottom: 16, opacity: 0.7, borderColor: 'var(--accent3)', color: 'var(--accent3)' }}
            disabled={disabled}
            onClick={() => { SFX.click(); setHint2Shown(true); }}
          >
            🔍 REQUEST DEEP DECRYPT
          </button>
        )
      )}
      <div style={{ display: 'flex', gap: 8, maxWidth: '100%', margin: '0 auto' }}>
        <input className="input" style={{ flex: 1, textTransform: 'uppercase', textAlign: 'center', fontSize: '1.1rem' }}
          placeholder="Transmit answer..." value={val} disabled={disabled}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onSubmit(val.trim()); }}
        />
        <button className="btn btn-primary" disabled={disabled || !val.trim()} onClick={() => onSubmit(val.trim())}>
          {disabled ? 'LOCKED' : '📤 TRANSMIT'}
        </button>
      </div>
    </div>
  );
}

function ImageMCQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: number) => void; disabled: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full text-center transition-opacity duration-300" style={{ opacity: disabled ? 0.6 : 1 }}>
      {q.imageUrl && (
        <div className="relative min-h-[160px] md:min-h-[180px] flex items-center justify-center mb-4 bg-white/5 rounded-xl overflow-hidden mx-4 md:mx-0">
          {!loaded && <div className="skeleton absolute inset-0" />}
          <img
            src={q.imageUrl} alt="Satellite Intel"
            className="max-w-full w-full max-h-[220px] md:max-h-[280px] rounded-xl border border-white/10 object-contain transition-opacity duration-300"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}
      <div className="text-sm md:text-base text-white mb-4 px-4 max-w-lg mx-auto">{q.question}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-full mx-auto px-4">
        {q.options?.map((opt: string, i: number) => {
          const powerup = useGameSyncStore.getState().powerupResult;
          const isRemoved = powerup?.type === 'radar_pulse' && powerup?.removed?.includes(i);
          const distribution = powerup?.type === 'thermal_scan' ? powerup?.distribution : null;
          const popularity = distribution ? (distribution[String.fromCharCode(65 + i)] || 0) : 0;
          return (
            <motion.button
              key={i} className="btn btn-outline text-left p-3 md:p-4 text-xs md:text-sm relative min-h-[48px] flex items-center"
              disabled={disabled || !!isRemoved}
              initial={isRemoved ? { opacity: 1 } : {}}
              animate={isRemoved ? { opacity: 0.1, scale: 0.95 } : { opacity: 1, scale: 1 }}
              whileHover={{ scale: (disabled || isRemoved) ? 1 : 1.02 }}
              whileTap={{ scale: (disabled || isRemoved) ? 1 : 0.98 }}
              onClick={() => onSubmit(i)}>
              <span className="text-accent mr-3 flex-shrink-0">{String.fromCharCode(65 + i)}.</span> 
              <span className="break-words line-clamp-3">{opt}</span>
              {popularity > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent text-black px-2 py-0.5 rounded text-[10px] font-black">
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

function HangmanQ({ disabled }: { disabled: boolean }) {
  const {
    currentQuestion: q, hangmanGuessed, hangmanLives,
    hangmanRevealed, hangmanMaskedWord, hangmanSolved, guessLetter
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
    <div className="w-full text-center transition-opacity duration-300" style={{ opacity: disabled ? 0.6 : 1 }}>
      <div className="font-orb text-3xl md:text-5xl mb-3">{q.emoji}</div>
      <div className="text-xs md:text-sm text-accent tracking-widest uppercase font-bold mb-1">
        📡 SIGNAL INTERCEPT
      </div>
      <div className="text-xs md:text-sm text-gray-400 mb-4 px-4">{q.hint}</div>
      <div className="font-orb flex flex-wrap justify-center gap-1 md:gap-2 mb-4 text-accent">
        {blanks.map((char, i) => {
          const isSpace = char === ' ';
          const isRevealed = char !== '_' && !isSpace;
          return (
            <div key={i} className={`letter-slot ${isSpace ? 'space' : ''} ${isRevealed ? 'shown pop' : ''}`}>
              {isSpace || char === '_' ? '' : char}
            </div>
          );
        })}
      </div>
      <div className="mb-4 text-sm md:text-base">
        <span style={{ color: hangmanLives <= 2 ? 'var(--danger)' : 'var(--text2)' }}>
          {'❤️'.repeat(hangmanLives)}{'🖤'.repeat(6 - hangmanLives)}
        </span>
      </div>
      <div className="alpha-grid max-w-lg mx-auto px-2">
        {alphabet.map(l => (
          <button key={l} className="alpha-key"
            disabled={disabled || isSubmittingLetter || hangmanGuessed.includes(l) || hangmanSolved}
            style={{
              opacity: hangmanGuessed.includes(l) ? 0.3 : 1,
              borderColor: hangmanGuessed.includes(l)
                ? (hangmanRevealed.length > 0 ? 'var(--accent2)' : 'var(--danger)')
                : 'var(--border)',
            }}
            onClick={() => handleGuess(l)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function MCQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: number) => void; disabled: boolean }) {
  const stars = '⭐'.repeat(q.difficulty ?? 1);
  return (
    <div className="w-full text-center transition-opacity duration-300" style={{ opacity: disabled ? 0.6 : 1 }}>
      <div className="text-xs md:text-sm text-gray-400 mb-2">{stars}</div>
      <div className="text-sm md:text-base text-white mb-5 px-4 max-w-lg mx-auto">{q.question}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-full mx-auto px-4">
        {q.options?.map((opt: string, i: number) => {
          const powerup = useGameSyncStore.getState().powerupResult;
          const isRemoved = powerup?.type === 'radar_pulse' && powerup?.removed?.includes(i);
          const distribution = powerup?.type === 'thermal_scan' ? powerup?.distribution : null;
          const popularity = distribution ? (distribution[String.fromCharCode(65 + i)] || 0) : 0;
          return (
            <motion.button
              key={i} className="btn btn-outline text-left p-3 md:p-4 text-xs md:text-sm relative min-h-[48px] flex items-center"
              disabled={disabled || !!isRemoved}
              initial={isRemoved ? { opacity: 1 } : {}}
              animate={isRemoved ? { opacity: 0.1, scale: 0.95 } : { opacity: 1, scale: 1 }}
              whileHover={{ scale: (disabled || isRemoved) ? 1 : 1.02 }}
              whileTap={{ scale: (disabled || isRemoved) ? 1 : 0.98 }}
              onClick={() => onSubmit(i)}>
              <span className="text-accent mr-3 flex-shrink-0">{String.fromCharCode(65 + i)}.</span> 
              <span className="break-words line-clamp-3">{opt}</span>
              {popularity > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent text-black px-2 py-0.5 rounded text-[10px] font-black">
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

export default function QuestionPhase() {
  const { currentQuestion: q, hasAnswered, myAnswer, submitAnswer, currentLevel, myStreak } = useGameSyncStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // PHASE 2: Track previous streak to know when to play glass shatter.
  // Audio is played ONCE here, in ONE place. The store does NOT play audio.
  const prevStreakRef = useRef(0);
  const prevAnswerRef = useRef<any>(null);

  useEffect(() => {
    if (myStreak > 0) prevStreakRef.current = myStreak;
  }, [myStreak]);

  useEffect(() => {
    if (hasAnswered) setIsSubmitting(false);
  }, [hasAnswered]);

  // PHASE 2: Single, non-redundant audio trigger for answer feedback.
  // Fires only when myAnswer changes to a new value (not on re-renders).
  useEffect(() => {
    if (!myAnswer) return;
    if (myAnswer === prevAnswerRef.current) return; // exact same ref, skip
    prevAnswerRef.current = myAnswer;

    if (myAnswer.correct) {
      SFX.correct();
    } else {
      if (prevStreakRef.current >= 3) {
        SFX.glassShatter();
        prevStreakRef.current = 0;
      } else {
        SFX.wrong();
      }
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
    <div className="page-content" style={{ justifyContent: 'center', gap: 16, minHeight: '70vh', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text2)' }}>
        INTEL PACKAGE {q.index + 1} / {q.total} &nbsp;·&nbsp; {q.points} PTS
      </div>

      <motion.div
        className="card"
        style={{ maxWidth: 620, width: '100%', pointerEvents: disabled ? 'none' : 'auto', margin: '0 auto' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        key={`${currentLevel}-${q.index}`}
      >
        {q.type === 'scramble' && <ScrambleQ q={q} onSubmit={handleSubmit} disabled={disabled} />}
        {q.type === 'riddle' && <RiddleQ q={q} onSubmit={handleSubmit} disabled={disabled} />}
        {q.type === 'image_mcq' && <ImageMCQ q={q} onSubmit={handleSubmit} disabled={disabled} />}
        {q.type === 'hangman' && <HangmanQ disabled={disabled} />}
        {q.type === 'mcq' && <MCQ q={q} onSubmit={handleSubmit} disabled={disabled} />}
      </motion.div>

      {myAnswer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1, scale: [0.8, 1.05, 1], y: 0,
            boxShadow: myAnswer.correct
              ? '0 0 30px rgba(74, 222, 128, 0.25)'
              : '0 0 30px rgba(251, 113, 133, 0.25)'
          }}
          className="card card-sm"
          style={{
            maxWidth: 400, textAlign: 'center',
            borderColor: myAnswer.correct ? 'var(--accent2)' : 'var(--danger)',
            background: myAnswer.correct
              ? 'rgba(74, 222, 128, 0.08)'
              : 'rgba(251, 113, 133, 0.08)',
          }}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, mass: 1 }}
            style={{ fontSize: '2.2rem', marginBottom: 8 }}
          >
            {myAnswer.correct ? '✅' : '❌'}
          </motion.div>
          <div className="font-orb" style={{ color: myAnswer.correct ? 'var(--accent2)' : 'var(--danger)', fontSize: '1.2rem', fontWeight: 800 }}>
            {myAnswer.correct ? `+${myAnswer.score} PTS ACQUIRED` : 'TRANSMISSION FAILED'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: 6 }}>
            {myAnswer.correct ? 'Standing by for next intel package...' : 'Signal lost. Maintain operational focus.'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
