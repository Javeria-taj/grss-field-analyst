import { StateCreator } from 'zustand';
import type { TelemetryRecord } from '@/lib/types';

export const defaultPowerups = { hint: 2, skip: 1, freeze: 1 };

export interface ProgressSlice {
  unlocked: number[];
  completed: number[];
  scores: Record<number, number>;
  powerups: { hint: number; skip: number; freeze: number };
  telemetry: TelemetryRecord[];
  
  usePowerup: (type: 'hint' | 'skip' | 'freeze') => boolean;
  resetPowerups: () => void;
  resetProgress: () => void;
  addTelemetry: (record: TelemetryRecord) => void;
}

export const createProgressSlice: StateCreator<ProgressSlice> = (set, get) => ({
  unlocked: [1],
  completed: [],
  scores: {},
  powerups: { ...defaultPowerups },
  telemetry: [],

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
    telemetry: [],
  }),
  addTelemetry: (record) => set((s) => ({ telemetry: [...s.telemetry, record] })),
});

