'use client';

import { useEffect, useState, useRef, useMemo, Fragment } from 'react';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { SFX } from '@/lib/sfx';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import RadarCanvas from '@/components/ui/RadarCanvas';

const TICKER_DATA = [
  ['ORBITAL ALT', '694 km'], ['INCLINATION', '98.7°'], ['SWATH WIDTH', '290 km'],
  ['REVISIT TIME', '5 days'], ['CLOUD REJ', 'NOMINAL'], ['NDVI THRESHOLD', '0.63'],
  ['SAR FREQUENCY', 'C-BAND'], ['RESOLUTION', '10 m'], ['TELEMETRY LOCK', 'CONFIRMED'],
  ['DATA RATE', '520 Mbps'], ['SOLAR PANEL', 'OPTIMAL'], ['GROUND TRACK', 'ASCENDING'],
  ['PASS COUNT', '1,847'], ['EPOCH', 'J2000'], ['GROUND STA', 'SVALBARD'],
  ['SIGNAL LAG', '22 ms'], ['ORBIT TYPE', 'SUN-SYNC'], ['RADIOMETRIC CAL', 'PASS'],
];

const TELEM_LIVE = [
  ['SWATH', '290 KM'], ['REVISIT', '5 DAYS'], ['ALT', '694 KM'],
  ['SNR', '42 dB'], ['INCL', '98.7°'], ['FRAME', 'L1C'],
];

const FACTIONS = [
  { id: 'team_sentinel', name: 'SENTINEL · SAR', color: 'var(--sentinel)' },
  { id: 'team_landsat', name: 'LANDSAT · OPTICAL', color: 'var(--landsat)' },
  { id: 'team_modis', name: 'MODIS · THERMAL', color: 'var(--modis)' },
];

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  const startVal = useRef(0);
  useEffect(() => {
    const start = startVal.current;
    const startTime = performance.now();
    let animId: number;
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / 1500, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (value - start) * easeOut);
      setDisplay(current);
      startVal.current = current;
      if (progress < 1) animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value]);
  return <>{display}</>;
};

