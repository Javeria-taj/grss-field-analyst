import { StateCreator } from 'zustand';
import { Level1Q } from '@/lib/gameData';
import { shuffle } from '@/lib/scoring';
import DATA from '@/lib/gameData';
import { ProgressSlice } from './progressSlice';

export interface QState {
  ans: string | number;
  timeWhenSubmitted: number;
  status?: 'win' | 'lose';
}

export interface LevelSlice {
  currentLevel: number;
  currentHint: string;
  qState: QState | null;

  // Level States
  l1q: Level1Q[]; l1idx: number; l1score: number; l1correct: number;
  l2idx: number; l2score: number; l2correct: number;
  l3idx: number; l3score: number; l3correct: number; l3guessed: string[]; l3lives: number; l3hintGiven: boolean;
  l4idx: number; l4score: number; l4correct: number;
  budget: number; bought: string[]; priceMulti: number; auctScore: number;
  disasterId: string | null; applied: string[]; disasterScore: number;

  // Actions
  setCurrentLevel: (n: number) => void;
  setCurrentHint: (h: string) => void;
  setQState: (qs: QState | null) => void;
  resetLevels: () => void;

  startL1: () => void; addL1Score: (pts: number) => void; incL1Idx: () => void; incL1Correct: () => void; finishL1: () => void;
  startL2: () => void; addL2Score: (pts: number) => void; incL2Idx: () => void; incL2Correct: () => void; finishL2: () => void;
  startL3: () => void; setL3Guessed: (g: string[]) => void; setL3Lives: (l: number) => void; setL3HintGiven: (v: boolean) => void; addL3Score: (pts: number) => void; incL3Idx: () => void; incL3Correct: () => void; finishL3: () => void;
  startL4: () => void; addL4Score: (pts: number) => void; incL4Idx: () => void; incL4Correct: () => void; finishL4: () => void;
  startL5: (disasterId: string) => void; setBudget: (b: number) => void; setBought: (b: string[]) => void; setPriceMulti: (m: number) => void; setAuctScore: (s: number) => void; setApplied: (a: string[]) => void; setDisasterScore: (s: number) => void; finalizeL5: () => void;
}

