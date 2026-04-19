'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { useLeaderboardStore } from '@/stores/useLeaderboardStore';
import { getTotalScore } from '@/lib/scoring';
import { SFX } from '@/lib/sfx';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import Toast from '@/components/ui/Toast';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, scores } = useGameStore();
  const { entries, init } = useLeaderboardStore();
  
  useEffect(() => {
    init();
  }, [init]);

  const lb = [...entries]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StarfieldCanvas />
      <Toast />
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'rgba(3,7,15,0.96)', backdropFilter: 'blur(12px)' }}>
          <div className="font-orb t-accent" style={{ fontSize: '1.05rem' }}>🏆 GLOBAL LEADERBOARD</div>
          <button className="btn btn-outline btn-sm" onClick={() => { SFX.click(); router.push('/dashboard'); }}>← Back</button>
        </div>

        <div className="page-content" style={{ gap: 8 }}>
          <div style={{ maxWidth: 600, width: '100%' }}>
            {lb.length === 0 ? (
              <div className="card t-center" style={{ padding: 40 }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: 10 }}>📡</span>
                <div style={{ color: 'var(--text2)' }}>Waiting for mission data...</div>
              </div>
            ) : lb.map(entry => {
              const isMe = user?.usn === entry.usn;
              return (
                <div key={entry.usn} className={`lb-row ${isMe ? 'me' : ''} ${entry.rank === 1 ? 'r1' : ''}`}>
                  <div className="lb-rank">
                    {MEDALS[entry.rank] || `#${entry.rank}`}
                  </div>
                  <div className="lb-name-col">
                    <div className="lb-name">{entry.name} {isMe && <span className="badge badge-blue" style={{ marginLeft: 6 }}>YOU</span>}</div>
                    <div className="lb-usn">{entry.usn}</div>
                  </div>
                  <div className="lb-score">{entry.score.toLocaleString()}</div>
                </div>
              );
            })}
            <div className="t-center t-muted" style={{ marginTop: 14, fontSize: '0.78rem' }}>
              Scores are live and persist across sessions. Play all 5 levels for a final score!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
