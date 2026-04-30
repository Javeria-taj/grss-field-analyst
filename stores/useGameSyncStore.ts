import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { toast } from '@/components/ui/Toast';
import { SFX } from '@/lib/sfx';
import { VoiceEngine } from '@/lib/VoiceEngine';
import { ACHIEVEMENTS } from '@/lib/achievements';

// ── Types (mirrored from server protocol) ──
export type GamePhase =
  | 'idle' | 'level_intro' | 'question_active' | 'question_review'
  | 'level_complete' | 'auction_active' | 'disaster_active' | 'game_over' | 'anomaly_active';

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
  streak: number; faction?: string;
}

export interface TelemetryData {
  qIndex: number;
  timeTaken: number;
  correct: boolean;
  points: number;
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

export interface AnomalyPayload {
  type: 'patch' | 'identify';
  targetIds: string[];  // array of 3 distinct error node IDs
  targetId: string;     // legacy fallback (first target)
  gridSize: number;
  timeLimit: number;
}

export interface AnomalyResultPayload {
  success: boolean;
  penalty: number;
  newTotalScore: number;
}

export interface MissionCommentaryPayload {
  text: string;
  mood: 'snarky' | 'encouraging' | 'urgent' | 'celebratory';
}

export interface AnomalyResultPayload {
  success: boolean;
  penalty: number;
  newTotalScore: number;
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
  timerEndTime: number; // epoch ms
  timerTotal: number;
  serverTimeOffset: number; // local - server time

  // Question
  currentQuestion: ClientQuestion | null;

  // My stats (real-time feedback)
  myTotalScore: number;
  myLevelScore: number;
  myAnswer: { correct: boolean; score: number; totalScore?: number; currentLevelScore?: number } | null;
  hasAnswered: boolean;
  myTelemetry: TelemetryData[];

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
  hangmanMaskedWord: string;
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
    bankCount: number; timerEndTime: number;
    levelLimits: Record<number, number>;
  } | null;

  adminLiveStats: {
    distribution: Record<string, number>;
    reactions?: { id: string; emoji: string }[];
    factionScores?: Record<string, number>;
  } | null;

  factionScores: Record<string, number>;
  myStreak: number;
  myAchievements: string[];

  bankQuestions: any[];

  // Preloaded assets
  preloadedAssets: string[];

  // Announcements
  lastAnnouncement: string | null;

  // Anomaly (Sabotage)
  anomalyData: AnomalyPayload | null;
  anomalyResult: AnomalyResultPayload | null;
  hasFixedAnomaly: boolean;        // true once ALL 3 nodes are patched
  anomalyPatchedIds: string[];     // node IDs already patched by this player

  // Mission Commander
  missionCommentary: MissionCommentaryPayload | null;

  // Live UX Feed
  activeReactions: { id: string; emoji: string }[];
  missionEvents: { id: string; type: string; user: string; achievementId?: string; text?: string }[];

  // Toolkit / Powerups
  powerupResult: { type: string; removed?: number[]; distribution?: Record<string, number> } | null;

  // Actions
  init: () => void;
  destroy: () => void;
  submitAnswer: (answer: string | number) => void;
  guessLetter: (letter: string) => void;
  buyTool: (toolId: string) => void;
  sellTool: (toolId: string) => void;
  deployTools: (toolIds: string[]) => void;
  usePowerup: (type: 'radar_pulse' | 'thermal_scan') => void;
  useHint: () => void;
  // Admin actions
  adminStartLevel: (level: number) => void;
  adminPause: () => void;
  adminReset: () => void;
  adminBroadcast: (msg: string) => void;
  adminTimerAdd10: () => void;
  adminTimerPauseResume: () => void;
  adminLoadBank: (questions: any[]) => void;
  adminAddBankQuestion: (question: any) => void;
  adminUpdateBankQuestion: (id: string, updates: any) => void;
  adminDeleteBankQuestion: (id: string) => void;
  adminGetBank: () => void;
  adminUpdateLevelLimit: (level: number, limit: number) => void;
  adminForceEndQuestion: () => void;
  adminKickPlayer: (usn: string) => void;
  adminTriggerAnomaly: () => void;
  adminTriggerScenario: (type: 'solar_flare' | 'data_corruption') => void;
  adminSabotagePlayer: (usn: string) => void;
  sendReaction: (emoji: string) => void;
  submitAnomalyFix: (targetId: string) => void;
  queuedAnswer: string | number | null;
  focusViolation: boolean;
  breachCount: number;
  setFocusViolation: (v: boolean) => void;
}

