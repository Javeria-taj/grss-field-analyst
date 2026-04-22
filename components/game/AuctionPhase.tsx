'use client';
import { motion } from 'framer-motion';
import { useGameSyncStore } from '@/stores/useGameSyncStore';

export default function AuctionPhase() {
  const { auctionTools, auctionPrices, auctionBudget, auctionOwned, auctionMultiplier, buyTool, sellTool } = useGameSyncStore();

  return (
    <div className="page-content" style={{ justifyContent: 'center', gap: 16, minHeight: '70vh' }}>
      <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="font-orb t-accent" style={{ fontSize: '1.2rem', letterSpacing: 2 }}>🏪 TOOL AUCTION</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text2)' }}>BUDGET</div>
            <div className="font-orb t-accent2" style={{ fontSize: '1.3rem' }}>${auctionBudget.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text2)' }}>TOOLS</div>
            <div className="font-orb t-warning" style={{ fontSize: '1.3rem' }}>{auctionOwned.length}/5</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text2)' }}>PRICE ×</div>
            <div className="font-orb t-danger" style={{ fontSize: '1.3rem' }}>{auctionMultiplier.toFixed(1)}</div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, maxWidth: 720, width: '100%' }}>
        {auctionTools.map(t => {
          const owned = auctionOwned.includes(t.id);
          const price = auctionPrices[t.id] ?? t.price;
          const canBuy = !owned && auctionBudget >= price && auctionOwned.length < 5;

          return (
            <motion.div key={t.id} className="card card-sm"
              style={{ borderColor: owned ? 'var(--accent2)' : 'var(--border)', position: 'relative' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: 10, lineHeight: 1.4 }}>{t.desc}</div>
              <div className="font-orb" style={{ fontSize: '0.9rem', color: canBuy ? 'var(--accent2)' : 'var(--text2)', marginBottom: 8 }}>
                ${price.toLocaleString()}
              </div>
              {owned ? (
                <button className="btn btn-outline btn-sm" style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  onClick={() => sellTool(t.id)}>SELL (70%)</button>
              ) : (
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
                  disabled={!canBuy} onClick={() => buyTool(t.id)}>BUY</button>
              )}
              {owned && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.6rem', color: 'var(--accent2)' }}>✓ OWNED</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
