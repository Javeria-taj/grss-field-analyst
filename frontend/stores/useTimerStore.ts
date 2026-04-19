'use client';
import { create } from 'zustand';
import { SFX } from '@/lib/sfx';

interface TimerState {
  timeVal: number;
  timeMax: number;
  frozen: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  halfwayTimeoutId: ReturnType<typeof setTimeout> | null;

  startTimer: (sec: number, onDone: () => void, onHalfway?: () => void) => void;
  stopTimer: () => void;
  freeze: () => void;
  unfreeze: () => void;
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  timeVal: 0,
  timeMax: 0,
  frozen: false,
  intervalId: null,
  halfwayTimeoutId: null,

  startTimer: (sec, onDone, onHalfway) => {
    get().stopTimer();
    set({ timeVal: sec, timeMax: sec, frozen: false });

    let halfwayId: ReturnType<typeof setTimeout> | null = null;
    if (onHalfway) {
      halfwayId = setTimeout(() => {
        if (!get().frozen) onHalfway();
      }, Math.floor(sec / 2) * 1000);
    }

    const id = setInterval(() => {
      const { frozen, timeVal } = get();
      if (frozen) return;
      const newVal = timeVal - 1;
      set({ timeVal: newVal });
      if (newVal <= 10 && newVal > 0) SFX.tick();
      if (newVal <= 5 && newVal > 0) SFX.urgency();
      if (newVal <= 0) {
        get().stopTimer();
        onDone();
      }
    }, 1000);

    set({ intervalId: id, halfwayTimeoutId: halfwayId });
  },

  stopTimer: () => {
    const { intervalId, halfwayTimeoutId } = get();
    if (intervalId) clearInterval(intervalId);
    if (halfwayTimeoutId) clearTimeout(halfwayTimeoutId);
    set({ intervalId: null, halfwayTimeoutId: null });
  },

  freeze: () => set({ frozen: true }),
  unfreeze: () => set({ frozen: false }),
}));
