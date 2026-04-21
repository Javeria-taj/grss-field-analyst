'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SFX } from '@/lib/sfx';

export default function NotFound() {
  const router = useRouter();

  const handleBack = () => {
    SFX.click();
    router.replace('/');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card card-danger"
        style={{ maxWidth: 500, padding: '40px' }}
      >
        <div style={{ fontSize: '5rem', marginBottom: 20 }}>🛰️</div>
        <h1 className="font-orb t-danger" style={{ fontSize: '2.5rem', marginBottom: 10 }}>404</h1>
        <h2 className="font-orb t-accent" style={{ fontSize: '1.2rem', marginBottom: 20 }}>SIGNAL LOST</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 30, lineHeight: 1.6 }}>
          We've lost contact with the orbital relay. The sector you are trying to scan does not exist in our database.
        </p>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleBack}
          style={{ width: '100%' }}
        >
          RETURN TO COMMAND BASE
        </button>
      </motion.div>
    </div>
  );
}
