'use client'; // Error components must be Client Components

import { SFX } from '@/lib/sfx';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#050b14', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <h2 style={{ color: '#fb7185', fontSize: '1.5rem', marginBottom: '16px' }}>CRITICAL SYSTEM MALFUNCTION</h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Global root layer initialization failed.</p>
          <button 
            onClick={() => { SFX.click(); reset(); }}
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            SYSTEM REBOOT
          </button>
        </div>
      </body>
    </html>
  );
}
