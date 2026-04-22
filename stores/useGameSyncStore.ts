'use client';
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// ── Types (mirrored from server protocol) ──
export type GamePhase =
  | 'idle' | 'level_intro' | 'question_active' | 'question_review'
  | 'level_complete' | 'auction_active' | 'disaster_active' | 'game_over';

export interface ClientQuestion {
  index: number; total: number;
  type: 'scramble' | 'riddle' | 'image_mcq' | 'hangman' | 'mcq';
  timeLimit: number; points: number;
  scrambled?: string; question?: string; hint?: string; category?: string;
  imageUrl?: string; options?: string[];
  emoji?: string; wordLength?: number; difficulty?: number;
}

export interface LeaderboardEntry {
  rank: number; name: string; usn: string;
  totalScore: number; currentLevelScore: number;
}

export interface LevelIntroPayload {
  level: number; icon: string; badge: string; title: string;
  story: string; rules: string; startsIn: number;
}

export interface QuestionEndPayload {
  correctAnswer: string; explanation: string;
  stats: { totalPlayers: number; answeredCount: number; correctCount: number; avgTimeUsed: number };
}

export interface LevelCompletePayload {
  level: number; leaderboard: LeaderboardEntry[];
  levelStats: { totalQuestions: number; avgAccuracy: number; topScorer: { name: string; usn: string; score: number } | null };
}

export interface DisasterInfo {
  id: string; name: string; icon: string; color: string; desc: string; metrics: string[];
}

export interface AuctionToolInfo {
  id: string; name: string; price: number; icon: string; desc: string;
}

// ── Store State ──
interface GameSyncState {
  // Connection
  connected: boolean;
  socket: Socket | null;

  // Game state
  phase: GamePhase;
  currentLevel: number;
  paused: boolean;

  // Timer (server-authoritative)
  timerRemaining: number;
  timerTotal: number;

  // Question
  currentQuestion: ClientQuestion | null;

  // My answer
  myAnswer: { correct: boolean; score: number } | null;
  hasAnswered: boolean;

  // Review
  reviewData: QuestionEndPayload | null;

  // Level intro
  levelIntro: LevelIntroPayload | null;

  // Level complete
  levelCompleteData: LevelCompletePayload | null;

  // Leaderboard
  leaderboard: LeaderboardEntry[];

  // Level 3 — Hangman
  hangmanGuessed: string[];
  hangmanLives: number;
  hangmanRevealed: number[];
  hangmanWordLength: number;
  hangmanSolved: boolean;

  // Level 5 — Auction
  auctionTools: AuctionToolInfo[];
  auctionPrices: Record<string, number>;
  auctionBudget: number;
  auctionOwned: string[];
  auctionMultiplier: number;

  // Level 5 — Disaster
  disasterInfo: DisasterInfo | null;
  deployedTools: string[];
  hasDeployed: boolean;

  // Game over
  finalLeaderboard: LeaderboardEntry[];

  // Admin stats
  adminStats: {
    connectedCount: number; phase: GamePhase; currentLevel: number;
    currentQIndex: number; totalQuestions: number;
    answeredCount: number; totalPlayers: number;
  } | null;

  // Announcements
  lastAnnouncement: string | null;

  // Actions
  init: () => void;
  destroy: () => void;
  submitAnswer: (answer: string | number) => void;
  guessLetter: (letter: string) => void;
  buyTool: (toolId: string) => void;
  sellTool: (toolId: string) => void;
  deployTools: (toolIds: string[]) => void;
  // Admin actions
  adminStartLevel: (level: number) => void;
  adminPause: () => void;
  adminReset: () => void;
  adminBroadcast: (msg: string) => void;
}

