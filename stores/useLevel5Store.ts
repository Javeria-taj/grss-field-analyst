import { create } from 'zustand';
import { CASE_STUDIES, TOOLS, BASE_PRICE, HIKE_AMT } from '@/components/game/level5/level5Data';

export type L5Phase = '5A' | '5B' | '5C';

// Slot: one of 3 per deployment zone (Primary / Secondary / Tertiary)
export interface SlotContent {
  toolId: string;
  price: number; // price at time of purchase
}

// csId -> [slot0, slot1, slot2]
export type SlotMap = Record<string, [SlotContent | null, SlotContent | null, SlotContent | null]>;

interface Level5State {
  // Phase management
  l5Phase: L5Phase;

  // Phase 5A — answers (null = not yet answered)
  answers5A: Record<string, number | null>;

  // Phase 5B — budget & pricing
  budget: number;
  currentPrice: number;
  hikeCountdown: number;

  // Phase 5B — shuffled tool order (set once when entering 5B)
  shuffledTools: typeof TOOLS;

  // Phase 5B — placement state
  // placed: toolId -> true (lookup for "is this tool already in a slot?")
  placed: Record<string, boolean>;
  slots: SlotMap;

  // Actions
  setBudget: (b: number) => void;
  setAnswer5A: (csId: string, idx: number) => void;
  proceedTo5B: () => void;
  placeTool: (csId: string, tierIdx: number, toolId: string) => boolean; // returns false if insufficient budget
  removeTool: (csId: string, tierIdx: number) => void;
  applyPriceHike: () => void;
  tickHikeCountdown: () => void;
  resetHikeCountdown: () => void;
  proceedTo5C: () => void;
  resetLevel5: () => void;
}

// Helper: shuffle an array
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptySlots(): SlotMap {
  const m: SlotMap = {};
  for (const cs of CASE_STUDIES) {
    m[cs.id] = [null, null, null];
  }
  return m;
}

export const useLevel5Store = create<Level5State>((set, get) => ({
  l5Phase: '5A',
  answers5A: { cs1: null, cs2: null, cs3: null, cs4: null },
  budget: 0,       // set by orchestrator from myTotalScore + 100
  currentPrice: BASE_PRICE,
  hikeCountdown: 10,
  shuffledTools: shuffle([...TOOLS]),
  placed: {},
  slots: emptySlots(),

  setBudget: (b) => set({ budget: b }),

  setAnswer5A: (csId, idx) =>
    set((s) => ({ answers5A: { ...s.answers5A, [csId]: idx } })),

  proceedTo5B: () => set({ l5Phase: '5B', hikeCountdown: 10 }),

  placeTool: (csId, tierIdx, toolId) => {
    const { budget, currentPrice, placed, slots } = get();
    if (placed[toolId]) return false; // already placed
    if (budget < currentPrice) return false; // not enough budget
    const newSlots = { ...slots };
    const csSlots: [SlotContent | null, SlotContent | null, SlotContent | null] = [...newSlots[csId]] as any;
    csSlots[tierIdx] = { toolId, price: currentPrice };
    newSlots[csId] = csSlots;
    set({
      slots: newSlots,
      placed: { ...placed, [toolId]: true },
      budget: budget - currentPrice,
    });
    return true;
  },

  removeTool: (csId, tierIdx) => {
    const { slots, placed, budget } = get();
    const slot = slots[csId][tierIdx];
    if (!slot) return;
    const newSlots = { ...slots };
    const csSlots: [SlotContent | null, SlotContent | null, SlotContent | null] = [...newSlots[csId]] as any;
    csSlots[tierIdx] = null;
    newSlots[csId] = csSlots;
    const newPlaced = { ...placed };
    delete newPlaced[slot.toolId];
    set({
      slots: newSlots,
      placed: newPlaced,
      budget: budget + slot.price, // refund
    });
  },

  applyPriceHike: () =>
    set((s) => ({ currentPrice: s.currentPrice + HIKE_AMT })),

  tickHikeCountdown: () =>
    set((s) => ({ hikeCountdown: s.hikeCountdown - 1 })),

  resetHikeCountdown: () => set({ hikeCountdown: 10 }),

  proceedTo5C: () => set({ l5Phase: '5C' }),

  resetLevel5: () =>
    set({
      l5Phase: '5A',
      answers5A: { cs1: null, cs2: null, cs3: null, cs4: null },
      budget: 0,
      currentPrice: BASE_PRICE,
      hikeCountdown: 10,
      shuffledTools: shuffle([...TOOLS]),
      placed: {},
      slots: emptySlots(),
    }),
}));
