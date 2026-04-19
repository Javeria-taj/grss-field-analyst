import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface LeaderboardEntry {
  name: string;
  usn: string;
  score: number;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  socket: Socket | null;
  init: () => void;
  submitScore: (entry: LeaderboardEntry) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  socket: null,

  init: () => {
    if (get().socket) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

    socket.on('leaderboard_update', (data: LeaderboardEntry[]) => {
      set({ entries: data });
    });

    set({ socket });
  },

  submitScore: (entry) => {
    const socket = get().socket;
    if (socket) {
      socket.emit('submit_score', entry);
    }
  },
}));