export const useGameSyncStore = create<GameSyncState>((set, get) => ({
  connected: false,
  socket: null,
  phase: 'idle',
  currentLevel: 0,
  paused: false,
  timerRemaining: 0,
  timerTotal: 0,
  currentQuestion: null,
  myAnswer: null,
  hasAnswered: false,
  reviewData: null,
  levelIntro: null,
  levelCompleteData: null,
  leaderboard: [],
  hangmanGuessed: [],
  hangmanLives: 6,
  hangmanRevealed: [],
  hangmanWordLength: 0,
  hangmanSolved: false,
  auctionTools: [],
  auctionPrices: {},
  auctionBudget: 10000,
  auctionOwned: [],
  auctionMultiplier: 1.0,
  disasterInfo: null,
  deployedTools: [],
  hasDeployed: false,
  finalLeaderboard: [],
  adminStats: null,
  lastAnnouncement: null,

  init: () => {
    if (get().socket?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4001';
    const socket = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    // ── Full state sync (late joiners / reconnect) ──
    socket.on('game_state_sync', (data: any) => {
      set({
        phase: data.phase,
        currentLevel: data.currentLevel,
        currentQuestion: data.currentQuestion,
        timerRemaining: data.timerRemaining,
        timerTotal: data.timerTotal,
        leaderboard: data.leaderboard,
        levelIntro: data.levelIntro,
        myAnswer: data.myAnswer ? { correct: data.myAnswer.correct, score: data.myAnswer.score } : null,
        hasAnswered: !!data.myAnswer,
        hangmanGuessed: data.hangmanState?.guessedLetters ?? [],
        hangmanLives: data.hangmanState?.lives ?? 6,
        hangmanRevealed: data.hangmanState?.revealedPositions ?? [],
        hangmanWordLength: data.hangmanState?.wordLength ?? 0,
        auctionBudget: data.auctionState?.budget ?? 10000,
        auctionOwned: data.auctionState?.ownedTools ?? [],
        auctionPrices: data.auctionState?.prices ?? {},
        disasterInfo: data.disasterInfo,
      });
    });

    // ── Level intro ──
    socket.on('level_intro', (data: LevelIntroPayload) => {
      set({
        phase: 'level_intro', levelIntro: data, currentLevel: data.level,
        currentQuestion: null, myAnswer: null, hasAnswered: false,
        reviewData: null, levelCompleteData: null,
        hangmanGuessed: [], hangmanLives: 6, hangmanRevealed: [], hangmanSolved: false,
      });
    });

    // ── Question start ──
    socket.on('question_start', (data: ClientQuestion) => {
      set({
        phase: 'question_active', currentQuestion: data,
        myAnswer: null, hasAnswered: false, reviewData: null,
        timerRemaining: data.timeLimit, timerTotal: data.timeLimit,
        // Reset hangman for new question
        hangmanGuessed: [], hangmanLives: 6, hangmanRevealed: [],
        hangmanWordLength: data.wordLength ?? 0, hangmanSolved: false,
      });
    });

    // ── Timer tick ──
    socket.on('timer_tick', (data: { remaining: number; total: number }) => {
      set({ timerRemaining: data.remaining, timerTotal: data.total });
    });

    // ── Answer result (individual) ──
    socket.on('answer_result', (data: { correct: boolean; score: number }) => {
      set({ myAnswer: data, hasAnswered: true });
    });

    // ── Question review ──
    socket.on('question_end', (data: QuestionEndPayload) => {
      set({ phase: 'question_review', reviewData: data });
    });

    // ── Leaderboard ──
    socket.on('leaderboard_update', (data: LeaderboardEntry[]) => {
      set({ leaderboard: data });
    });

    // ── Level complete ──
    socket.on('level_complete', (data: LevelCompletePayload) => {
      set({ phase: 'level_complete', levelCompleteData: data, leaderboard: data.leaderboard });
    });

    // ── Game over ──
    socket.on('game_over', (data: { finalLeaderboard: LeaderboardEntry[] }) => {
      set({ phase: 'game_over', finalLeaderboard: data.finalLeaderboard });
    });

    // ── Game reset ──
    socket.on('game_reset', () => {
      set({
        phase: 'idle', currentLevel: 0, currentQuestion: null,
        myAnswer: null, hasAnswered: false, reviewData: null,
        levelIntro: null, levelCompleteData: null,
        timerRemaining: 0, timerTotal: 0, leaderboard: [],
        hangmanGuessed: [], hangmanLives: 6, hangmanRevealed: [], hangmanSolved: false,
        auctionTools: [], auctionPrices: {}, auctionBudget: 10000,
        auctionOwned: [], disasterInfo: null, deployedTools: [], hasDeployed: false,
        finalLeaderboard: [],
      });
    });

    // ── Pause ──
    socket.on('game_paused', (data: { paused: boolean }) => {
      set({ paused: data.paused });
    });

    // ── Hangman result ──
    socket.on('hangman_letter_result', (data: { hit: boolean; positions: number[]; livesLeft: number; solved: boolean }) => {
      set(s => ({
        hangmanRevealed: data.hit ? [...s.hangmanRevealed, ...data.positions] : s.hangmanRevealed,
        hangmanLives: data.livesLeft,
        hangmanSolved: data.solved,
        hangmanGuessed: s.hangmanGuessed, // already updated optimistically
      }));
    });

    // ── Auction events ──
    socket.on('auction_start', (data: { tools: AuctionToolInfo[]; prices: Record<string, number>; timeLimit: number }) => {
      set({
        phase: 'auction_active', auctionTools: data.tools,
        auctionPrices: data.prices, auctionBudget: 10000,
        auctionOwned: [], auctionMultiplier: 1.0,
        timerRemaining: data.timeLimit, timerTotal: data.timeLimit,
      });
    });

    socket.on('auction_price_tick', (data: { prices: Record<string, number>; multiplier: number }) => {
      set({ auctionPrices: data.prices, auctionMultiplier: data.multiplier });
    });

    socket.on('auction_update', (data: { success: boolean; budget: number; owned: string[]; error?: string }) => {
      if (data.success) {
        set({ auctionBudget: data.budget, auctionOwned: data.owned });
      }
    });

    // ── Disaster events ──
    socket.on('disaster_start', (data: { disaster: DisasterInfo; timeLimit: number }) => {
      set({
        phase: 'disaster_active', disasterInfo: data.disaster,
        deployedTools: [], hasDeployed: false,
        timerRemaining: data.timeLimit, timerTotal: data.timeLimit,
      });
    });

    socket.on('deploy_result', (data: { success: boolean }) => {
      if (data.success) set({ hasDeployed: true });
    });

    // ── Admin stats ──
    socket.on('admin_stats', (data: any) => {
      set({ adminStats: data });
    });

    // ── Announcements ──
    socket.on('global_announcement', (msg: string) => {
      set({ lastAnnouncement: msg });
    });

    // ── Admin error ──
    socket.on('admin_error', (data: { error: string }) => {
      console.warn('Admin error:', data.error);
    });

    set({ socket });
  },

  destroy: () => {
    const { socket } = get();
    if (socket) { socket.disconnect(); set({ socket: null, connected: false }); }
  },

  // ── Player Actions ──
  submitAnswer: (answer) => {
    const { socket, hasAnswered } = get();
    if (!socket?.connected || hasAnswered) return;
    socket.emit('submit_answer', { answer });
  },

  guessLetter: (letter) => {
    const { socket, hangmanGuessed, hangmanSolved } = get();
    if (!socket?.connected || hangmanSolved) return;
    const upper = letter.toUpperCase();
    if (hangmanGuessed.includes(upper)) return;
    set(s => ({ hangmanGuessed: [...s.hangmanGuessed, upper] })); // Optimistic
    socket.emit('guess_letter', { letter: upper });
  },

  buyTool: (toolId) => {
    const { socket } = get();
    if (!socket?.connected) return;
    socket.emit('buy_tool', { toolId });
  },

  sellTool: (toolId) => {
    const { socket } = get();
    if (!socket?.connected) return;
    socket.emit('sell_tool', { toolId });
  },

  deployTools: (toolIds) => {
    const { socket, hasDeployed } = get();
    if (!socket?.connected || hasDeployed) return;
    set({ deployedTools: toolIds });
    socket.emit('deploy_tools', { toolIds });
  },

  // ── Admin Actions ──
  adminStartLevel: (level) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_start_level', { level });
  },

  adminPause: () => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_pause_game');
  },

  adminReset: () => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_reset_game');
  },

  adminBroadcast: (msg) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_global_broadcast', msg);
  },
}));
