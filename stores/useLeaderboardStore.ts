import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { LeaderboardEntry, ScorePayload } from '@/lib/types';
import { toast } from '@/components/ui/Toast';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  connected: boolean;
  socket: Socket | null;
  init: () => void;
  destroy: () => void;
  submitScore: (entry: ScorePayload & { progress?: any }) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  connected: false,
  socket: null,

  init: () => {
    if (get().socket?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const socket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('leaderboard_update', (data: LeaderboardEntry[]) => {
      set({ entries: data });
    });

    socket.on('global_announcement', (msg: string) => {
      toast(`📡 HQ BROADCAST: ${msg}`, 'inf');
    });

    set({ socket });
  },

  destroy: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },

  submitScore: (entry) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('submit_score', entry);
    }
  },
}));
