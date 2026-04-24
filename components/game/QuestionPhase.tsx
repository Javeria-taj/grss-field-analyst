'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';

function ScrambleQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: string) => void; disabled: boolean }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ textAlign: 'center', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.3s' }}>
      <div className="label t-accent" style={{ marginBottom: 8 }}>{q.category}</div>
      <div className="font-orb" style={{ fontSize: '2.2rem', letterSpacing: 6, color: 'var(--warning)', marginBottom: 12 }}>{q.scrambled}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: 16 }}>💡 {q.hint}</div>
      <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
        <input className="input" style={{ flex: 1, textTransform: 'uppercase', textAlign: 'center', fontSize: '1.1rem' }}
          placeholder="Type your answer..." value={val} disabled={disabled}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onSubmit(val.trim()); }}
        />
        <button className="btn btn-primary" disabled={disabled || !val.trim()} onClick={() => onSubmit(val.trim())}>
          {disabled ? 'WAIT...' : 'SUBMIT'}
        </button>
      </div>
    </div>
  );
}

function RiddleQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: string) => void; disabled: boolean }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ textAlign: 'center', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.3s' }}>
      <div className="label t-accent" style={{ marginBottom: 8 }}>{q.category}</div>
      <div style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 16, maxWidth: 500, margin: '0 auto 16px' }}>{q.question}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: 16 }}>💡 {q.hint}</div>
      <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
        <input className="input" style={{ flex: 1, textTransform: 'uppercase', textAlign: 'center', fontSize: '1.1rem' }}
          placeholder="Type your answer..." value={val} disabled={disabled}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onSubmit(val.trim()); }}
        />
        <button className="btn btn-primary" disabled={disabled || !val.trim()} onClick={() => onSubmit(val.trim())}>
          {disabled ? 'WAIT...' : 'SUBMIT'}
        </button>
      </div>
    </div>
  );
}

function ImageMCQ({ q, onSubmit, disabled }: { q: any; onSubmit: (a: number) => void; disabled: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ textAlign: 'center', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.3s' }}>
      {q.imageUrl && (
        <div style={{ 
          minHeight: 250, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 16,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative'
        }}>
          {!loaded && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
          <img 
            src={q.imageUrl} 
            alt="Satellite" 
            style={{ 
              maxWidth: 400, 
              width: '100%', 
              minHeight: '250px',
              borderRadius: 12, 
              border: '1px solid var(--border)', 
              objectFit: 'cover',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s'
            }} 
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}
      <div style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 16, maxWidth: 500, margin: '0 auto 16px' }}>{q.question}</div>
      <div style={{ display: 'grid', gap: 10, maxWidth: 500, margin: '0 auto' }}>
        {q.options?.map((opt: string, i: number) => (
          <motion.button key={i} className="btn btn-outline" disabled={disabled}
            style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.88rem' }}
            whileHover={{ scale: disabled ? 1 : 1.02 }} whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => onSubmit(i)}>
            <span style={{ color: 'var(--accent)', marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span> {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function HangmanQ({ disabled }: { disabled: boolean }) {
  const { currentQuestion: q, hangmanGuessed, hangmanLives, hangmanRevealed, hangmanWordLength, hangmanSolved, guessLetter } = useGameSyncStore();
  const [isSubmittingLetter, setIsSubmittingLetter] = useState(false);

  if (!q) return null;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const blanks = Array.from({ length: hangmanWordLength }, (_, i) =>
    hangmanRevealed.includes(i) ? '?' : '_'
  );

  const handleGuess = (l: string) => {
    setIsSubmittingLetter(true);
    guessLetter(l);
    setTimeout(() => setIsSubmittingLetter(false), 300); // Small debounce for letters
  };

  return (
    <div style={{ textAlign: 'center', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.3s' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>{q.emoji}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: 16 }}>💡 {q.hint}</div>
      <div className="font-orb" style={{ fontSize: '2rem', letterSpacing: 12, marginBottom: 16, color: 'var(--accent)' }}>
        {blanks.join(' ')}
      </div>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: hangmanLives <= 2 ? 'var(--danger)' : 'var(--text2)' }}>
          {'❤️'.repeat(hangmanLives)}{'🖤'.repeat(6 - hangmanLives)}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
        {alphabet.map(l => (
          <button key={l} className="btn btn-outline btn-sm"
            disabled={disabled || isSubmittingLetter || hangmanGuessed.includes(l) || hangmanSolved}
            style={{
              width: 36, height: 36, padding: 0, fontSize: '0.8rem',
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
    <div style={{ textAlign: 'center', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.3s' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: 8 }}>{stars}</div>
      <div style={{ fontSize: '1.05rem', color: 'var(--text)', marginBottom: 20, maxWidth: 550, margin: '0 auto 20px', lineHeight: 1.6 }}>{q.question}</div>
      <div style={{ display: 'grid', gap: 10, maxWidth: 500, margin: '0 auto' }}>
        {q.options?.map((opt: string, i: number) => (
          <motion.button key={i} className="btn btn-outline" disabled={disabled}
            style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.88rem' }}
            whileHover={{ scale: disabled ? 1 : 1.02 }} whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => onSubmit(i)}>
            <span style={{ color: 'var(--accent)', marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span> {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function QuestionPhase() {
  const { currentQuestion: q, hasAnswered, myAnswer, submitAnswer, currentLevel, myStreak } = useGameSyncStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevStreak, setPrevStreak] = useState(0);

  useEffect(() => {
    // Keep track of the streak before it resets
    if (myStreak > 0) setPrevStreak(myStreak);
  }, [myStreak]);

  useEffect(() => {
    if (hasAnswered) {
      setIsSubmitting(false); // Reset if server confirmed
    }
  }, [hasAnswered]);

  useEffect(() => {
    if (myAnswer) {
      if (myAnswer.correct) {
        SFX.correct();
      } else {
        if (prevStreak >= 3) {
          SFX.glassShatter();
          setPrevStreak(0);
        } else {
          SFX.wrong();
        }
      }
    }
  }, [myAnswer, prevStreak]);

  const handleSubmit = (answer: string | number) => {
    if (isSubmitting || hasAnswered) return;
    setIsSubmitting(true);
    submitAnswer(answer);

    // Fallback: if server drops the packet, unlock after 3 seconds
    setTimeout(() => {
      setIsSubmitting((prev) => prev ? false : prev);
    }, 3000);
  };

  if (!q) return null;

  const disabled = hasAnswered || isSubmitting;

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 16, minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text2)' }}>
        QUESTION {q.index + 1} / {q.total} &nbsp;·&nbsp; {q.points} PTS
      </div>

      <motion.div
        className="card"
        style={{ maxWidth: 620, width: '100%', pointerEvents: disabled ? 'none' : 'auto' }}
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
            opacity: 1, 
            scale: [0.8, 1.05, 1],
            y: 0,
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
            animate={{ scale: [0.5, 1.4, 1], rotate: 0 }}
            transition={{ duration: 0.45, type: 'spring', damping: 12 }}
            style={{ fontSize: '2.2rem', marginBottom: 8 }}
          >
            {myAnswer.correct ? '✅' : '❌'}
          </motion.div>
          <div className="font-orb" style={{ color: myAnswer.correct ? 'var(--accent2)' : 'var(--danger)', fontSize: '1.2rem', fontWeight: 800 }}>
            {myAnswer.correct ? `+${myAnswer.score} POINTS` : 'INCORRECT'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: 6 }}>
            {myAnswer.correct ? 'Waiting for others...' : 'Mission compromised. Stay focused.'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
