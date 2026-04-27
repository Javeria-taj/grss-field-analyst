'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import { SFX } from '@/lib/sfx';

export default function ProjectorPage() {
  const { 
    phase, currentLevel, currentQuestion, timerEndTime, timerTotal, 
    leaderboard, adminLiveStats, adminStats, factionScores,
    levelCompleteData, auctionTools, auctionPrices, auctionMultiplier,
    disasterInfo, missionCommentary,
    init, destroy, connected
  } = useGameSyncStore();

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    init();
    return () => {
      destroy();
      SFX.stopMusic();
    };
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
    }, 100);
    return () => clearInterval(timer);
  }, [timerEndTime]);

  const leadingFaction = Object.entries(factionScores).sort((a, b) => b[1] - a[1])[0]?.[0];
  const factionMeta: Record<string, any> = {
    'team_sentinel': { name: 'SENTINEL', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.2)' },
    'team_landsat': { name: 'LANDSAT', color: '#10b981', glow: 'rgba(16, 185, 129, 0.2)' },
    'team_modis': { name: 'MODIS', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.2)' }
  };

  const JOIN_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
  const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(JOIN_URL)}&bgcolor=03070f&color=60a5fa`;

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#03070f] flex items-center justify-center font-orbitron">
        <StarfieldCanvas />
        <div className="z-10 text-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-b-4 border-blue-500 rounded-full mx-auto mb-8 shadow-[0_0_30px_rgba(59,130,246,0.5)]" 
          />
          <h1 className="text-3xl text-blue-400 font-bold tracking-[0.5em] animate-pulse">ESTABLISHING SATELLITE LINK</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000] text-white font-orbitron overflow-hidden relative">
      <StarfieldCanvas />
      
      {/* Background Cinematic Glows */}
      <AnimatePresence>
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: phase === 'question_active' 
              ? 'radial-gradient(circle at 50% 50%, #1e3a8a 0%, transparent 70%)' 
              : phase === 'question_review'
              ? 'radial-gradient(circle at 50% 50%, #1e40af 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, #111827 0%, transparent 70%)'
          }}
        />
      </AnimatePresence>

      {/* Floating Reactions Layer */}
      <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {adminLiveStats?.reactions?.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: '110vh', x: `${Math.random() * 80 + 10}vw`, opacity: 0, scale: 0.5, rotate: Math.random() * 40 - 20 }}
              animate={{ 
                y: '-20vh', 
                opacity: [0, 1, 1, 0], 
                scale: [0.5, 2.5, 2.5, 2],
                rotate: Math.random() * 90 - 45
              }}
              transition={{ duration: 5, ease: "easeOut" }}
              className="absolute text-7xl drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Dynamic Header */}
        <header className="h-24 border-b border-white/10 flex items-center justify-between px-16 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-8">
            <motion.div 
              animate={{ boxShadow: ['0 0 20px rgba(59,130,246,0.3)', '0 0 40px rgba(59,130,246,0.6)', '0 0 20px rgba(59,130,246,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-6 py-2 border-2 border-blue-500 rounded-lg"
            >
              <span className="text-3xl font-black italic text-blue-400">MISSION CONTROL</span>
            </motion.div>
            <div className="h-10 w-[2px] bg-white/20" />
            <div className="text-xl tracking-[0.3em] font-bold text-white/60">
              PHASE: <span className="text-white">{phase.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="text-right">
              <div className="text-5xl font-black text-blue-400 leading-none">
                {adminStats?.connectedCount || 0}
              </div>
              <div className="text-[10px] tracking-[0.4em] text-white/40 mt-1 uppercase">Analysts Online</div>
            </div>
            <div className="h-12 w-[2px] bg-white/20" />
            <motion.div 
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" 
            />
          </div>
        </header>

        {/* Main Stage */}
        <main className="flex-1 flex overflow-hidden">
          {/* Central Visualization */}
          <div className="flex-[3] relative flex flex-col items-center justify-center border-r border-white/10 p-12">
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative group mb-12">
                    <div className="absolute -inset-8 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.02, 1],
                        rotate: [0, 1, 0, -1, 0]
                      }}
                      transition={{ duration: 6, repeat: Infinity }}
                    >
                      <img src={QR_URL} alt="Join QR" className="w-[450px] h-[450px] relative rounded-3xl border-4 border-blue-500/30 p-4 bg-white/10 shadow-2xl backdrop-blur-md" />
                    </motion.div>
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-2 border-blue-400/20 rounded-3xl" />
                  </div>
                  <h2 className="text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-400">SCAN TO ENLIST</h2>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-3xl text-white/30 tracking-[0.5em] font-light italic mb-6">{JOIN_URL}</p>
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-blue-500/10 border-2 border-blue-500/30 px-12 py-6 rounded-3xl backdrop-blur-xl"
                    >
                      <div className="text-7xl font-black text-blue-400 tabular-nums">
                        {adminStats?.connectedCount || 0}
                      </div>
                      <div className="text-sm tracking-[0.5em] text-white/40 uppercase font-bold">Analysts Connected</div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {phase === 'question_active' && (
                <motion.div 
                  key="active"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-full flex justify-between items-center mb-16">
                    <div className="bg-white/5 border border-white/10 px-10 py-4 rounded-full backdrop-blur-md">
                      <span className="text-2xl font-bold tracking-[0.3em] text-blue-400 uppercase">MISSION {currentLevel}</span>
                    </div>
                    <div className="relative group">
                      <div className={`absolute -inset-6 blur-2xl rounded-full opacity-30 transition-colors ${timeLeft <= 5 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`} />
                      <div className={`text-[12rem] font-black leading-none tabular-nums relative ${timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}>
                        {timeLeft}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full flex flex-col items-center justify-center">
                    {currentQuestion?.imageUrl && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, rotateX: 45 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        className="mb-12 relative"
                      >
                        <div className="absolute -inset-4 bg-blue-500/20 blur-2xl opacity-50" />
                        <img 
                          src={currentQuestion.imageUrl} 
                          alt="Visual Intel" 
                          className="relative max-h-[450px] w-auto rounded-3xl border-2 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        />
                      </motion.div>
                    )}
                    <motion.h2 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-7xl font-bold leading-tight max-w-6xl tracking-tight text-center italic drop-shadow-2xl"
                    >
                      "{currentQuestion?.question || currentQuestion?.scrambled || 'PENDING INTEL...'}"
                    </motion.h2>
                  </div>

                  {/* High-End Progress Bar */}
                  <div className="w-full h-3 bg-white/5 rounded-full mt-20 overflow-hidden border border-white/10 p-[2px]">
                    <motion.div 
                      className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-gradient-to-r from-red-600 to-orange-400' : 'bg-gradient-to-r from-blue-600 via-blue-400 to-white'}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / timerTotal) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                      style={{ boxShadow: `0 0 20px ${timeLeft <= 5 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'}` }}
                    />
                  </div>
                </motion.div>
              )}

              {phase === 'question_review' && (
                <motion.div 
                  key="review"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center"
                >
                  <h2 className="text-5xl font-black mb-16 tracking-[0.5em] text-blue-400 uppercase">INTEL DISTRIBUTION</h2>
                  <div className="w-full h-[600px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(adminLiveStats?.distribution || {}).map(([name, value]) => {
                        let label = name;
                        if (currentQuestion?.type === 'mcq' || currentQuestion?.type === 'image_mcq') {
                          const idx = parseInt(name);
                          if (!isNaN(idx)) label = String.fromCharCode(65 + idx); // 0 -> A, 1 -> B, etc
                        }
                        return { name: label, value };
                      })}>
                        <XAxis dataKey="name" stroke="#60a5fa" fontSize={28} fontWeight="900" tickLine={false} axisLine={false} dy={20} />
                        <Bar dataKey="value" radius={[20, 20, 0, 0]} animationDuration={2000}>
                          {Object.entries(adminLiveStats?.distribution || {}).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#60a5fa' : '#1d4ed8'} />
                          ))}
                          <LabelList dataKey="value" position="top" fill="#fff" fontSize={48} fontWeight="900" offset={25} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {(phase === 'level_complete' || phase === 'game_over') && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col"
                >
                  {/* Header */}
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <h2 className="text-5xl font-black tracking-tighter text-blue-400 uppercase">
                        {phase === 'game_over' ? 'Final Standings' : `Mission ${currentLevel} Results`}
                      </h2>
                      <p className="text-lg text-white/40 tracking-[0.3em] mt-1">
                        {phase === 'game_over' ? 'GLOBAL CAMPAIGN COMPLETE' : 'RECONNAISSANCE COMPLETE'}
                      </p>
                    </div>
                    {phase === 'level_complete' && (
                      <div className="text-right">
                        <div className="text-xs tracking-[0.3em] text-white/40 uppercase mb-1">Global Accuracy</div>
                        <div className="text-5xl font-black text-white">{levelCompleteData?.levelStats.avgAccuracy || 0}%</div>
                      </div>
                    )}
                  </div>

                  {/* PHASE 5: Biggest Riser Spotlight */}
                  {(() => {
                    // Compute biggest riser: player with biggest positive rank delta
                    const prev = (leaderboard as any[]).map((e, idx) => ({
                      ...e,
                      prevRank: (e as any).prevRank ?? idx + 1,
                    }));
                    const riser = prev.reduce<any>((best, e) => {
                      const delta = e.prevRank - e.rank;
                      return delta > (best?.delta ?? 0) ? { ...e, delta } : best;
                    }, null);
                    if (!riser || riser.delta <= 0) return null;
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, type: 'spring', bounce: 0.4 }}
                        className="mb-6 flex items-center gap-6 bg-gradient-to-r from-yellow-900/40 to-transparent border-l-4 border-yellow-400 px-6 py-4 rounded-2xl"
                      >
                        <motion.span
                          animate={{ scale: [1, 1.25, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-4xl"
                        >🚀</motion.span>
                        <div>
                          <div className="text-xs tracking-[0.4em] text-yellow-400 font-black uppercase mb-1">Biggest Riser</div>
                          <div className="text-2xl font-black text-white uppercase">{riser.name}</div>
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8, type: 'spring' }}
                          className="ml-auto text-4xl font-black text-yellow-400"
                        >
                          +{riser.delta} ↑
                        </motion.div>
                      </motion.div>
                    );
                  })()}

                  {/* PHASE 5: Dynamic rank bars with fluid layout animation */}
                  <div className="flex-1 flex flex-col gap-3 overflow-hidden py-2">
                    {leaderboard.slice(0, 6).map((entry, idx) => {
                      const maxScore = leaderboard[0]?.totalScore || 1;
                      const width = Math.max(8, (entry.totalScore / maxScore) * 100);
                      const factionBorder = entry.faction === 'team_sentinel' ? '#3b82f6'
                        : entry.faction === 'team_landsat' ? '#10b981'
                        : entry.faction === 'team_modis' ? '#a855f7' : '#3b82f6';
                      const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;

                      return (
                        <motion.div
                          key={entry.usn}
                          layout
                          layoutId={entry.usn}
                          initial={{ x: -120, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ layout: { type: 'spring', stiffness: 120, damping: 20 }, delay: idx * 0.07 }}
                          className="relative h-20 flex items-center"
                        >
                          <div className="w-20 text-3xl font-black text-white/25 italic flex-shrink-0">
                            {medalEmoji ?? `#${idx + 1}`}
                          </div>
                          <div className="flex-1 h-full relative flex items-center px-6">
                            {/* Score bar — width animates as scores change */}
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 rounded-xl"
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ duration: 1.6, type: 'spring', bounce: 0.25 }}
                              style={{
                                background: `linear-gradient(90deg, ${factionBorder}30, ${factionBorder}08)`,
                                border: `2px solid ${factionBorder}60`,
                                boxShadow: idx === 0 ? `0 0 30px ${factionBorder}40` : 'none',
                              }}
                            />
                            <div className="relative z-10 flex justify-between w-full items-center">
                              <div className="flex items-center gap-4">
                                <div className="text-2xl font-black text-white uppercase truncate max-w-[280px]">{entry.name}</div>
                                {entry.streak >= 3 && (
                                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>🔥</motion.span>
                                )}
                              </div>
                              <div className="text-3xl font-black tabular-nums" style={{ color: factionBorder }}>
                                {entry.totalScore.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}


              {phase === 'auction_active' && (
                <motion.div 
                  key="auction"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="w-full h-full flex flex-col"
                >
                  <div className="flex justify-between items-center mb-12">
                    <h2 className="text-5xl font-black tracking-widest text-blue-400">EQUIPMENT AUCTION</h2>
                    <div className="bg-white/10 px-8 py-4 rounded-2xl border border-white/20">
                      <div className="text-white/40 text-xs tracking-widest mb-1 uppercase">Market Multiplier</div>
                      <div className="text-4xl font-black text-white">x{auctionMultiplier.toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 w-full">
                    {auctionTools.map(tool => (
                      <div key={tool.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-6">
                        <div className="text-5xl">{tool.icon}</div>
                        <div className="flex-1">
                          <div className="text-xl font-bold text-white uppercase">{tool.name}</div>
                          <div className="text-sm text-white/40">{tool.desc}</div>
                        </div>
                        <div className="text-3xl font-black text-blue-400">
                          ${auctionPrices[tool.id]?.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {phase === 'disaster_active' && disasterInfo && (
                <motion.div 
                  key="disaster"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center text-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], filter: ['drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))', 'drop-shadow(0 0 50px rgba(239, 68, 68, 0.8))', 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ fontSize: '8rem', marginBottom: 20 }}
                  >
                    {disasterInfo.icon}
                  </motion.div>
                  <h2 className="text-8xl font-black text-red-500 tracking-tighter mb-6 italic uppercase">CRITICAL ALERT</h2>
                  <h3 className="text-5xl font-bold text-white mb-8 tracking-widest">{disasterInfo.name}</h3>
                  <p className="text-2xl text-white/60 max-w-4xl leading-relaxed italic border-y border-white/10 py-8">
                    "{disasterInfo.desc}"
                  </p>
                  <div className="mt-12 flex gap-12 items-center">
                    <div className="flex flex-col items-center">
                      <div className="text-9xl font-black text-white tabular-nums">{timeLeft}</div>
                      <div className="text-white/40 tracking-[0.4em] uppercase text-sm">Deployment Window</div>
                    </div>
                    <div className="h-24 w-[2px] bg-white/20" />
                    <div className="text-left">
                      <div className="text-white/40 tracking-[0.2em] uppercase text-xs mb-4">Priority Metrics</div>
                      {disasterInfo.metrics.map((m, i) => (
                        <div key={i} className="text-lg font-bold text-blue-400 mb-1 flex items-center gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full" /> {m}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Gutter: Performance Metrics */}
          <div className="w-[500px] flex flex-col p-10 gap-10 bg-black/20 backdrop-blur-md">
            {/* Real-time Rankings */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-2xl font-black text-blue-400 mb-8 tracking-[0.3em] uppercase flex items-center gap-4">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                Live Standings
              </h3>
              <div className="space-y-4">
                <AnimatePresence>
                  {leaderboard.slice(0, 7).map((entry, idx) => (
                    <motion.div
                      key={entry.usn}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center p-5 rounded-2xl border-2 transition-all duration-500 ${
                        idx === 0 
                          ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                          : 'bg-white/5 border-white/5'
                      }`}
                      style={{
                        borderColor: entry.faction === 'team_sentinel' ? '#3b82f6' : 
                                     entry.faction === 'team_landsat' ? '#10b981' : 
                                     entry.faction === 'team_modis' ? '#a855f7' : 'rgba(255,255,255,0.05)'
                      }}
                    >
                      <div className="w-12 text-3xl font-black text-white/20 italic">#{idx + 1}</div>
                      <div className="flex-1 ml-2 flex items-center gap-3">
                        <div className="text-2xl font-bold uppercase truncate max-w-[180px]">{entry.name}</div>
                        {entry.streak >= 3 && (
                          <motion.span 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity }}
                            className="text-2xl"
                          >🔥</motion.span>
                        )}
                      </div>
                      <div className="text-3xl font-black text-blue-400 tabular-nums">
                        {entry.totalScore.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Faction Power Dynamics */}
            <div className="h-80 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-white/10 rounded-3xl p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />
               <h3 className="text-2xl font-black text-purple-400 mb-8 tracking-[0.3em] uppercase">Faction War</h3>
               <div className="space-y-6">
                 {[
                   { id: 'team_sentinel', name: 'SENTINEL', color: '#3b82f6' },
                   { id: 'team_landsat', name: 'LANDSAT', color: '#10b981' },
                   { id: 'team_modis', name: 'MODIS', color: '#a855f7' }
                 ].map(f => {
                   const score = factionScores[f.id] || 0;
                   const maxScore = Math.max(...Object.values(factionScores), 1);
                   return (
                    <div key={f.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black tracking-[0.2em] text-white/60">{f.name}</span>
                        <span className="text-xl font-black text-white">{score.toLocaleString()}</span>
                      </div>
                      <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10 p-[2px]">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: f.color, boxShadow: `0 0 15px ${f.color}88` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(score / maxScore) * 100}%` }}
                          transition={{ duration: 1.5, type: 'spring' }}
                        />
                      </div>
                    </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </main>

        {/* Cinematic Ticker Footer */}
        <footer className="h-16 border-t border-white/10 flex items-center bg-black/60 relative overflow-hidden">
          <div className="absolute left-0 h-full w-24 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 h-full w-24 bg-gradient-to-l from-black to-transparent z-10" />
          <motion.div
            animate={{ x: [0, -2000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap flex gap-20 text-[11px] tracking-[0.6em] text-white/30 font-black uppercase italic"
          >
            {[...Array(5)].map((_, i) => (
              <span key={i} className="flex gap-20">
                <span>Satellite Uplink: Stable (Region-7)</span>
                <span>Security Protocol: AES-256 Armed</span>
                <span>Neural Drift: Nominal</span>
                <span>Atmospheric Refraction: 0.04%</span>
                <span>Mission Control Status: Fully Operational</span>
              </span>
            ))}
          </motion.div>
        </footer>
      </div>

      {/* AI MISSION COMMANDER OVERLAY */}
      <AnimatePresence>
        {missionCommentary && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[800px]"
          >
            <div className={`relative overflow-hidden rounded-3xl border-4 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]
              ${missionCommentary.mood === 'snarky' ? 'border-red-500/50 bg-red-950/40' : 
                missionCommentary.mood === 'urgent' ? 'border-orange-500 bg-orange-950/60' : 
                missionCommentary.mood === 'celebratory' ? 'border-green-500 bg-green-950/40' : 
                'border-blue-500/50 bg-blue-950/40'}`}
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
              
              <div className="flex items-start gap-8 relative z-10">
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2
                    ${missionCommentary.mood === 'snarky' ? 'border-red-400 bg-red-400/20' : 
                      missionCommentary.mood === 'urgent' ? 'border-orange-400 bg-orange-400/20' : 
                      missionCommentary.mood === 'celebratory' ? 'border-green-400 bg-green-400/20' : 
                      'border-blue-400 bg-blue-400/20'}`}
                  >
                    {missionCommentary.mood === 'snarky' ? '🤖' : 
                     missionCommentary.mood === 'urgent' ? '🚨' : 
                     missionCommentary.mood === 'celebratory' ? '🏆' : '📡'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`text-xs font-black tracking-[0.4em] uppercase
                      ${missionCommentary.mood === 'snarky' ? 'text-red-400' : 
                        missionCommentary.mood === 'urgent' ? 'text-orange-400' : 
                        missionCommentary.mood === 'celebratory' ? 'text-green-400' : 
                        'text-blue-400'}`}
                    >
                      Mission Commander // AI Uplink
                    </span>
                    <motion.div 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" 
                    />
                  </div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-bold leading-snug italic text-white drop-shadow-md"
                  >
                    "{missionCommentary.text}"
                  </motion.div>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/40" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
