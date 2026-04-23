'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { toast } from '@/components/ui/Toast';

export default function QuestionBankPanel() {
  const { adminGetBank, adminAddBankQuestion, adminUpdateBankQuestion, adminDeleteBankQuestion, adminLoadBank, bankQuestions } = useGameSyncStore();
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setQuestions(bankQuestions);
  }, [bankQuestions]);

  // We should listen to bank updates if the server broadcasts them, but for now we manually fetch
  useEffect(() => {
    adminGetBank();
  }, [adminGetBank]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormData((prev: any) => ({ ...prev, imageUrl: data.url }));
        toast('Image uploaded successfully', 'ok');
      } else {
        toast('Upload failed: ' + data.error, 'err');
      }
    } catch (err) {
      toast('Upload failed', 'err');
    }
    setUploading(false);
  };

  const handleSave = () => {
    if (!formData.level || !formData.points || !formData.timerLimit) {
      toast('Please fill all required fields', 'err');
      return;
    }

    // Limit check
    const LIMITS: Record<number, number> = { 1: 10, 2: 5, 3: 5, 4: 10, 5: 0 };
    const currentCount = questions.filter(q => q.level === formData.level).length;
    if (!editingId && currentCount >= LIMITS[formData.level]) {
      alert(`Question number exceeded for Level ${formData.level}! Maximum is ${LIMITS[formData.level]}.`);
      return;
    }

    // Also require answers
    if (!formData.answer && formData.type !== 'hangman' && formData.type !== 'image_mcq' && formData.type !== 'mcq') {
      toast('Answer is required', 'err');
      return;
    }
    if (formData.type === 'hangman' && !formData.word) {
      toast('Word is required for hangman', 'err');
      return;
    }

    if (editingId) {
      adminUpdateBankQuestion(editingId, formData);
    } else {
      adminAddBankQuestion(formData);
    }
    setEditingId(null);
    setFormData({});
    toast('Question saved to draft bank', 'ok');
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setFormData(q);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this question?')) return;
    adminDeleteBankQuestion(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast('Question deleted', 'ok');
  };

  const deployBank = () => {
    if (!confirm('Deploy this draft bank to the live game engine? This will override hardcoded questions for these levels.')) return;
    adminLoadBank(questions);
    toast('Bank deployed to Live Engine', 'ok');
  };

  const setLevelAndType = (lvl: number) => {
    let type = '';
    if (lvl === 1) type = 'scramble'; // Default for lvl 1, user can toggle between scramble/riddle if we keep toggle
    if (lvl === 2) type = 'image_mcq';
    if (lvl === 3) type = 'hangman';
    if (lvl === 4) type = 'mcq';
    setFormData({ ...formData, level: lvl, type });
  };

  return (
    <div className="card" style={{ maxWidth: 900, width: '100%', borderTop: '2px solid var(--accent2)' }}>
      <div className="label t-accent2" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span>📂 QUESTION BANK</span>
        <button className="btn btn-primary btn-sm" onClick={deployBank}>🚀 DEPLOY TO ENGINE</button>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        {/* Editor Form */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8 }}>
          <h4 style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--text)' }}>
            {editingId ? 'Edit Question' : 'Add New Question'}
          </h4>

          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div>
                <label className="label" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.65rem', marginBottom: 8, display: 'block' }}>TARGET MISSION</label>
                <select className="input"
                  style={{ width: '100%', border: '1px solid var(--accent)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem' }}
                  value={formData.level || ''}
                  onChange={e => setLevelAndType(parseInt(e.target.value))}
                >
                  <option value="" disabled>-- Select Level --</option>
                  <option value="1">1️⃣ Level 1: Scramble/Riddle</option>
                  <option value="2">2️⃣ Level 2: Image MCQ</option>
                  <option value="3">3️⃣ Level 3: Emoji Hangman</option>
                  <option value="4">4️⃣ Level 4: Rapid Fire MCQ</option>
                </select>
              </div>
              <div>
                <label className="label" style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.65rem', marginBottom: 8, display: 'block' }}>MECHANIC TYPE</label>
                <select
                  className="input"
                  disabled={formData.level > 1}
                  style={{
                    width: '100%',
                    border: '1px solid var(--border)',
                    background: formData.level > 1 ? 'rgba(255,255,255,0.05)' : 'var(--bg)',
                    color: formData.level > 1 ? 'var(--text2)' : 'var(--text)',
                    cursor: formData.level > 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    opacity: formData.level > 1 ? 0.7 : 1
                  }}
                  value={formData.type || ''}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="" disabled>-- Auto-assigned --</option>
                  {formData.level === 1 ? (
                    <>
                      <option value="scramble">Word Scramble</option>
                      <option value="riddle">Cryptic Riddle</option>
                    </>
                  ) : (
                    <option value={formData.type}>{formData.type?.replace('_', ' ').toUpperCase()}</option>
                  )}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Points</label>
                <input className="input" type="number" value={formData.points || ''} onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Time (s)</label>
                <input className="input" type="number" value={formData.timerLimit || ''} onChange={e => setFormData({ ...formData, timerLimit: parseInt(e.target.value) })} />
              </div>
            </div>

            {formData.type === 'scramble' && (
              <input className="input" placeholder="Scrambled Text" value={formData.scrambledText || ''} onChange={e => setFormData({ ...formData, scrambledText: e.target.value })} />
            )}

            {(formData.type === 'riddle' || formData.type === 'mcq' || formData.type === 'image_mcq' || formData.type === 'hangman') && (
              <textarea className="input" placeholder={formData.type === 'hangman' ? 'Emoji sequence' : 'Question Text'} value={formData.questionText || ''} onChange={e => setFormData({ ...formData, questionText: e.target.value })} />
            )}

            {(formData.type === 'image_mcq') && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ fontSize: '0.8rem' }} />
                {uploading && <span className="t-warning" style={{ fontSize: '0.8rem' }}>Uploading...</span>}
                {formData.imageUrl && <img src={formData.imageUrl} style={{ height: 40, borderRadius: 4 }} alt="Preview" />}
              </div>
            )}

            {(formData.type === 'mcq' || formData.type === 'image_mcq') && (
              <>
                <input className="input" placeholder="Options (comma separated)" value={formData.options?.join(',') || ''} onChange={e => setFormData({ ...formData, options: e.target.value.split(',').map(s => s.trim()) })} />
                <input className="input" type="number" placeholder="Correct Option Index (0-based)" value={formData.correctOptionIndex ?? ''} onChange={e => setFormData({ ...formData, correctOptionIndex: parseInt(e.target.value) })} />
              </>
            )}

            {(formData.type === 'hangman') && (
              <input className="input" placeholder="Target Word" value={formData.word || ''} onChange={e => setFormData({ ...formData, word: e.target.value })} />
            )}

            {formData.type !== 'hangman' && formData.type !== 'mcq' && formData.type !== 'image_mcq' && (
              <input className="input" placeholder="Exact Answer" value={formData.answer || ''} onChange={e => setFormData({ ...formData, answer: e.target.value })} />
            )}

            <input className="input" placeholder="Hint 1" value={formData.hint1 || ''} onChange={e => setFormData({ ...formData, hint1: e.target.value })} />
            <input className="input" placeholder="Hint 2 (optional)" value={formData.hint2 || ''} onChange={e => setFormData({ ...formData, hint2: e.target.value })} />
            <input className="input" placeholder="Explanation (shown after)" value={formData.explanation || ''} onChange={e => setFormData({ ...formData, explanation: e.target.value })} />

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSave}>SAVE QUESTION</button>
              {editingId && <button className="btn btn-outline" onClick={() => { setEditingId(null); setFormData({}); }}>CANCEL</button>}
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 600, overflowY: 'auto' }}>
          {questions.length === 0 ? (
            <div className="t-muted" style={{ fontSize: '0.8rem' }}>Bank is empty.</div>
          ) : (
            questions.map((q, i) => (
              <div key={q.id || i} style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Lvl {q.level} · {q.type.toUpperCase()}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{q.questionText || q.scrambledText || q.word || 'Question'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(q)}>✎</button>
                  <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDelete(q.id)}>🗑</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
