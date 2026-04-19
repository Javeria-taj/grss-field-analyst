'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { getTitle, getTotalScore } from '@/lib/scoring';
import { SFX } from '@/lib/sfx';
import { useConfetti } from '@/components/ui/ConfettiCanvas';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import ConfettiCanvas from '@/components/ui/ConfettiCanvas';
import Toast from '@/components/ui/Toast';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

import { useLeaderboardStore } from '@/stores/useLeaderboardStore';

const LEVEL_NAMES: Record<number, string> = { 1: '🔤 Training Mission', 2: '🛰️ Intel Gathering', 3: '🔐 Code Breaking', 4: '⚡ Rapid Assessment', 5: '🌍 Core Simulation' };

export default function FinalPage() {
  const router = useRouter();
  const gs = useGameStore();
  const { entries, init, submitScore } = useLeaderboardStore();
  const { fire } = useConfetti();
  const fired = useRef(false);
  const total = getTotalScore(gs.scores);
  const title = getTitle(total);

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
    
    init();

    if (!fired.current) {
      fired.current = true;
      SFX.final();
      setTimeout(() => fire(['#00c8ff', '#00ff9d', '#7c3aed', '#ffd700', '#ff6b35', '#ff2d55']), 300);
      
      // Submit score to live leaderboard
      submitScore({
        name: gs.user.name,
        usn: gs.user.usn,
        score: total
      });
    }
  }, []); // eslint-disable-line

  if (!gs.user) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <StarfieldCanvas />
      <ConfettiCanvas />
      <Toast />
      <div className="earth-deco" />
      <div className="center-col" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 580, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 8 }}>🌍</div>
          <div className="font-orb t-accent" style={{ fontSize: '0.85rem', letterSpacing: 3, marginBottom: 4 }}>ALL MISSIONS COMPLETE</div>
          <h2 className="font-orb" style={{ marginBottom: 14 }}>FINAL DEBRIEF</h2>
          <div className="final-score">
            <AnimatedCounter target={total} duration={1200} />
          </div>
          <div style={{ color: 'var(--text2)', marginBottom: 14 }}>total mission score</div>

          <div className={`title-badge-big revealed`} style={{ marginBottom: 18 }}>
            {title.toUpperCase()}
          </div>

          {/* Breakdown table */}
          <div className="card" style={{ margin: '18px 0', textAlign: 'left' }}>
            <div className="label t-center" style={{ marginBottom: 12 }}>📊 MISSION SCORE BREAKDOWN</div>
            {[1, 2, 3, 4, 5].map(lvl => (
              <div key={lvl} className="metric-row" style={{ border: lvl === 5 ? 'none' : undefined }}>
                <span style={{ fontSize: '0.88rem' }}>{LEVEL_NAMES[lvl]}</span>
                <span className="metric-val">{(gs.scores[lvl] || 0).toLocaleString()} pts</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--white)' }}>TOTAL</span>
              <span className="font-orb t-gold" style={{ fontSize: '1rem' }}>{total.toLocaleString()} pts</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => { SFX.click(); router.push('/leaderboard'); }}>🏆 Leaderboard</button>
            <button className="btn btn-primary btn-lg" onClick={() => { SFX.click(); gs.logout(); router.push('/'); }} id="playAgainBtn">🔄 Play Again</button>
          </div>
        </div>
      </div>
    </div>
  );
}
