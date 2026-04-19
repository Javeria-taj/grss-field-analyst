'use client';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { getTitle, getTotalScore } from '@/lib/scoring';
import { SFX } from '@/lib/sfx';
import { useConfetti } from '@/components/ui/ConfettiCanvas';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import ConfettiCanvas from '@/components/ui/ConfettiCanvas';
import Toast from '@/components/ui/Toast';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { Suspense } from 'react';

const LEVEL_META: Record<number, { icon: string; name: string; confetti: string[]; next: number | null }> = {
  1: { icon: '🔤', name: 'TRAINING MISSION COMPLETE', confetti: ['#00c8ff', '#00ff9d', '#7c3aed'], next: 2 },
  2: { icon: '🛰️', name: 'INTEL GATHERING COMPLETE', confetti: ['#00ff9d', '#00c8ff', '#ffd700'], next: 3 },
  3: { icon: '🔐', name: 'CODE BREAKING COMPLETE', confetti: ['#7c3aed', '#a78bfa', '#00c8ff'], next: 4 },
  4: { icon: '⚡', name: 'RAPID ASSESSMENT COMPLETE', confetti: ['#ffaa00', '#ffd700', '#ff6b35'], next: 5 },
  5: { icon: '🌍', name: 'CORE SIMULATION COMPLETE', confetti: ['#ff6b35', '#ffd700', '#00ff9d'], next: null },
};

function ResultsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const lvl = parseInt(params.get('level') || '1');
  const gs = useGameStore();
  const { fire } = useConfetti();
  const fired = useRef(false);
  const meta = LEVEL_META[lvl];
  const levelScore = gs.scores[lvl] || 0;
  const total = getTotalScore(gs.scores);
  const correct = [gs.l1correct, gs.l2correct, gs.l3correct, gs.l4correct][lvl - 1] || 0;
  const totalQ = [10, 5, 5, 10][lvl - 1] || 1;

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
    if (!fired.current) {
      fired.current = true;
      SFX.levelUp();
      setTimeout(() => fire(meta?.confetti), 300);
    }
  }, []); // eslint-disable-line

  const goNext = () => {
    SFX.click();
    if (meta?.next) router.push(`/mission/${meta.next}/intro`);
    else router.push('/final');
  };

  if (!gs.user || !meta) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <StarfieldCanvas />
      <ConfettiCanvas />
      <Toast />
      <div className="earth-deco" />
      <div className="center-col" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>{meta.icon}</div>
          <div className="font-orb t-accent" style={{ fontSize: '0.85rem', letterSpacing: 2, margin: '8px 0' }}>
            {meta.name}
          </div>
          <div className="final-score">
            <AnimatedCounter target={levelScore} />
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text2)', marginBottom: 18 }}>points earned this level</div>

          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ display: 'grid', gap: 0 }}>
              {lvl <= 4 && (
                <>
                  <div className="metric-row">
                    <span style={{ fontSize: '0.88rem' }}>Questions Correct</span>
                    <span className="metric-val">{correct}/{totalQ}</span>
                  </div>
                  <div className="metric-row">
                    <span style={{ fontSize: '0.88rem' }}>Accuracy</span>
                    <span className="metric-val">{Math.round((correct / totalQ) * 100)}%</span>
                  </div>
                </>
              )}
              <div className="metric-row" style={{ border: 'none' }}>
                <span style={{ fontSize: '0.88rem' }}>Total Score So Far</span>
                <span className="metric-val">{total.toLocaleString()}</span>
              </div>
              <div className="metric-row" style={{ border: 'none', marginTop: 8 }}>
                <span style={{ fontSize: '0.88rem' }}>Current Rank</span>
                <span className="metric-val">{getTitle(total)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => router.push('/dashboard')}>← Dashboard</button>
            <button className="btn btn-primary btn-lg" onClick={goNext} id="nextMissionBtn">
              {meta.next ? 'NEXT MISSION →' : '🌍 FINAL DEBRIEF →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
