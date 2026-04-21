'use client';

import { motion } from 'framer-motion';

interface Props {
  total: number;
  current: number;
}

export default function ProgressDots({ total, current }: Props) {
  return (
    <div className="prog-dots">
      {Array.from({ length: total }, (_, i) => {
        const isDone = i < current;
        const isCur = i === current;
        return (
          <motion.div
            key={i}
            className={`prog-dot ${isDone ? 'done' : isCur ? 'cur' : ''}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: isCur ? 1.25 : isDone ? 1 : 0.85,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        );
      })}
    </div>
  );
}

