'use client';

import { motion } from 'framer-motion';
import { SFX } from '@/lib/sfx';

interface Props {
  type: 'ok' | 'bad' | 'timeout' | 'info';
  icon: string;
  title: string;
  body: string;
  onContinue: () => void;
  buttonLabel?: string;
}

export default function FeedbackOverlay({ type, icon, title, body, onContinue, buttonLabel = 'CONTINUE →' }: Props) {
  const btnClass = {
    ok: 'btn-success',
    bad: 'btn-danger',
    timeout: 'btn-warning',
    info: 'btn-outline',
  }[type];

  return (
    <motion.div 
      className="fb-overlay"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.3 }}
      style={{ backgroundColor: 'rgba(5, 11, 20, 0.7)' }}
    >
      <motion.div 
        className={`fb-card ${type} shadow-2xl border`}
        initial={{ scale: 0.85, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <span className="fb-icon">{icon}</span>
        <div
          className="font-orb"
          style={{ fontSize: '1.25rem', marginBottom: 10, color: 'var(--white)', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}
        >
          {title}
        </div>
        <div
          style={{ fontSize: '0.9rem', color: 'var(--text2)', lineHeight: 1.75, marginBottom: 24 }}
          dangerouslySetInnerHTML={{ __html: body }}
        />
        <button className={`btn ${btnClass} btn-full backdrop-blur-md`} onClick={() => { SFX.click(); onContinue(); }}>
          {buttonLabel}
        </button>
      </motion.div>
    </motion.div>
  );
}
