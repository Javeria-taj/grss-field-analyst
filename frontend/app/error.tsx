'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SFX } from '@/lib/sfx';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="center-col" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card card-danger t-center shadow-2xl backdrop-blur-3xl"
        style={{ maxWidth: 400, border: '1px solid rgba(255, 45, 85, 0.4)' }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>⚠️</div>
        <h2 className="font-orb t-danger" style={{ fontSize: '1.4rem' }}>
          SYSTEM MALFUNCTION
        </h2>
        <p style={{ color: 'var(--text2)', margin: '16px 0', fontSize: '0.9rem' }}>
          An unhandled error occurred in the GRSS platform interface. 
          The local interface requires a restart.
        </p>
        <button
          className="btn btn-primary btn-full shadow-lg"
          onClick={() => { SFX.click(); reset(); }}
          style={{ background: 'linear-gradient(135deg, rgba(255,45,85,0.8), rgba(200,0,50,0.8))' }}
        >
          RE-INITIALIZE
        </button>
      </motion.div>
    </div>
  );
}
