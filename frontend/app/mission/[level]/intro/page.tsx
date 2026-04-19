'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { LEVEL_INTROS } from '@/lib/gameData';
import { SFX } from '@/lib/sfx';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import Toast from '@/components/ui/Toast';

export default function LevelIntroPage() {
  const { level } = useParams<{ level: string }>();
  const router = useRouter();
  const { user, unlocked } = useGameStore();
  const lvl = parseInt(level);
  const intro = LEVEL_INTROS[lvl as keyof typeof LEVEL_INTROS];

  useEffect(() => {
    if (!user) router.replace('/');
    else if (!unlocked.includes(lvl)) router.replace('/dashboard');
  }, [user, unlocked, lvl, router]);

  if (!intro) return null;

  const begin = () => {
    SFX.click();
    router.push(`/mission/${lvl}/play`);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <StarfieldCanvas />
      <Toast />
      <div className="earth-deco" />

      <div className="center-col" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 10 }}>{intro.icon}</div>
          <span className="badge badge-blue" style={{ marginBottom: 10 }}>{intro.badge}</span>
          <h2
            className="font-orb t-accent glow-txt"
            style={{ margin: '10px 0 14px', fontSize: 'clamp(1.1rem,3vw,1.5rem)' }}
          >
            {intro.title}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text3)', lineHeight: 1.85, marginBottom: 18 }}>
            {intro.story}
          </p>
          <div className="card card-sm" style={{ marginBottom: 18, textAlign: 'left' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {intro.rules}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => router.push('/dashboard')}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={begin} id="beginMissionBtn">
              🚀 BEGIN MISSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