export const createLevelSlice: StateCreator<LevelSlice & ProgressSlice, [], [], LevelSlice> = (set) => ({
  currentLevel: 0, currentHint: '', qState: null,
  l1q: [], l1idx: 0, l1score: 0, l1correct: 0,
  l2idx: 0, l2score: 0, l2correct: 0,
  l3idx: 0, l3score: 0, l3correct: 0, l3guessed: [], l3lives: 6, l3hintGiven: false,
  l4idx: 0, l4score: 0, l4correct: 0,
  budget: 10000, bought: [], priceMulti: 1.0, auctScore: 0,
  disasterId: null, applied: [], disasterScore: 0,

  setCurrentLevel: (n) => set({ currentLevel: n }),
  setCurrentHint: (h) => set({ currentHint: h }),
  setQState: (qs) => set({ qState: qs }),
  resetLevels: () => set({
    currentLevel: 0, currentHint: '', qState: null,
    l1q: [], l1idx: 0, l1score: 0, l1correct: 0,
    l2idx: 0, l2score: 0, l2correct: 0,
    l3idx: 0, l3score: 0, l3correct: 0, l3guessed: [], l3lives: 6, l3hintGiven: false,
    l4idx: 0, l4score: 0, l4correct: 0,
    budget: 10000, bought: [], priceMulti: 1.0, auctScore: 0,
    disasterId: null, applied: [], disasterScore: 0,
  }),

  // Sub-Actions defined explicitly to hook into progression via getState merging...
  startL1: () => {
    const sc = DATA.level1.scrambles.map(q => ({ ...q }));
    const ri = DATA.level1.riddles.map(q => ({ ...q }));
    set({ l1q: shuffle([...sc, ...ri]), l1idx: 0, l1score: 0, l1correct: 0, qState: null });
  },
  addL1Score: (pts) => set(s => ({ l1score: s.l1score + pts })),
  incL1Idx: () => set(s => ({ l1idx: s.l1idx + 1, qState: null })),
  incL1Correct: () => set(s => ({ l1correct: s.l1correct + 1 })),
  finishL1: () => set(s => {
    const bonus = s.l1correct === 10 ? 200 : s.l1correct >= 8 ? 100 : 0;
    const total = s.l1score + bonus;
    return {
      scores: { ...s.scores, 1: total },
      completed: s.completed.includes(1) ? s.completed : [...s.completed, 1],
      unlocked: s.unlocked.includes(2) ? s.unlocked : [...s.unlocked, 2],
    };
  }),

  startL2: () => set({ l2idx: 0, l2score: 0, l2correct: 0, qState: null }),
  addL2Score: (pts) => set(s => ({ l2score: s.l2score + pts })),
  incL2Idx: () => set(s => ({ l2idx: s.l2idx + 1, qState: null })),
  incL2Correct: () => set(s => ({ l2correct: s.l2correct + 1 })),
  finishL2: () => set(s => {
    const bonus = s.l2correct === 5 ? 200 : 0;
    const total = s.l2score + bonus;
    return {
      scores: { ...s.scores, 2: total },
      completed: s.completed.includes(2) ? s.completed : [...s.completed, 2],
      unlocked: s.unlocked.includes(3) ? s.unlocked : [...s.unlocked, 3],
    };
  }),

  startL3: () => set({ l3idx: 0, l3score: 0, l3correct: 0, l3guessed: [], l3lives: 6, l3hintGiven: false, qState: null }),
  setL3Guessed: (g) => set({ l3guessed: g }),
  setL3Lives: (l) => set({ l3lives: l }),
  setL3HintGiven: (v) => set({ l3hintGiven: v }),
  addL3Score: (pts) => set(s => ({ l3score: s.l3score + pts })),
  incL3Idx: () => set(s => ({ l3idx: s.l3idx + 1, qState: null, l3guessed: [], l3lives: 6, l3hintGiven: false })),
  incL3Correct: () => set(s => ({ l3correct: s.l3correct + 1 })),
  finishL3: () => set(s => {
    const bonus = s.l3correct === 5 ? 200 : 0;
    const total = s.l3score + bonus;
    return {
      scores: { ...s.scores, 3: total },
      completed: s.completed.includes(3) ? s.completed : [...s.completed, 3],
      unlocked: s.unlocked.includes(4) ? s.unlocked : [...s.unlocked, 4],
    };
  }),

  startL4: () => set({ l4idx: 0, l4score: 0, l4correct: 0, qState: null }),
  addL4Score: (pts) => set(s => ({ l4score: s.l4score + pts })),
  incL4Idx: () => set(s => ({ l4idx: s.l4idx + 1, qState: null })),
  incL4Correct: () => set(s => ({ l4correct: s.l4correct + 1 })),
  finishL4: () => set(s => {
    const bonus = s.l4correct >= 9 ? 300 : s.l4correct >= 7 ? 150 : s.l4correct >= 5 ? 75 : 0;
    const total = s.l4score + bonus;
    return {
      scores: { ...s.scores, 4: total },
      completed: s.completed.includes(4) ? s.completed : [...s.completed, 4],
      unlocked: s.unlocked.includes(5) ? s.unlocked : [...s.unlocked, 5],
    };
  }),

  startL5: (disasterId) => set({ budget: 10000, bought: [], priceMulti: 1.0, auctScore: 0, disasterId, applied: [], disasterScore: 0 }),
  setBudget: (b) => set({ budget: b }),
  setBought: (b) => set({ bought: b }),
  setPriceMulti: (m) => set({ priceMulti: m }),
  setAuctScore: (s) => set({ auctScore: s }),
  setApplied: (a) => set({ applied: a }),
  setDisasterScore: (s) => set({ disasterScore: s }),
  finalizeL5: () => set(s => {
    const total = s.auctScore + s.disasterScore;
    return {
      scores: { ...s.scores, 5: total },
      completed: s.completed.includes(5) ? s.completed : [...s.completed, 5],
    };
  }),
});
