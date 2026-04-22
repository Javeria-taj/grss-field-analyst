'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { SFX } from '@/lib/sfx';
import { toast } from '@/components/ui/Toast';
import DATA from '@/lib/gameData';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuctionPage() {
  const router = useRouter();
  const gs = useGameStore();
  const [auctTime, setAuctTime] = useState(120);
  const [priceTime, setPriceTime] = useState(20);
  const [priceMulti, setPriceMulti] = useState(1.0);
  const [bought, setBought] = useState<string[]>([]);
  const [budget, setBudget] = useState(10000);

  const disaster = DATA.level5.disasters[Math.floor(Math.random() * DATA.level5.disasters.length)];

  useEffect(() => {
    if (!gs.user) { router.replace('/'); return; }
    if (!gs.unlocked.includes(5)) { router.replace('/dashboard'); return; }
    
    // Resume from store if we have data, otherwise start fresh
    if (gs.disasterId) {
      setBudget(gs.budget);
      setBought(gs.bought);
      setPriceMulti(gs.priceMulti);
    } else {
      gs.startL5(disaster.id);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    const auctTimer = setInterval(() => {
      setAuctTime(t => {
        if (t <= 1) { clearInterval(auctTimer); finalize(); return 0; }
        return t - 1;
      });
    }, 1000);
    const priceTimer = setInterval(() => {
      setPriceTime(t => {
        if (t <= 1) {
          setPriceMulti(m => {
            const nm = parseFloat((m * 1.1).toFixed(3));
            toast('📈 All prices increased by 10%!', 'err');
            SFX.urgency();
            // Sync price hike to backend
            gs.setPriceMulti(nm);
            gs.syncState();
            return nm;
          });
          return 20;
        }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(auctTimer); clearInterval(priceTimer); };
  }, []); // eslint-disable-line

  const getPrice = (basePrice: number) => Math.round(basePrice * priceMulti);

  const buyTool = (id: string) => {
    const tool = DATA.level5.tools.find(t => t.id === id)!;
    const price = getPrice(tool.price);
    if (bought.length >= 5) { toast('Loadout full — max 5 tools!', 'err'); return; }
    if (budget < price) { toast('Insufficient budget!', 'err'); return; }
    
    const newBudget = budget - price;
    const newBought = [...bought, id];
    
    setBudget(newBudget);
    setBought(newBought);
    
    // SYNC TO HQ
    gs.setBudget(newBudget);
    gs.setBought(newBought);
    gs.setPriceMulti(priceMulti);
    gs.syncState();

    SFX.buy();
    toast(`✅ ${tool.name} acquired!`, 'ok');
  };

  const sellTool = (id: string) => {
    const tool = DATA.level5.tools.find(t => t.id === id)!;
    const price = Math.round(getPrice(tool.price) * 0.7);
    
    const newBudget = budget + price;
    const newBought = bought.filter(x => x !== id);
    
    setBudget(newBudget);
    setBought(newBought);

    // SYNC TO HQ
    gs.setBudget(newBudget);
    gs.setBought(newBought);
    gs.setPriceMulti(priceMulti);
    gs.syncState();

    SFX.click();
    toast(`💰 ${tool.name} sold for $${price.toLocaleString()}`, 'inf');
  };

  const activeCombos = DATA.level5.combos.filter(c => c.tools.every(t => bought.includes(t)));

  const finalize = () => {
    if (bought.length === 0) { toast('Acquire at least 1 tool!', 'err'); return; }
    gs.setBought(bought);
    gs.setBudget(budget);
    gs.setPriceMulti(priceMulti);
    const budgetBonus = Math.round((budget / 10000) * 300);
    const comboBonus = activeCombos.reduce((s, c) => s + c.bonus, 0);
    gs.setAuctScore(budgetBonus + comboBonus);
    gs.setDisasterScore(0);
    SFX.click();
    router.push('/disaster');
  };

  const pct = (auctTime / 120) * 100;
  const timerClass = pct < 25 ? 'crit' : pct < 50 ? 'warn' : '';
  const m = Math.floor(auctTime / 60);
  const s = auctTime % 60;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="earth-deco" />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* HUD */}
        <div className="hud">
          <div className="hud-level font-orb" style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)', color: 'var(--accent)' }}>LEVEL 5A — TOOL AUCTION</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}><div className="label" style={{ fontSize: '0.6rem' }}>BUDGET</div><div className="font-orb t-warning" style={{ fontSize: '1rem' }}>${budget.toLocaleString()}</div></div>
            <div style={{ textAlign: 'center' }}><div className="label" style={{ fontSize: '0.6rem' }}>TOOLS</div><div className="font-orb t-accent2" style={{ fontSize: '1rem' }}>{bought.length}/5</div></div>
            <div style={{ textAlign: 'center' }}>
              <div className="label" style={{ fontSize: '0.6rem' }}>HIKE IN</div>
              <div className="font-orb" style={{ color: priceTime <= 5 ? 'var(--danger)' : 'var(--warning)', fontSize: '1rem' }}>{priceTime}s</div>
            </div>
          </div>
        </div>

        {/* Budget bar */}
        <div style={{ padding: '4px 20px' }}>
          <div className="budget-track" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="budget-fill" style={{
              width: `${(budget / 10000) * 100}%`,
              background: budget < 2000
                ? 'linear-gradient(90deg,#880000,var(--danger))'
                : budget < 5000
                  ? 'linear-gradient(90deg,#996600,var(--warning))'
                  : 'linear-gradient(90deg,var(--danger),var(--warning),var(--success))',
            }} />
          </div>
        </div>

        <div className="page-content" style={{ gap: 12 }}>
          {/* Auction timer */}
          <div style={{ maxWidth: 680, width: '92vw' }}>
            <div className="timer-track"><div className={`timer-fill ${timerClass}`} style={{ width: `${pct}%` }} /></div>
            <div className={`timer-txt ${timerClass}`} style={{ padding: '4px 0', fontSize: '0.85rem' }}>TIME REMAINING: {m}:{s.toString().padStart(2, '0')}</div>
          </div>

          {/* Info bar */}
          <div style={{ maxWidth: 680, width: '100%', fontSize: '0.83rem', color: 'var(--text2)', background: 'rgba(0,200,255,.04)', border: '1px solid var(--border)', borderRadius: 10, padding: 11 }}>
            💼 Budget: <strong style={{ color: 'var(--accent)' }}>${budget.toLocaleString()}</strong>&nbsp;|&nbsp;
            Max tools: <strong style={{ color: 'var(--accent)' }}>5</strong>&nbsp;|&nbsp;
            Prices ↑10% every 20s&nbsp;|&nbsp;Sell back at 70%&nbsp;|&nbsp;Combos = bonus points!
          </div>

          {/* Disaster preview */}
          <div style={{ maxWidth: 680, width: '92vw', background: 'rgba(255,45,85,.04)', border: '1px solid rgba(255,45,85,.25)', borderRadius: 12, padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>{disaster.icon}</span>
              <div>
                <div className="font-orb" style={{ fontSize: '0.75rem', color: disaster.color }}>ALERT: {disaster.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text2)', marginTop: 2 }}>Select gear to mitigate threat.</div>
              </div>
            </div>
          </div>

          {/* Tool grid */}
          <div className="tool-grid" style={{ maxWidth: 680, width: '92vw' }}>
            {DATA.level5.tools.map(t => {
              const price = getPrice(t.price);
              const owned = bought.includes(t.id);
              const canBuy = !owned && budget >= price && bought.length < 5;
              const isOptimal = disaster.optTools.includes(t.id);
              const eff = t.eff[disaster.id as keyof typeof t.eff];
              const effPct = Math.round(eff * 10);
              const effColor = eff >= 8 ? 'var(--accent2)' : eff >= 5 ? 'var(--warning)' : 'var(--danger)';
              return (
                <motion.div
                  key={t.id}
                  className={`tool-card ${owned ? 'bought' : ''} ${isOptimal && !owned ? 'optimal-hint' : ''}`}
                  onClick={() => owned ? sellTool(t.id) : buyTool(t.id)}
                  onMouseEnter={() => SFX.hover()}
                  whileHover={{ translateY: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isOptimal && <div style={{ position: 'absolute', top: 6, right: 6, fontSize: '0.6rem', color: 'var(--gold)' }}>⭐ OPTIMAL</div>}
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text2)', marginBottom: 7 }}>{t.desc}</div>
                  <div className={`tool-price${priceMulti > 1 && !owned ? ' rising' : ''}`}>
                    {owned ? 'ACQUIRED' : `$${price.toLocaleString()}`}
                  </div>
                  <div className="eff-bar-wrap">
                    <div className="eff-bar-label" style={{ color: effColor }}>Effectiveness: {eff}/10</div>
                    <div className="eff-bar-track"><div className="eff-bar-fill" style={{ width: `${effPct}%`, background: effColor }} /></div>
                  </div>
                  <div style={{ fontSize: '0.7rem', marginTop: 5, color: owned ? 'var(--accent2)' : canBuy ? 'var(--text2)' : 'var(--danger)' }}>
                    {owned ? '🔴 Tap to Sell Back ($' + Math.round(price * 0.7).toLocaleString() + ')' : canBuy ? '🟢 Acquire' : '⚫ ' + (bought.length >= 5 ? 'Loadout Full' : 'Insufficient Budget')}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Combos */}
          {activeCombos.length > 0 && (
            <div style={{ maxWidth: 680, width: '100%' }}>
              <div className="label" style={{ marginBottom: 8 }}>⚡ ACTIVE COMBOS</div>
              {activeCombos.map(c => (
                <div key={c.name} className="card card-sm combo-active-card" style={{ marginBottom: 8, borderColor: 'rgba(255,215,0,.35)' }}>
                  <span className="combo-tag">{c.icon} {c.name}</span>
                  <span style={{ float: 'right', fontFamily: 'var(--font-orbitron)', color: 'var(--gold)' }}>+{c.bonus} pts</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: 6 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          )}

          <motion.button 
            className="btn btn-success btn-lg" 
            onClick={finalize} 
            onMouseEnter={() => SFX.hover()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ maxWidth: 260, width: '100%' }} id="finalizeLoadoutBtn"
          >
            ✅ FINALIZE LOADOUT
          </motion.button>
        </div>
      </div>
    </div>
  );
}
