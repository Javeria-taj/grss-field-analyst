'use client';
import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function BackgroundSystem() {
  const { currentLevel, phase } = useGameSyncStore();

  const theme = useMemo(() => {
    if (phase === 'anomaly_active') return 'anomaly';
    if (currentLevel >= 1 && currentLevel <= 5) return `lv${currentLevel}`;
    return 'default';
  }, [currentLevel, phase]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#03070f]">
      {/* Dynamic Nebula/Atmosphere */}
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div className={`absolute inset-0 transition-colors duration-1000 ${
            theme === 'lv1' ? 'bg-[#002244]' :
            theme === 'lv2' ? 'bg-[#002211]' :
            theme === 'lv3' ? 'bg-[#221100]' :
            theme === 'lv4' ? 'bg-[#220011]' :
            theme === 'lv5' ? 'bg-[#222200]' :
            theme === 'anomaly' ? 'bg-[#220000]' : 'bg-transparent'
          } opacity-30`} />
          
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 50%, var(--accent) 0%, transparent 70%)`,
              filter: 'blur(100px)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} 
      />

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 3px 100%'
        }}
      />
    </div>
  );
}
