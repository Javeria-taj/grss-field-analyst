'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useLevel5Store } from '@/stores/useLevel5Store';
import { CASE_STUDIES, TOOLS, TIERS, TIER_LABELS } from './level5Data';
import { toast } from '@/components/ui/Toast';

/* ═══════════════════════════════════════════════════
   Draggable Tool Card
═══════════════════════════════════════════════════ */
function DraggableTool({
  tool,
  price,
  isPlaced,
}: {
  tool: typeof TOOLS[0];
  price: number;
  isPlaced: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: tool.id,
    disabled: isPlaced,
    data: { toolId: tool.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        background: 'var(--card)',
        border: `1.5px solid ${isPlaced ? 'rgba(255,255,255,0.08)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '11px 9px',
        cursor: isPlaced ? 'not-allowed' : 'grab',
        textAlign: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        opacity: isDragging ? 0.35 : isPlaced ? 0.22 : 1,
        minHeight: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        transition: 'opacity 0.2s, border-color 0.2s',
        pointerEvents: isPlaced ? 'none' : 'auto',
      }}
    >
      <div style={{ fontSize: '1.4rem', marginBottom: 4, lineHeight: 1 }}>{tool.icon}</div>
      <div style={{ fontSize: '0.69rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: 5 }}>
        {tool.name}
      </div>
      <div
        className="font-orb"
        style={{ fontSize: '0.76rem', color: 'var(--warning)', fontWeight: 700 }}
      >
        {price} pts
      </div>
      {isPlaced && (
        <div style={{ fontSize: '0.6rem', color: 'var(--accent2)', marginTop: 3, letterSpacing: 1 }}>
          DEPLOYED
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Droppable Slot
═══════════════════════════════════════════════════ */
function DroppableSlot({
  csId,
  tierIdx,
  slotContent,
  onRemove,
}: {
  csId: string;
  tierIdx: number;
  slotContent: { toolId: string; price: number } | null;
  onRemove: () => void;
}) {
  const dropId = `${csId}-${tierIdx}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId, data: { csId, tierIdx } });
  const tool = slotContent ? TOOLS.find((t) => t.id === slotContent.toolId) : null;
  const isFull = slotContent !== null;

  return (
    <div
      ref={setNodeRef}
      onClick={isFull ? onRemove : undefined}
      title={isFull ? `Tap to remove & refund ${slotContent!.price} pts` : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 11px',
        borderRadius: 9,
        border: `1.5px ${isFull ? 'solid' : 'dashed'} ${
          isOver
            ? 'var(--accent)'
            : isFull
            ? 'rgba(0,255,136,0.35)'
            : 'rgba(255,255,255,0.09)'
        }`,
        marginBottom: 6,
        minHeight: 42,
        cursor: isFull ? 'pointer' : 'default',
        transition: 'all 0.2s',
        background: isOver
          ? 'rgba(0,200,255,0.1)'
          : isFull
          ? 'rgba(0,255,136,0.05)'
          : 'rgba(0,0,0,0.18)',
        animation: isOver ? 'none' : undefined,
      }}
    >
      <span style={{ fontSize: '0.88rem', flexShrink: 0, width: 20 }}>{TIERS[tierIdx]}</span>
      <span style={{
        fontSize: '0.62rem', fontWeight: 700, color: 'var(--text2)',
        flexShrink: 0, width: 62, textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {TIER_LABELS[tierIdx]}
      </span>
      <span style={{ flex: 1, fontSize: '0.76rem', fontWeight: 600 }}>
        {tool ? (
          <span style={{ color: 'var(--accent2)' }}>
            {tool.icon} {tool.name}
          </span>
        ) : (
          <span style={{ color: 'var(--text2)', fontStyle: 'italic', fontSize: '0.7rem' }}>
            {isOver ? 'Drop here' : 'Drag to deploy'}
          </span>
        )}
      </span>
      {isFull && (
        <>
          <span className="font-orb" style={{ fontSize: '0.62rem', color: 'var(--text2)', flexShrink: 0 }}>
            {slotContent!.price}p
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--danger)', flexShrink: 0, fontWeight: 700 }}>
            ✕
          </span>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Drag Overlay Card (what user sees while dragging)
═══════════════════════════════════════════════════ */
function ToolDragOverlay({ toolId, price }: { toolId: string; price: number }) {
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) return null;
  return (
    <div style={{
      background: 'rgba(0,40,100,0.97)',
      border: '2px solid var(--accent)',
      borderRadius: 12,
      padding: '11px 9px',
      textAlign: 'center',
      minWidth: 110,
      boxShadow: '0 8px 32px rgba(0,200,255,0.4)',
      opacity: 0.95,
    }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{tool.icon}</div>
      <div style={{ fontSize: '0.69rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1.3, marginBottom: 4 }}>
        {tool.name}
      </div>
      <div className="font-orb" style={{ fontSize: '0.76rem', color: 'var(--warning)', fontWeight: 700 }}>
        {price} pts
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Phase 5B — Main Component
═══════════════════════════════════════════════════ */
export default function Phase5B() {
  const {
    budget, currentPrice, hikeCountdown,
    shuffledTools, placed, slots,
    placeTool, removeTool, applyPriceHike,
    tickHikeCountdown, resetHikeCountdown,
    proceedTo5C,
  } = useLevel5Store();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [budgetAnim, setBudgetAnim] = useState<'drop' | 'refund' | null>(null);
  const [priceHikeFlash, setPriceHikeFlash] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Sensors: Mouse + Touch for mobile ──
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // ── 10-second price hike interval ──
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const store = useLevel5Store.getState();
      const newCountdown = store.hikeCountdown - 1;
      if (newCountdown <= 0) {
        store.applyPriceHike();
        store.resetHikeCountdown();
        setPriceHikeFlash(true);
        setTimeout(() => setPriceHikeFlash(false), 700);
        toast(`📈 Price increased to ${store.currentPrice + 10} pts!`, 'inf');
      } else {
        store.tickHikeCountdown();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { over, active } = event;
    if (!over) return;

    const toolId = active.id as string;
    const { csId, tierIdx } = over.data.current as { csId: string; tierIdx: number };

    // Already has a tool in this slot — don't overwrite
    if (slots[csId][tierIdx] !== null) return;

    const success = placeTool(csId, tierIdx, toolId);
    if (!success) {
      if (placed[toolId]) return; // already placed elsewhere
      // Budget too low
      setBudgetAnim('drop');
      setTimeout(() => setBudgetAnim(null), 600);
      toast('⚠ Insufficient budget!', 'err');
    } else {
      setBudgetAnim('drop');
      setTimeout(() => setBudgetAnim(null), 600);
    }
  }, [slots, placed, placeTool]);

  const handleRemove = useCallback((csId: string, tierIdx: number) => {
    removeTool(csId, tierIdx);
    setBudgetAnim('refund');
    setTimeout(() => setBudgetAnim(null), 500);
  }, [removeTool]);

  const budgetColor =
    budget < 300 ? 'var(--danger)' : budget < 700 ? 'var(--warning)' : 'var(--accent2)';

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

        {/* ── Topbar: Budget / Hike Countdown / Current Price ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 18px',
          background: 'rgba(3,7,15,0.97)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 60,
          flexWrap: 'wrap',
          gap: 8,
        }}>
          {/* Live Budget */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 2 }}>
              Live Budget
            </div>
            <motion.div
              className="font-orb"
              key={budget}
              animate={budgetAnim === 'drop'
                ? { scale: [1, 1.3, 0.97, 1], color: ['var(--accent2)', 'var(--danger)', 'var(--danger)', budgetColor] }
                : budgetAnim === 'refund'
                ? { scale: [1, 1.25, 0.97, 1], color: ['var(--accent2)', 'var(--accent2)', 'var(--accent2)', budgetColor] }
                : {}
              }
              style={{ fontSize: '1.35rem', fontWeight: 900, color: budgetColor }}
            >
              {budget.toLocaleString()} pts
            </motion.div>
          </div>

          {/* Price Hike Countdown */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 2 }}>
              Price Hike In
            </div>
            <motion.div
              className="font-orb l5-hike-flash"
              animate={hikeCountdown <= 3 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: hikeCountdown <= 3 ? Infinity : 0, duration: 0.35 }}
              style={{ fontSize: '1rem', fontWeight: 700 }}
            >
              {hikeCountdown}s
            </motion.div>
          </div>

          {/* Current Price */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 2 }}>
              Current Price
            </div>
            <motion.div
              className="font-orb"
              key={currentPrice}
              animate={priceHikeFlash ? { scale: [1.1, 1], color: ['var(--danger)', 'var(--warning)'] } : {}}
              style={{ fontSize: '1rem', color: 'var(--warning)', fontWeight: 700 }}
            >
              {currentPrice} pts
            </motion.div>
          </div>
        </div>

        {/* ── Main scrollable content ── */}
        <div style={{ flex: 1, padding: '18px 20px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>

            {/* Tool Market */}
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.68rem', letterSpacing: 2,
              color: 'var(--text2)', textTransform: 'uppercase',
              marginBottom: 11,
            }}>
              🛒 Tool Market — Drag to deploy
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 130px), 1fr))',
              gap: 9,
              marginBottom: 22,
            }}>
              {shuffledTools.map((tool) => (
                <DraggableTool
                  key={tool.id}
                  tool={tool}
                  price={currentPrice}
                  isPlaced={!!placed[tool.id]}
                />
              ))}
            </div>

            {/* Deployment Zones */}
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.68rem', letterSpacing: 2,
              color: 'var(--text2)', textTransform: 'uppercase',
              marginBottom: 11,
            }}>
              🎯 Deployment Zones — Primary · Secondary · Tertiary
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 440px), 1fr))',
              gap: 12,
            }}>
              {CASE_STUDIES.map((cs) => (
                <div
                  key={cs.id}
                  style={{
                    background: 'var(--card2, rgba(12,24,54,0.92))',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div style={{ marginBottom: 11 }}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)' }}>
                      {cs.label}
                    </div>
                    <div className="font-orb" style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: 3, lineHeight: 1.3 }}>
                      {cs.title}
                    </div>
                  </div>

                  {[0, 1, 2].map((tierIdx) => (
                    <DroppableSlot
                      key={tierIdx}
                      csId={cs.id}
                      tierIdx={tierIdx}
                      slotContent={slots[cs.id][tierIdx]}
                      onRemove={() => handleRemove(cs.id, tierIdx)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(3,7,15,0.94)',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: 980, margin: '0 auto',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
              Deploy your tools, then lock in your strategy.
            </div>
            <motion.button
              className="btn btn-danger btn-lg"
              onClick={proceedTo5C}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              📡 FINALIZE DEPLOYMENT
            </motion.button>
          </div>
        </div>
      </div>

      {/* Drag Overlay — rendered outside the normal DOM flow */}
      <DragOverlay>
        {activeDragId ? <ToolDragOverlay toolId={activeDragId} price={currentPrice} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
