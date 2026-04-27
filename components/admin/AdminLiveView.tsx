'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';

export default function AdminLiveView() {
  const { leaderboard, adminStats, adminKickPlayer } = useGameSyncStore();

  return (
    <div className="card" style={{ width: '100%', borderTop: '2px solid var(--accent2)' }}>
      <div className="label t-accent2" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span>🕵️ OPERATIVE MONITOR (GOD-MODE)</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{leaderboard.length} ANALYSTS DETECTED</span>
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
        <table style={{ width: '100%', textAlign: 'left', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', fontSize: '0.65rem' }}>
              <th style={{ padding: '8px 4px' }}>RANK</th>
              <th style={{ padding: '8px 4px' }}>OPERATIVE / USN</th>
              <th style={{ padding: '8px 4px' }}>FACTION</th>
              <th style={{ padding: '8px 4px' }}>STREAK</th>
              <th style={{ padding: '8px 4px' }}>TOTAL SCORE</th>
              <th style={{ padding: '8px 4px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((e, i) => (
              <motion.tr 
                key={e.usn} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
              >
                <td style={{ padding: '10px 4px' }} className="font-orb t-accent">#{i + 1}</td>
                <td style={{ padding: '10px 4px' }}>
                  <div style={{ fontWeight: 600 }}>{e.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{e.usn}</div>
                </td>
                <td style={{ padding: '10px 4px' }}>
                  <span style={{ 
                    fontSize: '0.6rem', 
                    padding: '2px 6px', 
                    borderRadius: 4, 
                    background: e.faction === 'team_sentinel' ? 'rgba(59,130,246,0.1)' : e.faction === 'team_landsat' ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.1)',
                    color: e.faction === 'team_sentinel' ? '#3b82f6' : e.faction === 'team_landsat' ? '#10b981' : '#a855f7'
                  }}>
                    {(e.faction || 'UNKNOWN').split('_')[1]?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 4px' }}>
                  {e.streak > 0 ? (
                    <span style={{ color: e.streak >= 3 ? '#f97316' : 'var(--text2)' }}>
                      {e.streak}x {e.streak >= 3 ? '🔥' : ''}
                    </span>
                  ) : '0'}
                </td>
                <td style={{ padding: '10px 4px' }} className="font-orb t-gold">{e.totalScore}</td>
                <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" 
                      style={{ padding: '2px 6px', fontSize: '0.6rem', borderColor: 'var(--warning)', color: 'var(--warning)' }}
                      onClick={() => { SFX.click(); useGameSyncStore.getState().adminSabotagePlayer(e.usn); toast(`Glitching ${e.usn}...`, 'ok'); }}>
                      GLITCH
                    </button>
                    <button className="btn btn-outline btn-sm" 
                      style={{ padding: '2px 6px', fontSize: '0.6rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      onClick={() => { if(confirm(`🚫 KICK PLAYER ${e.usn}?`)) adminKickPlayer(e.usn); }}>
                      KICK
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
