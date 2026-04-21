'use client';
import { useTimerStore } from '@/stores/useTimerStore';
import { motion } from 'framer-motion';

export default function TimerBar() {
  const timeVal = useTimerStore(s => s.timeVal);
  const timeMax = useTimerStore(s => s.timeMax);

  const pct = timeMax > 0 ? (timeVal / timeMax) * 100 : 100;
  const state = pct < 25 ? 'crit' : pct < 50 ? 'warn' : '';

  const mins = Math.floor(timeVal / 60);
  const secs = timeVal % 60;
  const label = timeMax > 60
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${timeVal}s`;

  const fillColor =
    state === 'crit'
      ? 'linear-gradient(90deg, #880000, #fb7185)'
      : state === 'warn'
      ? 'linear-gradient(90deg, #ff6600, #facc15)'
      : 'linear-gradient(90deg, #4ade80, #38bdf8)';

  return (
    <>
      <div className="timer-wrap">
        <div className="timer-track">
          <motion.div
            className={`timer-fill ${state}`}
            style={{ background: fillColor }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.85, ease: 'linear' }}
          />
        </div>
      </div>
      <motion.div
        className={`timer-txt ${state}`}
        animate={{ opacity: state === 'crit' ? [1, 0.4, 1] : 1 }}
        transition={state === 'crit' ? { duration: 0.4, repeat: Infinity } : {}}
      >
        {label}
      </motion.div>
    </>
  );
}

