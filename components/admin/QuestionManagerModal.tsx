'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function QuestionManagerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { adminStats, bankQuestions, adminDeleteBankQuestion, adminGetBank } = useGameSyncStore();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  useEffect(() => {
    if (isOpen) adminGetBank();
  }, [isOpen, adminGetBank]);

  if (!isOpen) return null;

  const levels = [
    { id: 1, name: 'Level 1: Scramble/Riddle', limit: adminStats?.levelLimits?.[1] ?? 10 },
    { id: 2, name: 'Level 2: Image MCQ', limit: adminStats?.levelLimits?.[2] ?? 5 },
    { id: 3, name: 'Level 3: Emoji Hangman', limit: adminStats?.levelLimits?.[3] ?? 5 },
    { id: 4, name: 'Level 4: Rapid Fire MCQ', limit: adminStats?.levelLimits?.[4] ?? 10 },
  ];

  const filtered = (bankQuestions || []).filter(q => Number(q.level) === Number(selectedLevel));
  const currentLimit = levels.find(l => l.id === selectedLevel)?.limit ?? 0;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', 
          backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', padding: 20 
        }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          style={{ 
            background: '#0a0f1d', width: '100%', maxWidth: 800, 
            borderRadius: 16, border: '1px solid var(--accent)', 
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh',
            boxShadow: '0 0 40px rgba(0,200,255,0.2)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <h2 className="font-orb t-accent" style={{ fontSize: '1.2rem', margin: 0 }}>MISSION DATA MENU</h2>
              <p style={{ fontSize: '0.7rem', color: 'var(--text2)', marginTop: 4 }}>Review live question pools and operational constraints.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
               <button className="btn btn-outline btn-sm" onClick={() => adminGetBank()} style={{ fontSize: '0.65rem' }}>🔄 REFRESH</button>
               <button className="btn btn-outline btn-sm" onClick={onClose} style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.65rem' }}>CLOSE</button>
            </div>
          </div>

          {/* Level Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border)' }}>
            {levels.map(lv => (
              <button 
                key={lv.id}
                onClick={() => setSelectedLevel(lv.id)}
                style={{ 
                  flex: 1, padding: '14px', fontSize: '0.8rem', border: 'none',
                  background: selectedLevel === lv.id ? 'rgba(0,200,255,0.1)' : 'transparent',
                  color: selectedLevel === lv.id ? 'var(--accent)' : 'var(--text2)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  borderBottom: selectedLevel === lv.id ? '2px solid var(--accent)' : 'none'
                }}
              >
                LVL {lv.id}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text)' }}>{levels.find(l => l.id === selectedLevel)?.name}</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: filtered.length > currentLimit ? 'var(--danger)' : 'var(--text2)' }}>
                  {filtered.length} / {currentLimit} Questions
                </span>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', border: '1px solid var(--accent2)', color: 'var(--accent2)' }}>
                  Pool Capacity: {currentLimit}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {filtered.length === 0 ? (
                <div className="t-muted t-center" style={{ padding: 60, border: '1px dashed var(--border)', borderRadius: 12, background: 'rgba(255,255,255,0.01)' }}>
                  No questions found for this mission in the draft bank.
                </div>
              ) : (
                filtered.map((q, i) => (
                  <motion.div 
                    key={q.id || i}
                    initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                       <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--bg)' }}>
                          {i + 1}
                       </div>
                       <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: 1 }}>{q.type} · {q.points} PTS</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text)', marginTop: 2, fontWeight: 500 }}>{q.questionText || q.scrambledText || q.word || 'Mission Content'}</div>
                          {q.answer && <div style={{ fontSize: '0.7rem', color: 'var(--warning)', marginTop: 4 }}>Key: {q.answer}</div>}
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <button className="btn btn-outline btn-sm" style={{ padding: '6px 10px' }} onClick={() => alert('Use the Question Bank Panel below to edit.')}>✎</button>
                       <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '6px 10px' }} onClick={() => { if(confirm('Delete?')) adminDeleteBankQuestion(q.id); }}>🗑</button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>ENCRYPTED SESSION · OPERATIONAL DATA ONLY</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