export default function ProjectorPage() {
  const {
    phase, currentLevel, currentQuestion, timerEndTime, timerTotal,
    leaderboard, adminLiveStats, adminStats, factionScores,
    levelCompleteData, reviewData, init, destroy, connected
  } = useGameSyncStore();

  const [timeLeft, setTimeLeft] = useState(0);
  const [utcTime, setUtcTime] = useState('00:00:00 UTC');
  const [telemIdx, setTelemIdx] = useState(0);
  const [orbitPass, setOrbitPass] = useState('ORBIT 14 / PASS 3');
  const [isLeaderboardExpanded, setIsLeaderboardExpanded] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [dataIntegrity, setDataIntegrity] = useState(98);
  const [xFreq, setXFreq] = useState(8.4);

  const LEVEL_TITLES: Record<number, string> = {
    1: 'RIDDLES AND WORD SCRAMBLE',
    2: 'IMAGE GUESSING',
    3: 'EMOJI HANGMAN',
    4: 'RAPID FIRE',
    5: 'DISASTER DASH'
  };

  const orbitRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    init();
    return () => { destroy(); SFX.stopMusic(); };
  }, [init, destroy]);

  useEffect(() => {
    if (phase === 'question_active') SFX.playMusic('active');
    else if (phase === 'auction_active' || phase === 'disaster_active') SFX.playMusic('tense');
    else SFX.playMusic('ambient');
  }, [phase]);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      const now = new Date();
      setUtcTime(`${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`);
    }, 1000);
    return () => clearInterval(timer);
  }, [timerEndTime]);

  useEffect(() => {
    const tTimer = setInterval(() => setTelemIdx(i => (i + 1) % TELEM_LIVE.length), 3500);
    const oTimer = setInterval(() => {
      const pass = Math.floor(Date.now() / 90000) % 20 + 1;
      setOrbitPass(`ORBIT ${14 + Math.floor(pass / 6)} / PASS ${pass % 6 + 1}`);
    }, 12000);
    return () => { clearInterval(tTimer); clearInterval(oTimer); };
  }, []);

  // Map backend phase names to projector UI states
  const uiPhase = useMemo(() => {
    if (phase === 'idle') return 'idle';
    if (phase === 'level_intro') return 'level_intro';
    if (phase === 'question_active') return 'question';
    if (phase === 'question_review') return 'results';
    if (phase === 'auction_active') return 'auction';
    if (phase === 'disaster_active') return 'disaster';
    if (phase === 'anomaly_active') return 'anomaly';
    if (phase === 'level_complete' || phase === 'game_over') return 'levelend';
    return 'idle';
  }, [phase]);

  const phaseLabel = {
    idle: 'AWAITING ANALYSTS',
    level_intro: 'MISSION START',
    question: 'ACTIVE ACQUISITION',
    results: 'TELEMETRY REVIEW',
    auction: 'CONSTELLATION PROCUREMENT',
    disaster: 'ANOMALY RECONNAISSANCE',
    anomaly: 'SYSTEM COMPROMISED',
    levelend: 'RECON COMPLETE'
  }[uiPhase];

  // Custom QR Matrix (visually matching the HTML)
  const qrMatrix = useMemo(() => {
    const pattern = [];
    const corners = [[0, 0], [0, 6], [6, 0]];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        let filled = false;
        corners.forEach(([cr, cc]) => {
          if (row >= cr && row <= cr + 2 && col >= cc && col <= cc + 2) filled = true;
          if ((row === cr - 1 || row === cr + 3) && col >= cc - 1 && col <= cc + 3) filled = true;
          if ((col === cc - 1 || col === cc + 3) && row >= cr - 1 && row <= cr + 3) filled = true;
        });
        if ((row === 3 && col % 2 === 0) || (col === 3 && row % 2 === 0)) filled = true;
        if (!filled) filled = ((row * 13 + col * 7 + row * col) % 3 === 0);
        pattern.push(filled);
      }
    }
    return pattern;
  }, []);





  useEffect(() => {
    if (!orbitRef.current) return;
    const cv = orbitRef.current;
    const cx = cv.getContext('2d')!;
    const W = cv.width, H = cv.height;
    let t = 0, animId: number;
    const drawOrbit = () => {
      cx.clearRect(0, 0, W, H);
      [60, 72, 86].forEach((r, i) => {
        cx.beginPath(); cx.ellipse(W / 2, H / 2, r, r * 0.36, -0.2, 0, Math.PI * 2);
        cx.strokeStyle = `rgba(0,240,255,${0.08 - i * 0.02})`; cx.lineWidth = 1; cx.stroke();
      });
      const earthGrad = cx.createRadialGradient(W / 2, H / 2, 2, W / 2, H / 2, 44);
      earthGrad.addColorStop(0, '#1a5276'); earthGrad.addColorStop(0.4, '#0e2745'); earthGrad.addColorStop(1, '#040c1e');
      cx.beginPath(); cx.arc(W / 2, H / 2, 44, 0, Math.PI * 2); cx.fillStyle = earthGrad; cx.fill();
      cx.strokeStyle = 'rgba(0,240,255,0.2)'; cx.lineWidth = 1; cx.stroke();

      const sats = [
        { r: 60, flat: 0.36, tilt: -0.2, speed: 0.022, phase: 0, col: '#3b82f6' },
        { r: 72, flat: 0.36, tilt: -0.2, speed: -0.015, phase: 2.1, col: '#10b981' },
        { r: 86, flat: 0.36, tilt: -0.2, speed: 0.01, phase: 4.4, col: '#a855f7' },
      ];
      sats.forEach(s => {
        const a = t * s.speed + s.phase;
        const sx = W / 2 + Math.cos(a) * s.r; const sy = H / 2 + Math.sin(a) * s.r * s.flat;
        cx.beginPath(); cx.arc(sx, sy, 3, 0, Math.PI * 2); cx.fillStyle = s.col; cx.shadowColor = s.col; cx.shadowBlur = 6; cx.fill(); cx.shadowBlur = 0;
      });
      t++; animId = requestAnimationFrame(drawOrbit);
    };
    drawOrbit();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Floating Emojis based on reactions
  const [emojis, setEmojis] = useState<{ id: string, emoji: string, left: number, delay: number }[]>([]);
  useEffect(() => {
    if (adminLiveStats?.reactions?.length) {
      const newEmojis = adminLiveStats.reactions.map(r => ({
        id: r.id, emoji: r.emoji, left: 60 + Math.random() * (window.innerWidth - 120), delay: Math.random() * 0.3
      }));
      setEmojis(prev => [...prev, ...newEmojis]);
      setTimeout(() => {
        setEmojis(prev => prev.filter(e => !newEmojis.find(n => n.id === e.id)));
      }, 4000);
    }
  }, [adminLiveStats?.reactions]);
  
  // Reset suspense state when game resets
  useEffect(() => {
    if (uiPhase === 'idle' || uiPhase === 'level_intro') {
      setShowFinalResults(false);
    }
  }, [uiPhase]);

  // Jittery telemetry drift
  useEffect(() => {
    const timer = setInterval(() => {
      setDataIntegrity(prev => Math.min(100, Math.max(94, prev + (Math.random() - 0.5) * 2)));
      setXFreq(prev => 8.4 + (Math.random() - 0.5) * 0.05);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const maxScore = leaderboard.length ? leaderboard[0].totalScore : 1;
  const timePct = Math.min(100, (timeLeft / (timerTotal || 60)) * 100);

  // Compute biggest riser
  const riser = useMemo(() => {
    if (!leaderboard.length) return null;
    const prev = leaderboard.map((e, idx) => ({ ...e, prevRank: (e as any).prevRank ?? idx + 1 }));
    return prev.reduce<any>((best, e) => {
      const delta = e.prevRank - e.rank;
      return delta > (best?.delta ?? 0) ? { ...e, delta } : best;
    }, null);
  }, [leaderboard]);

  const medals = ['🥇', '🥈', '🥉'];

  if (!connected) return <div style={{ background: '#03070f', height: '100vh' }} />;

  return (
    <>
      <style>{`
        :root {
          --bg: #03070f; --nir: #00f0ff; --opt: #00ff88; --thm: #b500ff; --alert: #ff2d55; --gold: #ffd700; --warn: #ffaa00;
          --sentinel: #3b82f6; --landsat: #10b981; --modis: #a855f7;
          --text: #eef5ff; --text2: #88aacc; --text3: #aaccff; --border: rgba(0,240,255,0.18); --border2: rgba(0,255,136,0.18);
          --font-orb: 'Orbitron', monospace; --font-exo: 'Exo 2', sans-serif; --font-mono: 'Share Tech Mono', monospace;
        }
        .prj-shell { position:fixed; inset:0; background:rgba(3,7,15,0.7); color:var(--text); font-family:var(--font-exo); display:grid; grid-template-rows:64px 1fr 48px; grid-template-columns:1fr 400px; grid-template-areas:"header header" "main sidebar" "ticker ticker"; overflow:hidden; z-index:10; }
        .prj-shell::before { content:''; position:fixed; inset:0; pointer-events:none; z-index:9000; background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px); }
        .prj-shell::after { content:''; position:fixed; inset:0; pointer-events:none; z-index:8999; background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.4) 100%); }
        #radarCanvas { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:0; }
        
        #header { grid-area:header; display:flex; align-items:center; justify-content:space-between; padding:0 24px; background:rgba(3,7,15,0.97); border-bottom:1px solid var(--border); backdrop-filter:blur(12px); position:relative; overflow:hidden; }
        #header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg, transparent, var(--nir) 20%, var(--opt) 50%, var(--thm) 80%, transparent); animation:scanHeader 4s linear infinite; }
        @keyframes scanHeader { 0%{opacity:.4;transform:scaleX(.6)} 50%{opacity:1;transform:scaleX(1)} 100%{opacity:.4;transform:scaleX(.6)} }
        .hdr-left { display:flex; align-items:center; gap:16px; } .hdr-logo { font-family:var(--font-orb); font-size:1.15rem; font-weight:900; color:var(--nir); letter-spacing:3px; text-shadow:0 0 10px rgba(0,240,255,0.5); } .hdr-logo span { color:var(--opt); }
        .hdr-divider { width:1px; height:30px; background:var(--border); } .hdr-status { display:flex; align-items:center; gap:7px; font-family:var(--font-mono); font-size:.72rem; color:var(--opt); letter-spacing:1px; }
        .pulse-dot { width:8px; height:8px; border-radius:50%; background:var(--opt); box-shadow:0 0 8px var(--opt); animation:pulseDot 1.4s ease-in-out infinite; }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        .hdr-center { position:absolute; left:50%; transform:translateX(-50%); text-align:center; } .hdr-mission { font-family:var(--font-orb); font-size:.6rem; letter-spacing:4px; color:var(--text2); text-transform:uppercase; }
        .hdr-phase-lbl { font-family:var(--font-orb); font-size:1.2rem; font-weight:800; color:#fff; text-shadow:0 0 15px rgba(255,255,255,0.3); animation:fadePhaseName 1s ease; } @keyframes fadePhaseName { from{opacity:0;letter-spacing:8px} to{opacity:1;letter-spacing:.5px} }
        .hdr-right { display:flex; align-items:center; gap:20px; } .stat-block { text-align:right; } .stat-lbl { font-size:.56rem; letter-spacing:2px; text-transform:uppercase; color:var(--text2); }
        .stat-val { font-family:var(--font-orb); font-size:1rem; font-weight:700; } .stat-val.nir { color:var(--nir); } .utc-clock { font-family:var(--font-mono); font-size:.75rem; color:var(--nir); letter-spacing:2px; border:1px solid var(--border); border-radius:5px; padding:4px 10px; background:rgba(0,240,255,.04); }

        #sidebar { grid-area:sidebar; display:flex; flex-direction:column; background:rgba(3,7,15,0.96); border-left:1px solid var(--border); overflow:hidden; }
        .sb-section { padding:14px 16px; border-bottom:1px solid var(--border); flex:0 0 auto; }
        .sb-title { font-family:var(--font-orb); font-size:.7rem; font-weight:700; letter-spacing:3px; color:var(--text); text-transform:uppercase; margin-bottom:12px; display:flex; align-items:center; gap:7px; text-shadow:0 0 5px rgba(238,245,255,0.2); }
        .sb-title::before { content:''; width:16px; height:1px; background:linear-gradient(90deg, var(--nir), transparent); }
        
        .lb-row { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; margin-bottom:5px; background:rgba(255,255,255,.02); border:1px solid transparent; transition:all .4s; position:relative; overflow:hidden; }
        .lb-row.rank1 { background:rgba(0,240,255,.07); border-color:rgba(0,240,255,.25); box-shadow:0 0 16px rgba(0,240,255,.08); }
        .lb-row::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; border-radius:2px; } .lb-row.rank1::before { background:var(--nir); } .lb-row.rank2::before { background:rgba(200,200,200,.6); } .lb-row.rank3::before { background:rgba(180,120,0,.6); }
        .lb-rank { font-family:var(--font-orb); font-size:.72rem; width:18px; color:var(--text2); flex-shrink:0; } .lb-row.rank1 .lb-rank { color:var(--nir); }
        .lb-name-block { flex:1; min-width:0; } .lb-name { font-size:.85rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff; } .lb-row.rank1 .lb-name { color:var(--nir); text-shadow:0 0 10px rgba(0,240,255,0.3); }
        .lb-usn { font-size:.6rem; color:var(--text2); font-family:var(--font-mono); } .lb-score { font-family:var(--font-orb); font-size:.78rem; color:var(--opt); font-weight:700; flex-shrink:0; }
        
        .faction-row { margin-bottom:11px; } .faction-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; } .faction-name { font-size:.72rem; font-weight:700; letter-spacing:.5px; } .faction-score { font-family:var(--font-orb); font-size:.68rem; }
        .faction-bar-track { height:6px; background:rgba(255,255,255,.06); border-radius:3px; overflow:hidden; position:relative; } .faction-bar-fill { height:100%; border-radius:3px; transition:width 1.2s; position:relative; } .faction-bar-fill::after { content:''; position:absolute; right:0; top:0; bottom:0; width:6px; border-radius:3px; filter:blur(3px); }
        .faction-sentinel .faction-bar-fill { background:linear-gradient(90deg, rgba(59,130,246,.6), var(--sentinel)); } .faction-sentinel .faction-bar-fill::after { background:var(--sentinel); }
        .faction-landsat .faction-bar-fill { background:linear-gradient(90deg, rgba(16,185,129,.6), var(--landsat)); } .faction-landsat .faction-bar-fill::after { background:var(--landsat); }
        .faction-modis .faction-bar-fill { background:linear-gradient(90deg, rgba(168,85,247,.6), var(--modis)); } .faction-modis .faction-bar-fill::after { background:var(--modis); }
        
        .telem-line { font-family:var(--font-mono); font-size:.62rem; color:var(--text2); padding:4px 0; border-bottom:1px solid rgba(255,255,255,.04); display:flex; justify-content:space-between; gap:8px; animation:telemSlide .4s ease; }
        @keyframes telemSlide { from{opacity:0;transform:translateX(6px)} to{opacity:1;transform:translateX(0)} } .telem-key { color:var(--text3); } .telem-val { color:var(--opt); font-weight:500; }
        
        .uplink-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
        .uplink-box { background: rgba(0, 240, 255, 0.03); border: 1px solid rgba(0, 240, 255, 0.1); border-radius: 8px; padding: 12px 10px; text-align: center; }
        .uplink-val { font-family: var(--font-orb); font-size: 1.1rem; color: var(--opt); font-weight: 700; margin-bottom: 6px; }
        .uplink-lbl { font-family: var(--font-mono); font-size: 0.55rem; color: var(--text3); letter-spacing: 1px; }
        
        #main { grid-area:main; position:relative; overflow:hidden; }
        .phase-view { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transform:scale(.96); pointer-events:none; transition:opacity .5s ease, transform .5s ease; }
        .phase-view.active { opacity:1; transform:scale(1); pointer-events:auto; }
        
        #phase-idle { background:radial-gradient(ellipse at center, rgba(0,240,255,.04) 0%, transparent 65%); } .idle-outer { text-align:center; position:relative; }
        .idle-label { font-family:var(--font-orb); font-size:.62rem; letter-spacing:5px; color:var(--text2); text-transform:uppercase; margin-bottom:18px; animation:blinkText 2.5s ease infinite; } @keyframes blinkText { 0%,100%{opacity:.5} 50%{opacity:1} }
        .qr-wrap { position:relative; display:inline-block; margin-bottom:24px; } .qr-corner { position:absolute; width:24px; height:24px; border-color:var(--nir); border-style:solid; }
        .qr-corner.tl { top:-4px; left:-4px; border-width:3px 0 0 3px; } .qr-corner.tr { top:-4px; right:-4px; border-width:3px 3px 0 0; } .qr-corner.bl { bottom:-4px; left:-4px; border-width:0 0 3px 3px; } .qr-corner.br { bottom:-4px; right:-4px; border-width:0 3px 3px 0; }
        .qr-box { width:220px; height:220px; background:linear-gradient(45deg, rgba(0,240,255,.08) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(0,240,255,.06), transparent 60%), #040c1e; border:1px solid rgba(0,240,255,.2); border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; position:relative; }
        .qr-box::after { content:''; position:absolute; left:0; right:0; height:3px; background:linear-gradient(90deg, transparent, var(--nir) 40%, var(--opt) 60%, transparent); box-shadow:0 0 12px var(--nir); animation:qrScan 2.4s ease-in-out infinite; } @keyframes qrScan { 0%{top:-3px} 50%{top:calc(100% + 3px)} 100%{top:-3px} }
        .qr-inner { width:100%; height:100%; padding:10px; display:flex; align-items:center; justify-content:center; }
        .qr-img { width:100%; height:100%; object-fit:contain; border-radius:4px; filter: drop-shadow(0 0 10px rgba(0,240,255,0.4)); }
        .idle-event-code { font-family:var(--font-orb); font-size:1.8rem; font-weight:900; color:var(--nir); letter-spacing:8px; text-shadow:0 0 30px rgba(0,240,255,.5); margin-bottom:12px; }
        .idle-url { font-family:var(--font-mono); font-size:.82rem; color:var(--opt); letter-spacing:2px; background:rgba(0,255,136,.05); border:1px solid rgba(0,255,136,.15); padding:8px 20px; border-radius:6px; animation:pulseUrl 3s ease infinite; } @keyframes pulseUrl { 0%,100%{box-shadow:0 0 0 rgba(0,255,136,0)} 50%{box-shadow:0 0 20px rgba(0,255,136,.15)} }
        .idle-bottom { margin-top:28px; display:flex; gap:28px; justify-content:center; flex-wrap:wrap; } .idle-stat { text-align:center; } .idle-stat-num { font-family:var(--font-orb); font-size:1.8rem; font-weight:900; color:var(--nir); display:block; line-height:1; } .idle-stat-lbl { font-size:.65rem; letter-spacing:2px; color:var(--text2); text-transform:uppercase; }

        #phase-question { padding:40px 60px; justify-content:center; }
        #countdown-chip { position:absolute; top:16px; right:16px; font-family:var(--font-orb); font-size:.65rem; letter-spacing:2px; color:var(--nir); background:rgba(0,240,255,.07); border:1px solid rgba(0,240,255,.2); border-radius:6px; padding:5px 12px; pointer-events:none; z-index:20; display:flex; align-items:center; gap:7px; }
        .question-header { width:100%; display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; } .q-number { font-family:var(--font-orb); font-size:.62rem; letter-spacing:3px; color:var(--text2); } .q-cat-tag { font-family:var(--font-mono); font-size:.68rem; padding:4px 12px; border-radius:4px; border:1px solid rgba(0,240,255,.25); color:var(--nir); background:rgba(0,240,255,.05); letter-spacing:1px; } .q-pts { font-family:var(--font-orb); font-size:.72rem; color:var(--gold); letter-spacing:1px; }
        .acq-window { width:100%; margin-bottom:20px; position:relative; } .acq-labels { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; } .acq-lbl-l { font-family:var(--font-mono); font-size:.6rem; color:var(--text2); letter-spacing:2px; } .acq-time-txt { font-family:var(--font-orb); font-size:1.1rem; font-weight:700; letter-spacing:2px; transition:color .3s; }
        .acq-track { width:100%; height:10px; background:rgba(255,255,255,.05); border-radius:3px; overflow:hidden; border:1px solid rgba(255,255,255,.06); position:relative; } .acq-fill { height:100%; border-radius:3px; background:linear-gradient(90deg, var(--nir), var(--opt)); transition:width .9s linear, background .5s; position:relative; } .acq-fill::after { content:''; position:absolute; right:0; top:0; bottom:0; width:30px; background:linear-gradient(90deg, transparent, rgba(255,255,255,.35)); } .acq-fill.warn { background:linear-gradient(90deg, var(--warn), #ff8800); } .acq-fill.crit { background:linear-gradient(90deg, #880000, var(--alert)); animation:critFlash .35s infinite alternate; } @keyframes critFlash { from{opacity:1} to{opacity:.35} }
        .acq-los { font-family:var(--font-mono); font-size:.6rem; color:var(--alert); letter-spacing:2px; animation:blinkText .5s infinite; }
        
        .sat-img-wrap { width:100%; max-height:280px; border-radius:10px; border:1px solid var(--border); overflow:hidden; position:relative; margin-bottom:20px; background:#040c1e; display:flex; justify-content:center; } .sat-img-wrap img { width:auto; height:280px; object-fit:contain; display:block; }
        .spectral-scanner { position:absolute; left:0; right:0; height:4px; background:linear-gradient(90deg, transparent, var(--nir) 20%, var(--opt) 50%, var(--nir) 80%, transparent); box-shadow:0 0 18px var(--nir), 0 0 40px rgba(0,240,255,.3); animation:specScan 2.8s ease-in-out infinite; pointer-events:none; z-index:10; } @keyframes specScan { 0%{top:0;opacity:.9} 48%{top:calc(100% - 4px);opacity:.9} 50%{opacity:.2} 100%{top:0;opacity:.9} }
        .band-overlay { position:absolute; inset:0; pointer-events:none; background:linear-gradient(180deg, rgba(0,240,255,.04) 0%, transparent 30%, transparent 70%, rgba(0,255,136,.04) 100%); z-index:5; }
        .corner-data { position:absolute; font-family:var(--font-mono); font-size:.6rem; color:rgba(0,240,255,.7); background:rgba(3,7,15,.85); padding:3px 7px; border-radius:3px; z-index:10; } .corner-data.tl { top:8px; left:8px; } .corner-data.tr { top:8px; right:8px; } .corner-data.bl { bottom:8px; left:8px; } .corner-data.br { bottom:8px; right:8px; }
        
        .q-text { font-family:var(--font-exo); font-size:3.5rem; font-weight:800; color:#ffffff; line-height:1.2; text-align:center; max-width:1100px; margin:40px auto; text-shadow:0 0 50px rgba(0,240,255,0.4), 0 0 20px rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 2px; }
        .scramble-hint { font-family: var(--font-orb); font-size: 0.8rem; color: var(--nir); border: 1px solid var(--nir); padding: 4px 12px; border-radius: 4px; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
        .options-bar { display:grid; grid-template-columns:1fr 1fr; gap:20px; width:100%; max-width:900px; margin:0 auto; } .opt-pill { display:flex; align-items:center; gap:16px; padding:18px 24px; border-radius:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); font-size:1.2rem; font-weight:600; color:var(--text); } .opt-key { font-family:var(--font-orb); font-size:0.9rem; width:32px; height:32px; border-radius:8px; background:rgba(0,240,255,.08); border:1px solid rgba(0,240,255,.2); color:var(--nir); display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        #phase-results { padding:24px 32px; justify-content:flex-start; } .results-header { width:100%; margin-bottom:22px; } .results-q-echo { font-size:1.05rem; font-weight:500; color:var(--text3); text-align:center; max-width:680px; margin:0 auto 10px; line-height:1.5; } .results-verdict { text-align:center; font-family:var(--font-orb); font-size:1.2rem; padding:10px 24px; border-radius:8px; display:inline-block; margin:0 auto; position:relative; left:50%; transform:translateX(-50%); color:var(--opt); background:rgba(0,255,136,.07); border:1px solid rgba(0,255,136,.25); }
        .vote-chart { display:grid; grid-template-columns:1fr 1fr; gap:14px; width:100%; max-width:840px; margin:0 auto; } .vote-bar-wrap { position:relative; } .vote-bar-label { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; } .vote-bar-key { font-family:var(--font-orb); font-size:.72rem; color:var(--text2); } .vote-bar-pct { font-family:var(--font-orb); font-size:.82rem; } .vote-bar-track { height:48px; background:rgba(255,255,255,.04); border-radius:7px; overflow:hidden; position:relative; border:1px solid rgba(255,255,255,.06); } .vote-bar-fill { height:100%; border-radius:7px; display:flex; align-items:center; padding-left:12px; font-family:var(--font-exo); font-size:.85rem; font-weight:600; color:#fff; transition:width 1.2s cubic-bezier(.23,1,.32,1); position:relative; overflow:hidden; } .vote-bar-fill::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg, transparent 70%, rgba(255,255,255,.12)); } .vote-bar-fill.correct { outline:2px solid var(--opt); box-shadow:0 0 18px rgba(0,255,136,.3); } .expected-sig { position:absolute; left:0; right:0; border-top:2px dashed var(--opt); opacity:.7; pointer-events:none; top:50%; transform:translateY(-1px); } .expected-sig-label { position:absolute; right:6px; top:-18px; font-family:var(--font-mono); font-size:.58rem; color:var(--opt); background:rgba(3,7,15,.9); padding:2px 5px; border-radius:3px; }
        .accuracy-wrap { text-align:center; margin-top:18px; } .accuracy-num { font-family:var(--font-orb); font-size:3.5rem; font-weight:900; display:block; line-height:1; background:linear-gradient(135deg, var(--nir), var(--opt)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; } .accuracy-sub { font-size:.72rem; letter-spacing:3px; color:var(--text2); margin-top:4px; }

        #phase-levelend { padding:24px 32px; } .levelend-wrap { text-align:center; max-width:680px; margin:0 auto; } .levelend-badge { font-family:var(--font-orb); font-size:.62rem; letter-spacing:5px; color:var(--text2); margin-bottom:12px; display:block; text-transform:uppercase; } .levelend-title { font-family:var(--font-orb); font-size:2.4rem; font-weight:900; background:linear-gradient(135deg, var(--nir) 0%, var(--opt) 60%, var(--thm) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; line-height:1.1; margin-bottom:8px; animation:titleReveal 1s ease forwards; } @keyframes titleReveal { from{letter-spacing:20px;opacity:0} to{letter-spacing:.5px;opacity:1} } .levelend-acc-row { display:flex; justify-content:center; gap:40px; margin:24px 0 28px; } .le-stat { text-align:center; } .le-num { font-family:var(--font-orb); font-size:2rem; font-weight:900; display:block; color:var(--nir); } .le-lbl { font-size:.62rem; letter-spacing:2px; color:var(--text2); text-transform:uppercase; }
        .boost-card { background:linear-gradient(135deg, rgba(0,240,255,.08), rgba(0,255,136,.06)); border:1px solid rgba(0,240,255,.3); border-radius:14px; padding:20px 24px; margin-bottom:20px; position:relative; overflow:hidden; } .boost-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg, var(--nir), var(--opt)); animation:scanHeader 2.5s linear infinite; } .boost-label { font-size:.62rem; letter-spacing:3px; color:var(--text2); text-transform:uppercase; margin-bottom:8px; } .boost-row { display:flex; align-items:center; gap:14px; } .boost-emo { font-size:2.2rem; animation:rocketFloat .8s ease-in-out infinite alternate; } @keyframes rocketFloat { from{transform:translateY(0)} to{transform:translateY(-6px)} } .boost-name { font-family:var(--font-orb); font-size:1.15rem; color:var(--nir); font-weight:700; text-transform:uppercase; } .boost-delta { font-family:var(--font-orb); font-size:.85rem; color:var(--opt); margin-top:2px; }
        .podium { display:flex; align-items:flex-end; justify-content:center; gap:10px; height:120px; margin-top:20px; } .podium-col { display:flex; flex-direction:column; align-items:center; gap:4px; } .podium-name { font-size:.72rem; font-weight:600; text-align:center; max-width:80px; line-height:1.2; text-transform:uppercase; } .podium-score { font-family:var(--font-orb); font-size:.68rem; color:var(--opt); } .podium-bar { width:70px; border-radius:5px 5px 0 0; display:flex; align-items:flex-start; justify-content:center; padding-top:8px; transition:height 1s ease; } .podium-rank { font-family:var(--font-orb); font-size:1.1rem; font-weight:900; } .podium-bar.p1 { background:linear-gradient(180deg, rgba(0,240,255,.25), rgba(0,240,255,.1)); border:1px solid rgba(0,240,255,.3); height:100%; } .podium-bar.p2 { background:rgba(200,200,200,.1); border:1px solid rgba(200,200,200,.2); height:76%; } .podium-bar.p3 { background:rgba(180,120,0,.1); border:1px solid rgba(180,120,0,.2); height:56%; }

        #ticker { grid-area:ticker; background:rgba(0,240,255,.04); border-top:1px solid var(--border); display:flex; align-items:center; overflow:hidden; position:relative; } .ticker-label { font-family:var(--font-mono); font-size:.6rem; letter-spacing:2px; color:var(--nir); padding:0 14px; flex-shrink:0; border-right:1px solid var(--border); background:rgba(0,240,255,.06); height:100%; display:flex; align-items:center; z-index:2; } .ticker-track { flex:1; overflow:hidden; position:relative; height:100%; } .ticker-inner { display:flex; align-items:center; height:100%; white-space:nowrap; animation:tickerScroll 48s linear infinite; font-family:var(--font-mono); font-size:.65rem; color:var(--text3); letter-spacing:1px; } @keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} } .tick-item { margin-right:48px; } .tick-key { color:var(--text2); } .tick-val { color:var(--opt); margin-left:4px; } .tick-sep { color:rgba(0,240,255,.25); margin:0 24px; }
        .uplink-emoji { position:fixed; z-index:7000; pointer-events:none; font-size:2.2rem; line-height:1; animation:uplinkFloat 3.5s ease-in forwards; } @keyframes uplinkFloat { 0%{transform:translateY(0) scale(.7); opacity:0;} 8%{opacity:1; transform:translateY(-20px) scale(1.1);} 85%{opacity:.9;} 100%{transform:translateY(-85vh) scale(.8); opacity:0;} }

        .leaderboard-overlay { position:fixed; inset:0; z-index:10000; background:rgba(3,7,15,0.98); backdrop-filter:blur(20px); display:flex; flex-direction:column; align-items:center; padding:60px 40px; animation:lbExpand .5s cubic-bezier(.16,1,.3,1); }
        @keyframes lbExpand { from{opacity:0;transform:scale(1.1)} to{opacity:1;transform:scale(1)} }
        .lb-expanded-title { font-family:var(--font-orb); font-size:2.5rem; color:var(--nir); margin-bottom:40px; letter-spacing:8px; text-transform:uppercase; text-shadow:0 0 30px rgba(0,240,255,0.4); }
        .lb-expanded-list { width:100%; max-width:1000px; }
        .lb-expanded-row { display:flex; align-items:center; gap:30px; padding:20px 40px; background:rgba(255,255,255,0.03); border:1px solid rgba(0,240,255,0.1); border-radius:15px; margin-bottom:15px; }
        .lb-expanded-rank { font-family:var(--font-orb); font-size:2.2rem; width:60px; color:var(--text2); }
        .lb-expanded-name-block { flex:1; }
        .lb-expanded-name { font-size:1.8rem; font-weight:700; color:#fff; }
        .lb-expanded-usn { font-size:1rem; color:var(--text3); font-family:var(--font-mono); }
        .lb-expanded-score { font-family:var(--font-orb); font-size:2.2rem; color:var(--opt); font-weight:900; }
        .lb-close-hint { margin-top:40px; font-family:var(--font-mono); font-size:0.9rem; color:var(--text3); opacity:0.6; }
        .sb-expand-btn { cursor:pointer; padding:2px 8px; font-size:0.6rem; border:1px solid var(--border); border-radius:4px; margin-left:auto; transition:all 0.2s; }
        .sb-expand-btn:hover { background:rgba(0,240,255,0.1); border-color:var(--nir); color:var(--nir); }

        /* Level Intro Styles */
        .level-intro-view { text-align: center; animation: levelPop 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .level-num-huge { font-family: var(--font-orb); font-size: 8rem; font-weight: 900; background: linear-gradient(135deg, var(--nir), var(--opt)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 10px; }
        .level-title-huge { font-family: var(--font-orb); font-size: 2rem; color: var(--text); letter-spacing: 12px; text-transform: uppercase; opacity: 0.8; }

        /* Top 10 Leaderboard Styles */
        .top10-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; max-width: 1000px; margin-top: 30px; }
        .top10-item { display: flex; align-items: center; gap: 15px; padding: 12px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.1); border-radius: 10px; }
        .top10-rank { font-family: var(--font-orb); font-size: 1.2rem; width: 30px; color: var(--nir); }
        .top10-name-block { flex: 1; min-width: 0; }
        .top10-name { font-weight: 700; font-size: 1rem; color: #fff; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .top10-usn { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text3); }
        .top10-score { font-family: var(--font-orb); font-size: 1.1rem; color: var(--opt); flex-shrink: 0; }

        /* Final Reveal Button Overlay */
        .finale-suspense { text-align: center; padding: 40px; }
        .reveal-btn-temp { background: linear-gradient(135deg, var(--gold), #ffaa00); color: #000; border: none; padding: 15px 40px; font-family: var(--font-orb); font-weight: 900; border-radius: 50px; cursor: pointer; font-size: 1.2rem; box-shadow: 0 0 30px rgba(255,170,0,0.4); margin-top: 40px; transition: transform 0.2s; }
        .reveal-btn-temp:hover { transform: scale(1.05); }
      `}</style>

      <StarfieldCanvas />


      {emojis.map(e => (
        <div key={e.id} className="uplink-emoji" style={{ left: e.left, bottom: '60px', animationDelay: `${e.delay}s` }}>{e.emoji}</div>
      ))}

      {isLeaderboardExpanded && (
        <div className="leaderboard-overlay" onClick={() => setIsLeaderboardExpanded(false)}>
          <div className="lb-expanded-title">Live Mission Standings</div>
          <div className="lb-expanded-list">
            {leaderboard.slice(0, 5).map((p, i) => {
              const fCol = p.faction === 'team_sentinel' ? 'var(--sentinel)' : p.faction === 'team_landsat' ? 'var(--landsat)' : 'var(--modis)';
              return (
                <div key={p.usn} className="lb-expanded-row" style={{ borderColor: i === 0 ? 'rgba(0,240,255,0.4)' : '' }}>
                  <div className="lb-expanded-rank">{i < 3 ? medals[i] : i + 1}</div>
                  <div className="lb-expanded-name-block">
                    <div className="lb-expanded-name" style={{ color: i === 0 ? 'var(--nir)' : '' }}>{p.name}</div>
                    <div className="lb-expanded-usn">{p.usn} · <span style={{ color: fCol }}>{p.faction?.replace('team_', '').toUpperCase() || 'UNAFFILIATED'}</span></div>
                  </div>
                  <div className="lb-expanded-score">{p.totalScore.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
          <div className="lb-close-hint">CLICK ANYWHERE TO MINIMIZE</div>
        </div>
      )}

      <div className="prj-shell">
        <header id="header">
          <div className="hdr-left">
            <div className="hdr-logo">GEO<span>-COMMAND</span></div>
            <div className="hdr-divider" />
            <div className="hdr-status">
              <div className="pulse-dot" />
              <span>UPLINK: ACTIVE</span>&nbsp;·&nbsp;<span>{orbitPass}</span>
            </div>
          </div>
          <div className="hdr-center">
            <div className="hdr-mission">IEEE GRSS · FIELD ANALYST MISSION</div>
            <div className="hdr-phase-lbl">{phaseLabel}</div>
          </div>
          <div className="hdr-right">
            <div className="stat-block">
              <div className="stat-lbl">Active Sensors</div>
              <div className="stat-val nir">{adminStats?.connectedCount || 0}</div>
            </div>
            <div className="stat-block">
              <div className="stat-lbl">Uptime</div>
              <div className="utc-clock">{utcTime}</div>
            </div>
          </div>
        </header>

        <main id="main" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.85, mixBlendMode: 'screen' }}>
            <RadarCanvas />
          </div>
          <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
            {/* IDLE */}
            <div className={`phase-view ${uiPhase === 'idle' ? 'active' : ''}`} id="phase-idle" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {(currentLevel || 0) === 0 ? (
              <div className="idle-outer">
                <div className="idle-label">🛰 SATELLITE TERMINAL — ANALYST UPLINK</div>
                <div className="qr-wrap">
                  <div className="qr-corner tl" /><div className="qr-corner tr" /><div className="qr-corner bl" /><div className="qr-corner br" />
                  <div className="qr-box">
                    <div className="qr-inner">
                      <img src="/qr_code.png" alt="Mission QR Code" className="qr-img" />
                    </div>
                  </div>
                </div>
                <div className="idle-event-code">GRSS·2026</div>
                <div className="idle-bottom">
                  <div className="idle-stat">
                    <span className="idle-stat-num">{adminStats?.connectedCount || 0}</span>
                    <span className="idle-stat-lbl">Analysts Joined</span>
                  </div>
                  <div className="idle-stat">
                    <span className="idle-stat-num" style={{ color: 'var(--opt)' }}>{adminStats?.totalPlayers || 0}</span>
                    <span className="idle-stat-lbl">Total Registered</span>
                  </div>
                  <div className="idle-stat">
                    <span className="idle-stat-num" style={{ color: 'var(--gold)' }}>{leaderboard?.length || 0}</span>
                    <span className="idle-stat-lbl">On Leaderboard</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="level-intro-view">
                <div className="level-num-huge">LEVEL {currentLevel}</div>
                <div className="level-title-huge">{LEVEL_TITLES[currentLevel] || 'INCOMING DATA STREAM'}</div>
              </div>
            )}
          </div>

          {/* LEVEL INTRO (Explicit Phase) */}
          <div className={`phase-view ${uiPhase === 'level_intro' ? 'active' : ''}`} id="phase-intro">
            <div className="level-intro-view">
              <div className="level-num-huge">LEVEL {currentLevel}</div>
              <div className="level-title-huge">{LEVEL_TITLES[currentLevel] || 'MISSION START'}</div>
            </div>
          </div>

          {/* QUESTION */}
          <div className={`phase-view ${uiPhase === 'question' ? 'active' : ''}`} id="phase-question">
            <div id="countdown-chip"><span>ACQ WINDOW</span><span>{timeLeft}s</span></div>
            <div className="question-header">
              <span className="q-number">MISSION {currentLevel || 1}</span>
              <span className="q-cat-tag">{currentQuestion?.type?.replace('_', ' ')?.toUpperCase() || 'REMOTE SENSING'}</span>
              <span className="q-pts">+ {currentQuestion?.points || 100} pts</span>
            </div>
            <div className="acq-window">
              <div className="acq-labels">
                <span className="acq-lbl-l">ACQUISITION WINDOW ▶</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {timeLeft <= 5 && <span className="acq-los show">⚠ LOS IMMINENT</span>}
                  <span className="acq-time-txt" style={{ color: timePct > 40 ? 'var(--opt)' : timePct > 15 ? 'var(--warn)' : 'var(--alert)' }}>{timeLeft}</span>
                </div>
              </div>
              <div className="acq-track">
                <div className={`acq-fill ${timePct <= 15 ? 'crit' : timePct <= 40 ? 'warn' : ''}`} style={{ width: `${timePct}%` }} />
              </div>
            </div>

            {currentQuestion?.imageUrl && (
              <div className="sat-img-wrap">
                <img src={currentQuestion.imageUrl} alt="Satellite imagery" />
                <div className="spectral-scanner" /><div className="band-overlay" />
                <div className="corner-data tl">LAT 28.6°N · LON 77.2°E</div>
                <div className="corner-data tr">NIR · B08 · 10m</div>
                <div className="corner-data bl">SENTINEL-2A</div>
                <div className="corner-data br">2025-01-15T09:22Z</div>
              </div>
            )}
            {currentQuestion?.scrambled && <div style={{ textAlign: 'center' }}><span className="scramble-hint">SCRAMBLE</span></div>}
            <div className="q-text">{currentQuestion?.question || currentQuestion?.scrambled || 'Loading question data from orbital uplink...'}</div>

            {currentQuestion?.options && (
              <div className="options-bar">
                {currentQuestion.options.map((o: string, i: number) => (
                  <div key={i} className="opt-pill"><span className="opt-key">{'ABCD'[i]}</span><span>{o}</span></div>
                ))}
              </div>
            )}
          </div>

          {/* RESULTS */}
          <div className={`phase-view ${uiPhase === 'results' ? 'active' : ''}`} id="phase-results">
            <div className="results-header">
              <div className="results-q-echo">{currentQuestion?.question}</div>
              {reviewData?.correctAnswer && (
                <div className="results-verdict">✅ SIGNAL CONFIRMED — CORRECT ANSWER: {reviewData.correctAnswer}</div>
              )}
            </div>
            <div className="vote-chart">
              {Object.entries(adminLiveStats?.distribution || {}).map(([ans, count], i) => {
                const isCorrect = reviewData?.correctAnswer === ans;
                const distValues = Object.values(adminLiveStats?.distribution || {}) as number[];
                const total = Math.max(1, distValues.reduce((a, b) => a + b, 0));
                const pct = Math.round(((count as number) / total) * 100);
                const bgColors = ['rgba(0,200,255,.7)', 'rgba(0,200,80,.7)', 'rgba(180,0,255,.7)', 'rgba(255,150,0,.7)'];
                return (
                  <div key={ans} className="vote-bar-wrap">
                    <div className="vote-bar-label">
                      <span className="vote-bar-key" style={{ color: isCorrect ? 'var(--opt)' : 'var(--text2)' }}>
                        {isCorrect ? '✓ ' : ''}{ans}
                      </span>
                      <span className="vote-bar-pct" style={{ color: isCorrect ? 'var(--opt)' : 'var(--text2)' }}>{pct}%</span>
                    </div>
                    <div className="vote-bar-track">
                      <div className={`vote-bar-fill ${isCorrect ? 'correct' : ''}`} style={{ width: `${Math.max(pct, 3)}%`, background: `linear-gradient(90deg, ${bgColors[i % 4]}, ${bgColors[i % 4].replace('.7', '.9')})` }}>
                        {count as number} analysts
                      </div>
                      {isCorrect && <div className="expected-sig"><div className="expected-sig-label">EXPECTED SIGNATURE</div></div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="accuracy-wrap">
              <span className="accuracy-num">
                <AnimatedNumber value={reviewData?.correctAnswer ? Math.round(((adminLiveStats?.distribution?.[reviewData.correctAnswer] as number || 0) / Math.max(1, adminStats?.connectedCount || 1)) * 100) : 0} />%
              </span>
              <div className="accuracy-sub">FIELD ACCURACY · TELEMETRY CONFIRMED</div>
            </div>
          </div>

          {/* AUCTION */}
          <div className={`phase-view ${uiPhase === 'auction' ? 'active' : ''}`} id="phase-auction">
            <div className="level-num-huge" style={{ fontSize: '4rem' }}>LEVEL 5 · PHASE A</div>
            <div className="level-title-huge">CONSTELLATION PROCUREMENT</div>
            <div className="q-text" style={{ fontSize: '2rem' }}>ANALYSTS ARE ACQUIRING MISSION TOOLS.<br />PREPARING FOR ANOMALY RESPONSE...</div>
            <div className="idle-stat">
              <span className="idle-stat-num">{timeLeft}s</span>
              <span className="idle-stat-lbl">UPLINK CLOSING</span>
            </div>
          </div>

          {/* DISASTER */}
          <div className={`phase-view ${uiPhase === 'disaster' ? 'active' : ''}`} id="phase-disaster">
            <div className="level-num-huge" style={{ fontSize: '4rem', color: 'var(--alert)' }}>LEVEL 5 · PHASE B</div>
            <div className="level-title-huge" style={{ color: 'var(--warn)' }}>ANOMALY RECONNAISSANCE</div>
            <div className="q-text" style={{ fontSize: '2.4rem', color: '#fff' }}>{adminStats?.phase === 'disaster_active' ? 'MISSION CRITICAL: ANALYSTS DEPLOYING SENSORS' : 'ANALYZING FIELD DATA...'}</div>
            <div className="idle-stat">
              <span className="idle-stat-num" style={{ color: 'var(--warn)' }}>{adminStats?.answeredCount || 0}</span>
              <span className="idle-stat-lbl">Tools Deployed</span>
            </div>
          </div>

          {/* ANOMALY */}
          <div className={`phase-view ${uiPhase === 'anomaly' ? 'active' : ''}`} id="phase-anomaly" style={{ background: 'rgba(255,0,0,0.05)' }}>
            <div className="level-num-huge" style={{ color: 'var(--alert)', animation: 'blinkText 0.5s infinite' }}>⚠️ BREACH</div>
            <div className="level-title-huge" style={{ color: 'var(--alert)' }}>SYSTEM COMPROMISED</div>
            <div className="q-text" style={{ fontSize: '2rem', color: 'var(--alert)' }}>UNAUTHORIZED DATA ACCESS DETECTED.<br />ANALYSTS ARE PATCHING FIREWALLS...</div>
          </div>

          {/* LEVEL END */}
          <div className={`phase-view ${uiPhase === 'levelend' ? 'active' : ''}`} id="phase-levelend">
            <div className="levelend-wrap">
              <span className="levelend-badge">MISSION COMPLETE — LEVEL <span>{currentLevel || 1}</span></span>
              <div className="levelend-title">TRAINING MISSION<br />DEBRIEF</div>
              <div className="levelend-acc-row">
                <div className="le-stat"><span className="le-num" style={{ color: 'var(--opt)' }}><AnimatedNumber value={levelCompleteData?.levelStats?.avgAccuracy || 0} />%</span><span className="le-lbl">Global Accuracy</span></div>
                <div className="le-stat"><span className="le-num" style={{ color: 'var(--nir)' }}><AnimatedNumber value={adminStats?.connectedCount || 0} /></span><span className="le-lbl">Analysts Scored</span></div>
                <div className="le-stat"><span className="le-num" style={{ color: 'var(--gold)' }}><AnimatedNumber value={leaderboard?.[0]?.totalScore || 0} /></span><span className="le-lbl">Top Score</span></div>
              </div>

              {riser && (
                <div className="boost-card">
                  <div className="boost-label">⚡ ORBITAL BOOST — BIGGEST RISER</div>
                  <div className="boost-row">
                    <span className="boost-emo">🛰️</span>
                    <div>
                      <div className="boost-name">{riser.name}</div>
                      <div className="boost-delta">▲ JUMPED {riser.delta} POSITIONS THIS ROUND</div>
                    </div>
                  </div>
                </div>
              )}

              {currentLevel < 5 ? (
                <div className="top10-grid">
                  {leaderboard.slice(0, 10).map((p, i) => (
                    <div key={p.usn} className="top10-item" style={{ borderColor: i < 3 ? 'rgba(0,240,255,0.3)' : '' }}>
                      <span className="top10-rank">{i < 3 ? medals[i] : i + 1}</span>
                      <div className="top10-name-block">
                        <span className="top10-name" style={{ color: i === 0 ? 'var(--nir)' : '' }}>{p.name}</span>
                        <span className="top10-usn">{p.usn}</span>
                      </div>
                      <span className="top10-score">{p.totalScore.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="finale-suspense">
                  {!showFinalResults ? (
                    <>
                      <div className="level-title-huge" style={{ color: 'var(--gold)', opacity: 1 }}>FINAL CALCULATIONS IN PROGRESS</div>
                      <div className="idle-label" style={{ marginTop: 20 }}>🛰 SECURING SIGNAL... AWAITING COMMAND</div>
                      <button className="reveal-btn-temp" onClick={() => setShowFinalResults(true)}>SHOW FINAL RESULTS</button>
                    </>
                  ) : (
                    <>
                      <div className="level-title-huge" style={{ color: 'var(--nir)', opacity: 1, marginBottom: 40 }}>MISSION CHAMPIONS</div>
                      <div className="podium" style={{ height: 240, transform: 'scale(1.4)' }}>
                        {[leaderboard[1], leaderboard[0], leaderboard[2], leaderboard[3], leaderboard[4]].slice(0, 5).map((p, i) => {
                          if (!p) return null;
                          const order = [1, 0, 2, 3, 4];
                          const realIdx = leaderboard.indexOf(p);
                          return (
                            <div key={p.usn} className="podium-col">
                              <div className="podium-name" style={{ fontSize: '0.55rem' }}>
                                {p.name.split(' ')[0]}
                                <div style={{ opacity: 0.6, fontSize: '0.45rem' }}>{p.usn}</div>
                              </div>
                              <div className={`podium-bar p${realIdx + 1}`} style={{ height: `${100 - realIdx * 15}%`, width: 60 }}>
                                <div className="podium-rank">{medals[realIdx] || realIdx + 1}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        </main>

        <aside id="sidebar">
          <div className="sb-section" onClick={() => setIsLeaderboardExpanded(true)} style={{ cursor: 'pointer' }}>
            <div className="sb-title">
              Live Standings · Top 5
              <div className="sb-expand-btn">⤢ EXPAND</div>
            </div>
            <div>
              {leaderboard.slice(0, 5).map((p, i) => {
                const dir = (p as any).delta > 0 ? 'up' : (p as any).delta < 0 ? 'down' : 'same';
                const fCol = p.faction === 'team_sentinel' ? 'var(--sentinel)' : p.faction === 'team_landsat' ? 'var(--landsat)' : 'var(--modis)';
                return (
                  <div key={p.usn} className={`lb-row ${i < 3 ? `rank${i + 1}` : ''}`}>
                    <div className="lb-rank">{i < 3 ? medals[i] : i + 1}</div>
                    <div className="lb-name-block">
                      <div className="lb-name" style={{ color: i === 0 ? 'var(--nir)' : 'var(--text)' }}>{p.name}</div>
                      <div className="lb-usn">{p.usn} · <span style={{ color: fCol }}>{p.faction?.replace('team_', '').toUpperCase() || 'UNAFFILIATED'}</span></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      <div className="lb-score">{p.totalScore.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sb-section">
            <div className="sb-title">Constellation Power</div>
            <div>
              {FACTIONS.map(f => {
                const s = factionScores[f.id] || 0;
                const scoreValues = Object.values(factionScores) as number[];
                const max = Math.max(...scoreValues, 1);
                const pct = (s / max) * 100;
                const cls = f.id.replace('team_', 'faction-');
                return (
                  <div key={f.id} className={`faction-row ${cls}`}>
                    <div className="faction-head"><span className="faction-name" style={{ color: f.color }}>{f.name}</span><span className="faction-score" style={{ color: f.color }}>{s.toLocaleString()}</span></div>
                    <div className="faction-bar-track"><div className="faction-bar-fill" style={{ width: `${Math.max(pct, 5)}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sb-section">
            <div className="sb-title">Orbital Telemetry</div>
            <div>
              {[0, 1, 2, 3, 4].map(i => {
                const [k, v] = TELEM_LIVE[(telemIdx + i) % TELEM_LIVE.length];
                return <div key={i} className="telem-line"><span className="telem-key">{k}</span><span className="telem-val">{v}</span></div>;
              })}
            </div>
          </div>

          <div className="sb-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderBottom: 'none' }}>
            <div className="sb-title">Geospatial Link</div>
            <div className="uplink-grid">
              <div className="uplink-box">
                <div className="uplink-val">{xFreq.toFixed(2)} GHz</div>
                <div className="uplink-lbl">X-BAND FREQ</div>
              </div>
              <div className="uplink-box">
                <div className="uplink-val" style={{ color: 'var(--opt)' }}><AnimatedNumber value={Math.round(dataIntegrity)} />%</div>
                <div className="uplink-lbl">DATA INTEGRITY</div>
              </div>
              <div className="uplink-box">
                <div className="uplink-val">NOMINAL</div>
                <div className="uplink-lbl">THERMAL SENSORS</div>
              </div>
              <div className="uplink-box">
                <div className="uplink-val" style={{ color: 'var(--nir)' }}>LOCKED</div>
                <div className="uplink-lbl">ATTITUDE CTRL</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', position: 'relative' }}>
              <canvas ref={orbitRef} width={288} height={180} />
            </div>
          </div>
        </aside>

        <footer id="ticker">
          <div className="ticker-label">📡 TELEMETRY</div>
          <div className="ticker-track">
            <div className="ticker-inner">
              {[...TICKER_DATA, ...TICKER_DATA].map(([k, v], i) => (
                <Fragment key={i}>
                  <span className="tick-item"><span className="tick-key">{k}:</span><span className="tick-val"> {v}</span></span>
                  <span className="tick-sep">◆</span>
                </Fragment>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
