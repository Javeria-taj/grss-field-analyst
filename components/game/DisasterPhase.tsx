'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function DisasterPhase() {
  const { disasterInfo, auctionOwned, auctionTools, deployTools, hasDeployed } = useGameSyncStore();
  const [selected, setSelected] = useState<string[]>([]);

  if (!disasterInfo) return null;

  const toggle = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const ownedTools = auctionTools.filter(t => auctionOwned.includes(t.id));

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 20, minHeight: '70vh' }}>
      <motion.div style={{ textAlign: 'center', maxWidth: 600 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div style={{ fontSize: '3.5rem' }}>{disasterInfo.icon}</div>
        <div className="font-orb" style={{ fontSize: '1.3rem', color: disasterInfo.color, marginTop: 8 }}>{disasterInfo.name}</div>
        <div style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: 12, lineHeight: 1.6 }}>{disasterInfo.desc}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          {disasterInfo.metrics.map(m => (
            <span key={m} style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, color: 'var(--text2)' }}>{m}</span>
          ))}
        </div>
      </motion.div>

      <motion.div className="card" style={{ maxWidth: 500, width: '100%' }}
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="label t-accent" style={{ marginBottom: 12 }}>SELECT TOOLS TO DEPLOY</div>
        {ownedTools.length === 0 ? (
          <div style={{ color: 'var(--text2)', textAlign: 'center', padding: 20 }}>No tools purchased!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ownedTools.map(t => (
              <motion.button key={t.id} className="btn btn-outline"
                disabled={hasDeployed}
                style={{
                  display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px',
                  borderColor: selected.includes(t.id) ? 'var(--accent2)' : 'var(--border)',
                  background: selected.includes(t.id) ? 'rgba(74,222,128,0.08)' : 'transparent',
                }}
                onClick={() => toggle(t.id)}>
                <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: '0.85rem' }}>{t.name}</span>
                {selected.includes(t.id) && <span style={{ color: 'var(--accent2)' }}>✓</span>}
              </motion.button>
            ))}
          </div>
        )}
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}
          disabled={hasDeployed || selected.length === 0}
          onClick={() => deployTools(selected)}>
          {hasDeployed ? '✓ DEPLOYED — AWAITING RESULTS' : `🚀 DEPLOY ${selected.length} TOOL${selected.length !== 1 ? 'S' : ''}`}
        </button>
      </motion.div>
    </div>
  );
}
