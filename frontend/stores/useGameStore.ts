'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { ProgressSlice, createProgressSlice } from './slices/progressSlice';
import { LevelSlice, createLevelSlice } from './slices/levelSlice';

export type GameState = AuthSlice & ProgressSlice & LevelSlice;

export const useGameStore = create<GameState>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createProgressSlice(set, get, api),
      ...createLevelSlice(set, get, api),
    }),
    {
      name: 'grss-game-state',
      partialize: (s) => ({
        user: s.user,
        sessionStart: s.sessionStart,
        scores: s.scores,
        powerups: s.powerups,
        unlocked: s.unlocked,
        completed: s.completed,
        telemetry: s.telemetry,
        l1idx: s.l1idx, l1score: s.l1score, l1correct: s.l1correct, l1q: s.l1q,
        l2idx: s.l2idx, l2score: s.l2score, l2correct: s.l2correct,
        l3idx: s.l3idx, l3score: s.l3score, l3correct: s.l3correct, l3guessed: s.l3guessed, l3lives: s.l3lives, l3hintGiven: s.l3hintGiven,
        l4idx: s.l4idx, l4score: s.l4score, l4correct: s.l4correct,
        budget: s.budget, bought: s.bought, priceMulti: s.priceMulti, auctScore: s.auctScore, disasterId: s.disasterId, applied: s.applied, disasterScore: s.disasterScore
      }),
    }
  )
);
