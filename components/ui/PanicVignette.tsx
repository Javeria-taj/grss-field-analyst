'use client';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PanicVignette — a pulsing red edge-glow overlay that mounts when `active` is true.
 * Driven by a CSS keyframe so it costs zero JS per frame after mount.
 */
export default function PanicVignette({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="panic-vignette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9990,
            boxShadow: [
              'inset 0 0 80px 20px rgba(220,30,60,0.35)',
              'inset 0 0 160px 60px rgba(220,30,60,0.18)',
              'inset 0 0 30px 8px rgba(255,60,80,0.55)',
            ].join(', '),
            animation: 'panic-pulse 0.8s ease-in-out infinite alternate',
          }}
        />
      )}
      <style>{`
        @keyframes panic-pulse {
          from { opacity: 0.65; }
          to   { opacity: 1;    }
        }
      `}</style>
    </AnimatePresence>
  );
}
