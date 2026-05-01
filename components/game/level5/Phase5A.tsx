'use client';
import { motion } from 'framer-motion';
import { useLevel5Store } from '@/stores/useLevel5Store';
import { CASE_STUDIES } from './level5Data';

export default function Phase5A() {
  const { answers5A, setAnswer5A, proceedTo5B } = useLevel5Store();
  const allAnswered = CASE_STUDIES.every((cs) => answers5A[cs.id] !== null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Content */}
      <div style={{ flex: 1, padding: '18px 20px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{
            fontSize: '0.85rem', color: 'var(--text2)', textAlign: 'center',
            lineHeight: 1.7, marginBottom: 18,
          }}>
            Analyse each field report and classify the geoscience threat. Your diagnosis determines
            which tools are relevant in Phase B.
            <br />
            <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>
              ⚠ Answers are not revealed here — your assessment will be evaluated in Phase C.
            </span>
          </p>

          {/* Case Study Grid — 2 cols on desktop, 1 on mobile */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
            gap: 14,
          }}>
            {CASE_STUDIES.map((cs, idx) => {
              const answered = answers5A[cs.id] !== null;
              return (
                <motion.div
                  key={cs.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  style={{
                    background: 'var(--card)',
                    border: `2px solid ${answered ? 'rgba(0,200,255,0.45)' : 'var(--border)'}`,
                    borderRadius: 16,
                    padding: 18,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: answered ? '0 0 20px rgba(0,200,255,0.1)' : 'none',
                  }}
                >
                  {/* Top accent line when answered */}
                  {answered && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                      background: 'linear-gradient(90deg,var(--accent),var(--accent2))',
                    }} />
                  )}

                  <div style={{ fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 6 }}>
                    {cs.label}
                  </div>
                  <div className="font-orb" style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: 10, lineHeight: 1.3 }}>
                    {cs.title}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text3, #7a99cc)', lineHeight: 1.7, marginBottom: 14 }}>
                    {cs.desc}
                  </div>

                  {/* Dropdown — native for best mobile compatibility */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={answers5A[cs.id] ?? ''}
                      onChange={(e) => {
                        if (e.target.value === '') return;
                        setAnswer5A(cs.id, parseInt(e.target.value));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 36px 10px 13px',
                        background: answered ? 'rgba(0,200,255,0.06)' : 'rgba(0,200,255,0.04)',
                        border: `1px solid ${answered ? 'rgba(0,200,255,0.4)' : 'var(--border)'}`,
                        borderRadius: 9,
                        color: answered ? 'var(--accent)' : 'var(--text)',
                        fontFamily: "'Exo 2', sans-serif",
                        fontSize: '0.88rem',
                        fontWeight: answered ? 700 : 400,
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                    >
                      <option value="" disabled style={{ background: '#0a1428', color: 'var(--text2)' }}>
                        — CLASSIFY THREAT —
                      </option>
                      {cs.opts.map((opt, i) => (
                        <option key={i} value={i} style={{ background: '#0a1428', color: 'var(--text)' }}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {/* Chevron */}
                    <svg
                      style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      width="11" height="7" viewBox="0 0 11 7" fill="none"
                    >
                      <path d="M1 1l4.5 4.5L10 1" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Locked-in badge */}
                  {answered && (
                    <div style={{
                      marginTop: 8, fontSize: '0.7rem', color: 'var(--accent)',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span>🔒</span> Assessment locked in
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
        background: 'rgba(3,7,15,0.94)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {!allAnswered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: 'var(--warning)', fontSize: '0.82rem', marginBottom: 10 }}
            >
              ⚠ Classify all 4 threats before initiating market protocol.
            </motion.div>
          )}
          <motion.button
            className="btn btn-primary btn-lg"
            onClick={proceedTo5B}
            disabled={!allAnswered}
            whileHover={{ scale: allAnswered ? 1.03 : 1 }}
            whileTap={{ scale: allAnswered ? 0.97 : 1 }}
            style={{ minWidth: 260 }}
          >
            ⚡ INITIATE MARKET PROTOCOL
          </motion.button>
        </div>
      </div>
    </div>
  );
}
