'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import ConfettiCanvas from '@/components/ui/ConfettiCanvas';
import Toast from '@/components/ui/Toast';

export default function AuthPage() {
  const router = useRouter();
  const { user, login } = useGameStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [usnError, setUsnError] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
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
    await new Promise(r => setTimeout(r, 400));
    login({ name: name.trim(), usn: usn.trim().toUpperCase() });
    toast(`Welcome, ${name.trim()}! Mission briefing incoming...`, 'ok');
    SFX.levelUp();
    router.push('/dashboard');
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <StarfieldCanvas />
      <ConfettiCanvas />
      <Toast />
      <div className="earth-deco" />

      <div className="center-col" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 410, width: '100%' }}>
          {/* Logo */}
          <div style={{ marginBottom: 26, textAlign: 'center' }}>
            <span className="logo-icon">🛰️</span>
            <div className="logo-title" style={{ margin: '8px 0 4px' }}>GRSS FIELD ANALYST</div>
            <div className="logo-sub">IEEE Geoscience &amp; Remote Sensing Society</div>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <span className="badge badge-red">⚡ LIVE MISSION EVENT</span>
            </div>
          </div>

          {/* Auth Card */}
          <div className="card card-glow">
            {/* Tabs */}
            <div className="tabs">
              <div
                className={`tab ${tab === 'login' ? 'on' : ''}`}
                onClick={() => { setTab('login'); SFX.click(); setNameError(false); setUsnError(false); }}
              >LOGIN</div>
              <div
                className={`tab ${tab === 'register' ? 'on' : ''}`}
                onClick={() => { setTab('register'); SFX.click(); setNameError(false); setUsnError(false); }}
              >REGISTER</div>
            </div>

            {/* Form */}
            <div style={{ marginBottom: 11 }}>
              <div className="label" style={{ marginBottom: 5 }}>
                {tab === 'login' ? 'Agent Name' : 'Full Name'}
              </div>
              <input
                className={`input ${nameError ? 'input-error' : ''}`}
                placeholder={tab === 'login' ? 'Enter your name' : 'Enter your full name'}
                value={name}
                onChange={e => { setName(e.target.value); setNameError(false); }}
                onKeyDown={handleKeyDown}
                id="authName"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="label" style={{ marginBottom: 5 }}>USN / Reg. No.</div>
              <input
                className={`input ${usnError ? 'input-error' : ''}`}
                placeholder="e.g. 1MS21CS001"
                value={usn}
                onChange={e => { setUsn(e.target.value); setUsnError(false); }}
                onKeyDown={handleKeyDown}
                id="authUsn"
              />
            </div>

            <button
              className={`btn ${tab === 'login' ? 'btn-primary' : 'btn-success'} btn-full btn-lg`}
              onClick={handleSubmit}
              disabled={loading}
              id="authSubmitBtn"
            >
              {loading ? '⏳ Deploying...' : tab === 'login' ? '🚀 DEPLOY AGENT' : '🛡️ ENLIST AS ANALYST'}
            </button>

            <div style={{ marginTop: 13, textAlign: 'center' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { SFX.click(); router.push('/demo'); }}
                id="demoBtn"
              >
                ▶ Watch Demo Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
