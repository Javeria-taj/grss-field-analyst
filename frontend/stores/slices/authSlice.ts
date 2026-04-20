import { StateCreator } from 'zustand';
import type { User } from '@/lib/types';

export type { User };

export interface AuthSlice {
  user: User | null;
  sessionStart: number | null;
  login: (user: User) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  sessionStart: null,
  login: (user) => set({ user, sessionStart: Date.now() }),
  logout: () => set({ user: null, sessionStart: null }),
});
