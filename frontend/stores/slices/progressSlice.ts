import { StateCreator } from 'zustand';

export const defaultPowerups = { hint: 2, skip: 1, freeze: 1 };

export interface ProgressSlice {
  unlocked: number[];
  completed: number[];
  scores: Record<number, number>;
  powerups: { hint: number; skip: number; freeze: number };
  
  usePowerup: (type: 'hint' | 'skip' | 'freeze') => boolean;
  resetPowerups: () => void;
  resetProgress: () => void;
}

export const createProgressSlice: StateCreator<ProgressSlice> = (set, get) => ({
  unlocked: [1],
  completed: [],
  scores: {},
  powerups: { ...defaultPowerups },

  usePowerup: (type) => {
    const { powerups } = get();
    if (powerups[type] <= 0) return false;
    set((s) => ({ powerups: { ...s.powerups, [type]: s.powerups[type] - 1 } }));
    return true;
  },
  resetPowerups: () => set({ powerups: { ...defaultPowerups } }),
  resetProgress: () => set({
    unlocked: [1],
    completed: [],
    scores: {},
    powerups: { ...defaultPowerups },
  }),
});
