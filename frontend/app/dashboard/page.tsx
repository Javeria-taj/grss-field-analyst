'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { getTitle, getTotalScore } from '@/lib/scoring';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import ConfettiCanvas from '@/components/ui/ConfettiCanvas';
import Toast from '@/components/ui/Toast';
import DATA, { LEVEL_INTROS } from '@/lib/gameData';

const LEVEL_CONFIG = [
  { id: 1, icon: '🔤', label: 'TRAINING\nMISSION', color: '#00c8ff' },
  { id: 2, icon: '🛰️', label: 'INTEL\nGATHERING', color: '#00ff9d' },
  { id: 3, icon: '🔐', label: 'CODE\nBREAKING', color: '#7c3aed' },
  { id: 4, icon: '⚡', label: 'RAPID\nASSESSMENT', color: '#ffaa00' },
  { id: 5, icon: '🌍', label: 'CORE\nSIMULATION', color: '#ff6b35' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, scores, powerups, unlocked, completed, logout } = useGameStore();
  const [shakeLevel, setShakeLevel] = useState<number | null>(null);

  const total = getTotalScore(scores);
  const title = getTitle(total);

  useEffect(() => {
    if (!user) router.replace('/');
  }, [user, router]);

  const handleLevelClick = (id: number) => {
    SFX.click();
    if (!unlocked.includes(id)) {
      setShakeLevel(id);
      toast('🔒 Complete previous missions first!', 'err');
      setTimeout(() => setShakeLevel(null), 500);
      return;
    }
    router.push(`/mission/${id}/intro`);
  };

  const handleLogout = () => {
    SFX.click();
    logout();
    router.replace('/');
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <StarfieldCanvas />
      <ConfettiCanvas />
      <Toast />
      <div className="earth-deco" />

      <div style={{ position: 'relative', zIndex: 3 }}>
        {/* Top Nav */}
        <div style={{
          padding: '14px 20px',
          background: 'rgba(3,7,15,0.96)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div>
            <div className="font-orb t-accent" style={{ fontSize: '0.9rem' }}>{user.name.toUpperCase()}</div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text2)' }}>USN: {user.usn}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="label">TOTAL SCORE</div>
              <div className="hud-score" style={{ fontSize: '1.15rem' }}>{total.toLocaleString()}</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => { SFX.click(); router.push('/leaderboard'); }}>
              🏆 Leaderboard
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>↩ Logout</button>
          </div>
        </div>

        {/* Main content */}
        <div className="page-content" style={{ justifyContent: 'center', gap: 14 }}>
          {/* Mission briefing */}
          <div className="t-center" style={{ marginBottom: 4 }}>
            <div className="font-orb t-accent" style={{ fontSize: '1.05rem' }}>MISSION BRIEFING</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text2)', maxWidth: 480, margin: '7px auto 0' }}>
              Earth is under threat. Complete all 5 missions as a GRSS Field Analyst. Speed, accuracy and strategy determine your rank.
            </div>
          </div>

          {/* Level Map */}
          <div className="lv-map" id="levelMap">
            {LEVEL_CONFIG.map((lv, idx) => {
              const isDone = completed.includes(lv.id);
              const isOpen = unlocked.includes(lv.id);
              const stateClass = isDone ? 'done' : isOpen ? 'open' : 'lock';
              const isShaking = shakeLevel === lv.id;
              return (
                <div key={lv.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <div className="lv-node" onClick={() => handleLevelClick(lv.id)}>
                    <div className={`lv-icon ${stateClass} ${isShaking ? 'lock-shake' : ''}`}>
                      {isDone ? '✅' : isOpen ? lv.icon : '🔒'}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text2)', textAlign: 'center', maxWidth: 70, whiteSpace: 'pre-line', lineHeight: 1.3 }}>
                      LVL {lv.id}
                    </div>
                    <div style={{ fontSize: '0.6rem', textAlign: 'center', maxWidth: 70, whiteSpace: 'pre-line', lineHeight: 1.3, color: isDone ? 'var(--accent2)' : 'var(--text2)' }}>
                      {lv.label}
                    </div>
                    {isDone && (
                      <div className="font-orb" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>
                        {(scores[lv.id] || 0).toLocaleString()} pts
                      </div>
                    )}
                  </div>
                  {idx < LEVEL_CONFIG.length - 1 && (
                    <div className={`lv-connector ${isDone ? 'done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Power-up arsenal */}
          <div className="card card-sm" style={{ maxWidth: 440, width: '100%' }}>
            <div className="label t-center" style={{ marginBottom: 11 }}>⚡ POWER-UP ARSENAL</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { icon: '💡', label: 'HINT', count: powerups.hint },
                { icon: '⏭', label: 'SKIP', count: powerups.skip },
                { icon: '❄️', label: 'FREEZE', count: powerups.freeze },
              ].map(pu => (
                <div key={pu.label} style={{ textAlign: 'center', padding: 11, background: 'rgba(0,200,255,.05)', border: '1px solid var(--border)', borderRadius: 9 }}>
                  <div style={{ fontSize: '1.4rem' }}>{pu.icon}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', margin: '3px 0' }}>{pu.label}</div>
                  <div className="font-orb t-accent2">{pu.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current rank */}
          <div style={{ textAlign: 'center' }}>
            <div className="label">CURRENT RANK</div>
            <div className="title-badge-big" style={{ fontSize: '0.95rem', marginTop: 8 }}>
              {title.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
