'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api-client';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import Toast from '@/components/ui/Toast';

const FEATURE_CHIPS = ['🌍 Remote Sensing', '🛰️ Satellite Imagery', '⚡ 5 Missions', '🏆 Global Leaderboard'];

export default function AuthPage() {
  const router = useRouter();
  const { user, login, resetProgress, resetLevels } = useGameStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [usnError, setUsnError] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.isAdmin || user.usn === 'SUPER_ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router]);

  const validate = () => {
    let ok = true;
    if (!name.trim()) { setNameError(true); ok = false; }
    else setNameError(false);
    if (!usn.trim()) { setUsnError(true); ok = false; }
    else setUsnError(false);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) { SFX.wrong(); return; }
    setLoading(true);
    SFX.click();
    
    try {
      const payload = { name: name.trim(), usn: usn.trim() };
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await apiClient.post<{status: string, user: any}>(endpoint, payload);
      
      // CRITICAL: Reset all progress before logging in the new user
      resetProgress();
      resetLevels();
      
      login(res.user);
      
      if (res.user.isAdmin) {
        toast(`Administrator recognized: ${res.user.name}. Initializing Admin Center...`, 'ok');
        SFX.levelUp();
        router.push('/admin');
      } else {
        toast(`Welcome, ${res.user.name}! Mission briefing incoming...`, 'ok');
        SFX.levelUp();
        router.push('/dashboard');
      }
    } catch (err) {
      const e = err as Error;
      toast(e.message || 'Network communication failed.', 'err');
      SFX.wrong();
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    SFX.click();
    setNameError(false);
    setUsnError(false);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex' }}>
      <StarfieldCanvas />
      <Toast />
      <div className="earth-deco" />

      {/* Left branding panel — hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          flex: 1,
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 50px',
          position: 'relative',
          zIndex: 3,
        }}
        className="auth-left-panel"
      >
        <div style={{ maxWidth: 460 }}>
          <motion.span
            style={{ fontSize: '5rem', display: 'block', marginBottom: 24 }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🛰️
          </motion.span>
          <h1
            className="font-orb t-accent"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.2, marginBottom: 16 }}
          >
            GRSS FIELD ANALYST
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text2)', lineHeight: 1.8, marginBottom: 32 }}>
            A live-event gamified platform powered by IEEE Geoscience &amp; Remote Sensing Society.
            Test your knowledge across satellite imagery, disaster response, and more.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURE_CHIPS.map((chip, i) => (
              <motion.div
                key={chip}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  background: 'rgba(0,200,255,0.05)',
                  border: '1px solid rgba(0,200,255,0.15)',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  color: 'var(--text)',
                }}
              >
                {chip}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right auth panel */}
      <div style={{
        flex: '0 0 auto',
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        position: 'relative',
        zIndex: 3,
        margin: '0 auto',
      }}>
        <motion.div
          style={{ width: '100%', maxWidth: 420 }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo */}
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <motion.span
              className="logo-icon"
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🛰️
            </motion.span>
            <div className="logo-title" style={{ margin: '10px 0 4px' }}>GRSS FIELD ANALYST</div>
            <div className="logo-sub">IEEE Geoscience &amp; Remote Sensing Society</div>
            <div style={{ textAlign: 'center', marginTop: 11 }}>
              <motion.span
                className="badge badge-red"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⚡ LIVE MISSION EVENT
              </motion.span>
            </div>
          </div>

          {/* Auth Card */}
          <motion.div
            className="card card-glow"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 24 }}
          >
            {/* Tabs */}
            <div className="tabs">
              {(['login', 'register'] as const).map(t => (
                <div
                  key={t}
                  className={`tab ${tab === t ? 'on' : ''}`}
                  onClick={() => switchTab(t)}
                >
                  {t === 'login' ? 'LOGIN' : 'REGISTER'}
                </div>
              ))}
            </div>

            {/* Form */}
            <div style={{ marginBottom: 11 }}>
              <div className="label" style={{ marginBottom: 5 }}>
                {tab === 'login' ? 'Agent Name' : 'Full Name'}
              </div>
              <motion.div
                animate={focused === 'name' ? { scale: 1.01 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 600 }}
              >
                <input
                  className={`input ${nameError ? 'input-error' : ''}`}
                  placeholder={tab === 'login' ? 'Enter your name' : 'Enter your full name'}
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError(false); }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  id="authName"
                  autoComplete="name"
                  aria-label={tab === 'login' ? 'Login Agent Name' : 'Register Full Name'}
                  aria-invalid={nameError}
                  aria-required="true"
                />
              </motion.div>
            </div>

            <div style={{ marginBottom: 19 }}>
              <div className="label" style={{ marginBottom: 5 }}>USN / Reg. No.</div>
              <motion.div
                animate={focused === 'usn' ? { scale: 1.01 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 600 }}
              >
                <input
                  className={`input input-lg ${usnError ? 'input-error' : ''}`}
                  placeholder="e.g. 1MS21CS001"
                  value={usn}
                  onChange={e => { setUsn(e.target.value); setUsnError(false); }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocused('usn')}
                  onBlur={() => setFocused(null)}
                  id="authUsn"
                  autoComplete="off"
                  autoCapitalize="characters"
                  aria-label="University Seat Number"
                  aria-invalid={usnError}
                  aria-required="true"
                />
              </motion.div>
            </div>

            <motion.button
              className={`btn ${tab === 'login' ? 'btn-primary' : 'btn-success'} btn-full btn-lg`}
              onClick={handleSubmit}
              disabled={loading}
              id="authSubmitBtn"
              aria-label={tab === 'login' ? 'Deploy Agent Login' : 'Enlist as Analyst Registration'}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={loading ? 'loading' : tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {loading
                    ? '⏳ Deploying...'
                    : tab === 'login'
                    ? '🚀 DEPLOY AGENT'
                    : '🛡️ ENLIST AS ANALYST'}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <div style={{ marginTop: 13, textAlign: 'center' }}>
              <motion.button
                className="btn btn-outline btn-sm"
                onClick={() => { SFX.click(); router.push('/demo'); }}
                id="demoBtn"
                aria-label="Watch Demo Mode"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                ▶ Watch Demo Mode
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .auth-left-panel {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