export const useGameSyncStore = create<GameSyncState>((set, get) => ({
  connected: false,
  socket: null,
  phase: 'idle',
  currentLevel: 0,
  paused: false,
  timerEndTime: 0,
  timerTotal: 0,
  serverTimeOffset: 0,
  currentQuestion: null,
  myTotalScore: 0,
  myLevelScore: 0,
  myAnswer: null,
  hasAnswered: false,
  myTelemetry: [],
  reviewData: null,
  levelIntro: null,
  levelCompleteData: null,
  leaderboard: [],
  hangmanGuessed: [],
  hangmanLives: 6,
  hangmanRevealed: [],
  hangmanWordLength: 0,
  hangmanMaskedWord: '',
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
  adminLiveStats: null,
  bankQuestions: [],
  lastAnnouncement: null,
  preloadedAssets: [],
  factionScores: { team_sentinel: 0, team_landsat: 0, team_modis: 0 },
  myStreak: 0,
  myAchievements: [],
  queuedAnswer: null,
  anomalyData: null,
  anomalyResult: null,
  hasFixedAnomaly: false,
  anomalyPatchedIds: [],
  missionCommentary: null,
  activeReactions: [],
  missionEvents: [],
  powerupResult: null,
  focusViolation: false,
  breachCount: 0,
  setFocusViolation: (v: boolean) => set((state) => {
    if (v && !state.focusViolation) {
      const newCount = state.breachCount + 1;
      // Subsequent offenses: deduct 75 pts and inform server
      if (newCount >= 2 && state.socket) {
        state.socket.emit('focus_breach_penalty');
      }
      return { focusViolation: true, breachCount: newCount };
    }
    return { focusViolation: v };
  }),

  init: () => {
    if (get().socket?.connected) return;

    // Derive socket URL from the browser's current hostname so cross-device
    // LAN testing works (e.g., phone at 192.168.x.x reaches the server).
    const envSocket = process.env.NEXT_PUBLIC_SOCKET_URL;
    const socketUrl = envSocket
      ? envSocket
      : typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:4001`
        : 'http://localhost:4001';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      withCredentials: true,
      query: {
        role: typeof window !== 'undefined' && window.location.pathname === '/projector' ? 'spectator' : 'player'
      }
    });

    socket.on('admin_live_stats', (data: any) => {
      set({ adminLiveStats: data });
      if (data.factionScores) set({ factionScores: data.factionScores });
    });

    socket.on('force_disconnect', (data: { reason: string }) => {
      toast(data.reason || 'Kicked from session', 'err');
      setTimeout(() => window.location.href = '/', 1500);
    });

    socket.on('connect', () => {
      set({ connected: true });
      // Emit full sync request in case of reconnect after server snapshot hydration
      socket.emit('request_full_sync');

      // Offline Grace: check for queued answer in state
      const { queuedAnswer } = get();
      if (queuedAnswer !== null) {
        socket.emit('submit_answer', { answer: queuedAnswer });
        set({ queuedAnswer: null });
        toast('Connection restored. Answer submitted!', 'ok');
      }

      // Legacy fallback: check for pending answer in localStorage
      const pending = localStorage.getItem('grss_pending_answer');
      if (pending) {
        try {
          const { answer, endTime } = JSON.parse(pending);
          if (Date.now() < endTime) {
            socket.emit('submit_answer', { answer });
            toast('Reconnected. Answer submitted!', 'ok');
          }
        } catch (e) { }
        localStorage.removeItem('grss_pending_answer');
      }
    });
    socket.on('disconnect', () => set({ connected: false }));

    // ── Full state sync (late joiners / reconnect) ──
    socket.on('game_state_sync', (data: any) => {
      if (data.serverTime) {
        set({ serverTimeOffset: Date.now() - data.serverTime });
      }
      set({
        phase: data.phase,
        currentLevel: data.currentLevel,
        currentQuestion: data.currentQuestion,
        timerEndTime: data.timerEndTime || 0,
        timerTotal: data.timerTotal,
        leaderboard: data.leaderboard,
        levelIntro: data.levelIntro,
        myTotalScore: data.myScore?.totalScore ?? 0,
        myLevelScore: data.myScore?.currentLevelScore ?? 0,
        myAnswer: data.myAnswer ? { correct: data.myAnswer.correct, score: data.myAnswer.score } : null,
        hasAnswered: !!data.myAnswer,
        hangmanGuessed: data.hangmanState?.guessedLetters ?? [],
        hangmanLives: data.hangmanState?.lives ?? 6,
        hangmanRevealed: data.hangmanState?.revealedPositions ?? [],
        hangmanWordLength: data.hangmanState?.wordLength ?? 0,
        hangmanMaskedWord: data.hangmanState?.maskedWord ?? '',
        auctionBudget: data.auctionState?.budget ?? 10000,
        auctionOwned: data.auctionState?.ownedTools ?? [],
        auctionPrices: data.auctionState?.prices ?? {},
        disasterInfo: data.disasterInfo,
        myTelemetry: data.myScore?.telemetry || [],
        myStreak: data.myScore?.streak ?? 0,
        myAchievements: data.myScore?.achievements || [],
        factionScores: data.factionScores || {},
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
        // Reset hangman for new question
        hangmanGuessed: [], hangmanLives: 6, hangmanRevealed: [],
        hangmanWordLength: data.wordLength ?? 0,
        hangmanMaskedWord: '_'.repeat(data.wordLength ?? 0),
        hangmanSolved: false,
        powerupResult: null,
      });
    });

    // ── Timer Events (rAF based) ──
    socket.on('timer_start', (data: { endTime: number; total: number; serverTime?: number }) => {
      if (data.serverTime) {
        set({ serverTimeOffset: Date.now() - data.serverTime });
      }
      set({ timerEndTime: data.endTime, timerTotal: data.total, hasAnswered: false, myAnswer: null });
    });

    socket.on('timer_override', (data: { endTime: number }) => {
      set({ timerEndTime: data.endTime });
    });

    // ── Preload Asset ──
    socket.on('preload_asset', (data: { url: string }) => {
      set(s => {
        if (!s.preloadedAssets.includes(data.url)) {
          // Trigger browser caching silently
          const img = new Image();
          img.src = data.url;
          return { preloadedAssets: [...s.preloadedAssets, data.url] };
        }
        return s;
      });
    });

    // ── Answer result (immediate personal feedback) ──
    socket.on('answer_result', (data: {
      correct: boolean;
      score: number;
      totalScore?: number;
      currentLevelScore?: number;
      telemetry?: TelemetryData[];
    }) => {
      set(state => ({
        myAnswer: data,
        hasAnswered: true,
        myTotalScore: data.totalScore ?? state.myTotalScore,
        myLevelScore: data.currentLevelScore ?? state.myLevelScore,
        myTelemetry: data.telemetry ?? state.myTelemetry,
        myStreak: (data as any).streak ?? state.myStreak
      }));
    });

    socket.on('penalty_applied', (data: { penalty: number; newTotalScore: number }) => {
      set({ myTotalScore: data.newTotalScore });
      toast(`SECURITY BREACH: ${data.penalty} point penalty applied!`, 'err');
      SFX.glitch();
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

    // ── Mission Commentary (AI) ──
    socket.on('mission_commentary', (data: MissionCommentaryPayload) => {
      set({ missionCommentary: data });
    });

    // ── Game reset ──
    socket.on('game_reset', () => {
      set({
        phase: 'idle', currentLevel: 0, currentQuestion: null,
        myAnswer: null, hasAnswered: false, reviewData: null,
        levelIntro: null, levelCompleteData: null,
        timerEndTime: 0, timerTotal: 0, leaderboard: [],
        hangmanGuessed: [], hangmanLives: 6, hangmanRevealed: [], hangmanSolved: false,
        auctionTools: [], auctionPrices: {}, auctionBudget: 10000,
        auctionOwned: [], disasterInfo: null, deployedTools: [], hasDeployed: false,
        finalLeaderboard: [],
        anomalyData: null, anomalyResult: null, hasFixedAnomaly: false,
        missionCommentary: null,
      });
    });

    // ── Pause ──
    socket.on('game_paused', (data: { paused: boolean }) => {
      set({ paused: data.paused });
    });

    // ── Asset Preloading ──
    socket.on('preload_asset', (data: { url: string }) => {
      if (!data.url) return;
      const img = new Image();
      img.src = data.url;
    });

    // ── Achievements ──
    socket.on('achievement_earned', (id: string) => {
      const achievement = ACHIEVEMENTS[id];
      if (achievement) {
        toast(`🏆 Achievement Unlocked: ${achievement.name}`, 'ok');
        SFX.levelComplete(); // Use levelComplete sound for achievements
      }
      set(s => ({
        myAchievements: [...s.myAchievements, id]
      }));
    });

    // ── Sabotage (Admin Interference) ──
    socket.on('sabotage_event', (data: { type: string; duration: number; message: string }) => {
      if (data.type === 'glitch') {
        toast(`⚠️ ${data.message}`, 'err');
        SFX.error();
        document.body.classList.add('glitch-active');
        setTimeout(() => {
          document.body.classList.remove('glitch-active');
        }, data.duration);
      }
    });

    // ── Hangman result ──
    socket.on('hangman_letter_result', (data: { hit: boolean; positions: number[]; livesLeft: number; solved: boolean; maskedWord?: string }) => {
      set(s => ({
        hangmanRevealed: data.hit ? [...s.hangmanRevealed, ...data.positions] : s.hangmanRevealed,
        hangmanLives: data.livesLeft,
        hangmanSolved: data.solved,
        hangmanMaskedWord: data.maskedWord || s.hangmanMaskedWord,
        hangmanGuessed: s.hangmanGuessed, // already updated optimistically
      }));
    });

    // ── Auction events ──
    socket.on('auction_start', (data: { tools: AuctionToolInfo[]; prices: Record<string, number>; timeLimit: number }) => {
      set({
        phase: 'auction_active', auctionTools: data.tools,
        auctionPrices: data.prices, auctionBudget: 10000,
        auctionOwned: [], auctionMultiplier: 1.0,
      });
    });

    socket.on('auction_price_tick', (data: { prices: Record<string, number>; multiplier: number }) => {
      set({ auctionPrices: data.prices, auctionMultiplier: data.multiplier });
    });

    socket.on('auction_update', (data: { budget: number; ownedTools: string[]; prices: Record<string, number>; success?: boolean; error?: string }) => {
      if (data.success === false && data.error) {
        toast(data.error, 'err');
      }
      set({ auctionBudget: data.budget, auctionOwned: data.ownedTools, auctionPrices: data.prices });
    });

    // ── Disaster events ──
    socket.on('disaster_start', (data: { disaster: DisasterInfo; timeLimit: number }) => {
      set({
        phase: 'disaster_active', disasterInfo: data.disaster,
        deployedTools: [], hasDeployed: false,
      });
    });

    socket.on('deploy_result', (data: { success: boolean }) => {
      if (data.success) set({ hasDeployed: true });
    });

    // ── Admin stats ──
    socket.on('admin_stats', (data: any) => {
      set({ adminStats: data });
    });

    socket.on('bank_questions', (data: any[]) => {
      set({ bankQuestions: data });
    });

    // ── Announcements ──
    socket.on('global_announcement', (msg: string) => {
      set({ lastAnnouncement: msg });
    });

    // ── Anomaly listeners ──
    socket.on('anomaly_detected', (data: AnomalyPayload) => {
      set({
        phase: 'anomaly_active',
        anomalyData: data,
        anomalyResult: null,
        hasFixedAnomaly: false,
        anomalyPatchedIds: [],   // fresh slate for each anomaly
      });
      SFX.glitch();
    });

    socket.on('anomaly_fix_success', (data: { targetId: string }) => {
      // Track which nodes this player has patched locally
      const { anomalyData, anomalyPatchedIds } = get();
      const newPatched = [...anomalyPatchedIds, data.targetId];
      const totalTargets = anomalyData?.targetIds?.length ?? 1;
      const allPatched = newPatched.length >= totalTargets;
      set({ anomalyPatchedIds: newPatched, hasFixedAnomaly: allPatched });
      if (allPatched) SFX.success();
      else SFX.correct(); // Partial patch confirmation
    });

    socket.on('anomaly_resolved', (data: AnomalyResultPayload) => {
      set({ anomalyResult: data, myTotalScore: data.newTotalScore });
      if (!data.success) {
        SFX.alarm();
        toast(`SECURITY BREACH: -${data.penalty} POINTS`, 'err');
      } else {
        toast('FIREWALL PATCHED', 'ok');
      }
    });

    socket.on('anomaly_cleared', () => {
      set({ phase: 'idle', anomalyData: null });
    });

    socket.on('targeted_sabotage', (data: { type: string }) => {
      if (data.type === 'glitch') {
        document.body.classList.add('glitch-active');
        setTimeout(() => document.body.classList.remove('glitch-active'), 3000);
      }
      SFX.glitch();
    });

    // ── Live UX Feed ──
    socket.on('reaction_broadcast', (data: { id: string; emoji: string }) => {
      set(s => ({ activeReactions: [...s.activeReactions, data].slice(-30) }));
      setTimeout(() => {
        set(s => ({ activeReactions: s.activeReactions.filter(r => r.id !== data.id) }));
      }, 4000);
    });

    socket.on('mission_event', (data: any) => {
      const event = { ...data, id: Math.random().toString(36).slice(2, 9) };
      set(s => ({ missionEvents: [event, ...s.missionEvents].slice(0, 5) }));
      setTimeout(() => {
        set(s => ({ missionEvents: s.missionEvents.filter(e => e.id !== event.id) }));
      }, 6000);
    });

    socket.on('powerup_result', (data: any) => {
      if (data.success) {
        set({ powerupResult: data });
        SFX.success();
      } else {
        toast(data.error || 'Toolkit failed', 'err');
        SFX.wrong();
      }
    });

    // ── Mission Commander ──
    socket.on('mission_commander_comment', (data: MissionCommentaryPayload) => {
      set({ missionCommentary: data });
      // Clear after 10 seconds
      setTimeout(() => set({ missionCommentary: null }), 10000);
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
    const { socket, hasAnswered, timerEndTime } = get();
    if (hasAnswered) return;

    if (!socket?.connected) {
      // Offline Grace: Store in state and localStorage (for persistence)
      set({ queuedAnswer: answer, hasAnswered: true });
      localStorage.setItem('grss_pending_answer', JSON.stringify({
        answer,
        endTime: timerEndTime
      }));
      toast('Network unstable. Answer queued!', 'inf');
      return;
    }

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
    SFX.click();
    socket.emit('buy_tool', { toolId });
  },

  sellTool: (toolId) => {
    const { socket } = get();
    if (!socket?.connected) return;
    SFX.click();
    socket.emit('sell_tool', { toolId });
  },

  deployTools: (toolIds) => {
    const { socket, hasDeployed } = get();
    if (!socket?.connected || hasDeployed) return;
    SFX.click();
    set({ deployedTools: toolIds });
    socket.emit('deploy_tools', { toolIds });
  },

  usePowerup: (type) => {
    const { socket } = get();
    if (!socket?.connected) return;
    socket.emit('use_powerup', { type });
  },

  useHint: () => {
    const { socket } = get();
    if (!socket?.connected) return;
    socket.emit('use_hint');
    // Optimistic local deduction so UI updates immediately
    set(s => ({ myTotalScore: Math.max(0, s.myTotalScore - 50) }));
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

  adminTimerAdd10: () => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_timer_add_10');
  },

  adminTimerPauseResume: () => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_timer_pause_resume');
  },

  adminLoadBank: (questions) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_load_bank', { questions });
  },

  adminAddBankQuestion: (question) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_add_bank_question', { question });
  },

  adminUpdateBankQuestion: (id, updates) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_update_bank_question', { id, updates });
  },

  adminTriggerAnomaly: () => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_trigger_anomaly');
  },

  adminTriggerScenario: (type) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_trigger_scenario', { type });
  },

  adminDeleteBankQuestion: (id) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_delete_bank_question', { id });
  },

  adminGetBank: () => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_get_bank');
  },
  adminUpdateLevelLimit: (level, limit) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_update_level_limit', { level, limit });
  },
  adminForceEndQuestion: () => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_force_end_question');
  },
  adminKickPlayer: (usn) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_kick_player', { usn });
  },

  adminSabotagePlayer: (usn) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('admin_sabotage_player', { usn });
  },

  sendReaction: (emoji) => {
    const { socket } = get();
    if (socket?.connected) socket.emit('reaction', emoji);
  },

  submitAnomalyFix: (targetId) => {
    const { socket, hasFixedAnomaly, anomalyPatchedIds } = get();
    // Don't submit if fully resolved or this specific node is already patched
    if (!socket?.connected || hasFixedAnomaly) return;
    if (anomalyPatchedIds.includes(targetId)) return;
    socket.emit('submit_anomaly_fix', { targetId });
  },
}));
