import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function FrequencySliders({ onComplete, glitchPhase }: { onComplete: () => void, glitchPhase: number }) {
  const [values, setValues] = useState([50, 50, 50]);
  
  const targets = useMemo(() => [
    Math.floor(Math.random() * 60 + 20),
    Math.floor(Math.random() * 60 + 20),
    Math.floor(Math.random() * 60 + 20)
  ], []);

  const isMatch = (i: number) => Math.abs(values[i] - targets[i]) <= 8;

  useEffect(() => {
    if (isMatch(0) && isMatch(1) && isMatch(2)) {
      onComplete();
    }
  }, [values, targets]);

  const names = ['RADIO', 'MICROWAVE', 'INFRARED'];

  return (
    <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20, fontSize: '0.9rem', fontWeight: 'bold' }}>
        SYNC ALL FREQUENCIES TO GREEN ZONES
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 20, background: '#000', border: '4px solid #fff' }}>
        {values.map((val, i) => {
          const match = isMatch(i);
          return (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', fontWeight: 'bold', color: match ? '#00ff66' : '#fff' }}>
                <span>{names[i]}</span>
                <span>{val}MHz</span>
              </div>
              <div style={{ position: 'relative', height: 40, background: '#1a1a1a', border: \`2px solid \${match ? '#00ff66' : '#444'}\`, display: 'flex', alignItems: 'center' }}>
                {/* Target Zone */}
                <div style={{
                  position: 'absolute',
                  left: \`\${Math.max(0, targets[i] - 8)}%\`,
                  width: '16%',
                  height: '100%',
                  background: match ? '#00ff66' : (glitchPhase % 2 === 0 ? 'rgba(255,0,51,0.5)' : 'rgba(255,255,255,0.2)'),
                  transition: 'background 0.2s'
                }} />
                
                <input
                  type="range"
                  min="0" max="100"
                  value={val}
                  onChange={e => {
                    const newVals = [...values];
                    newVals[i] = parseInt(e.target.value);
                    setValues(newVals);
                  }}
                  style={{
                    width: '100%', position: 'relative', zIndex: 10, opacity: 0, cursor: 'pointer', height: '100%'
                  }}
                />
                
                {/* Custom Thumb */}
                <div style={{
                  position: 'absolute', left: \`\${val}%\`, top: -5, bottom: -5, width: 10,
                  transform: 'translateX(-50%)',
                  background: '#fff', border: '2px solid #000', pointerEvents: 'none', zIndex: 5
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
