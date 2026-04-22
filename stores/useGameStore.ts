import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  name: string;
  usn: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  sessionStart: number | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useGameStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      sessionStart: null,
      login: (user) => set({ user, sessionStart: Date.now() }),
      logout: () => set({ user: null, sessionStart: null }),
    }),
    {
      name: 'grss-game-state',
      partialize: (s) => ({ user: s.user, sessionStart: s.sessionStart }),
    }
  )
);
