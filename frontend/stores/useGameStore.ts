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
      }),
    }
  )
);
