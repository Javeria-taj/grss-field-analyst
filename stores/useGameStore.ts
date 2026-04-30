import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  name: string;
  usn: string;
  isAdmin?: boolean;
  faction?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  sessionStart: number | null;
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  rehydrateFromCookie: () => Promise<void>;
}

export const useGameStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionStart: null,
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),
      login: (user) => set({ user, sessionStart: Date.now() }),
      logout: () => set({ user: null, sessionStart: null }),

      // Fallback: if localStorage was cleared but the HTTP-only cookie is still valid,
      // call /api/auth/me to recover the session without requiring re-login.
      rehydrateFromCookie: async () => {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'ok' && data.user) {
              const { name, usn, isAdmin, faction, token } = data.user;
              set({ user: { name, usn, isAdmin, faction, token }, sessionStart: Date.now() });
            }
          }
        } catch {
          // Network error — user will see the login page
        }
      },
    }),
    {
      name: 'grss-game-state',
      partialize: (s) => ({ user: s.user, sessionStart: s.sessionStart }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);
