// ============================================================
// GRSS FIELD ANALYST — Synchronized Game Protocol Types
// ============================================================

export type GamePhase =
  | 'idle'
  | 'level_intro'
  | 'question_active'
  | 'question_review'
  | 'level_complete'
  | 'auction_active'
  | 'disaster_active'
  | 'game_over'
  | 'anomaly_active';

// ── Question Bank (admin-editable, server-side with answers) ──
export type BankQuestionType = 'scramble' | 'riddle' | 'image_mcq' | 'hangman' | 'mcq';

export interface BankQuestion {
  id: string;            // uuid
  level: number;         // 1-5 (which mission this question belongs to)
  type: BankQuestionType;
  // Common
  points: number;
  timerLimit: number;    // seconds
  hint1?: string;
  hint2?: string;
  imageUrl?: string;     // CDN URL from Vercel Blob (never base64)
  // Text question / scramble / riddle
  questionText?: string; // the main question body
  scrambledText?: string;// pre-scrambled word for scramble type
  answer: string;        // correct answer (UPPERCASE, stripped) — shown in admin, NEVER sent to client
  // MCQ / image_mcq
  options?: string[];    // A/B/C/D choices
  correctOptionIndex?: number; // 0-based index
  // Hangman
  word?: string;         // the word — NEVER sent to client
  // Metadata
  category?: string;
  difficulty?: 1 | 2 | 3;
  explanation?: string;  // shown at review — NEVER sent during active question
}

export interface TelemetryData {
  qIndex: number;
  timeTaken: number;
  correct: boolean;
  points: number;
}

// ── Player State ──
export interface PlayerScore {
  usn: string;
  name: string;
  totalScore: number;
  levelScores: Record<number, number>;
  currentLevelScore: number;
  telemetry: TelemetryData[];
  streak: number;
  achievements: string[]; // IDs
  faction?: string;
}

export interface PlayerAnswer {
  usn: string;
  answer: string | number;
  timeRemaining: number;
  correct: boolean;
  score: number;
  totalScore: number;
  currentLevelScore: number;
  telemetry: TelemetryData[];
}

export interface HangmanPlayerState {
  guessedLetters: string[];
  lives: number;
  revealedPositions: number[];
  solved: boolean;
  submitted: boolean;
}

export interface AuctionPlayerState {
  budget: number;
  ownedTools: string[];
  deployed: string[];
  submitted: boolean;
}

// ── Client Question (SANITISED — no answers, no words, no explanations) ──
export interface ClientQuestion {
  index: number;
  total: number;
  type: 'scramble' | 'riddle' | 'image_mcq' | 'hangman' | 'mcq';
  timeLimit: number;
  points: number;
  // Scramble
  scrambled?: string;
  // Riddle / MCQ
  question?: string;
  options?: string[];
  // Shared
  hint?: string;
  hint2?: string;
  category?: string;
  imageUrl?: string;
  // Hangman
  emoji?: string;
  wordLength?: number;
  // MCQ
  difficulty?: number;
}
// TypeScript guard — answer/word/explanation must NEVER appear here.
type _NoBannedFields = Exclude<keyof ClientQuestion, 'answer' | 'word' | 'explanation'>;
// If the above line fails to compile, you added a banned field to ClientQuestion.

// ── Timer ──
export interface TimerStartPayload {
  endTime: number; // epoch ms — client counts down locally
  total: number;   // total seconds (for progress bar %)
  serverTime: number; // current server time for offset calculation
}

export interface TimerOverridePayload {
  endTime: number; // updated epoch ms after +10s or pause/resume
}

// ── Intro / Review / Complete ──
export interface LevelIntroPayload {
  level: number;
  icon: string;
  badge: string;
  title: string;
  story: string;
  rules: string;
  startsIn: number;
}

export interface QuestionEndPayload {
  correctAnswer: string;
  explanation: string;
  stats: {
    totalPlayers: number;
    answeredCount: number;
    correctCount: number;
    avgTimeUsed: number;
  };
}

export interface LevelCompletePayload {
  level: number;
  leaderboard: LeaderboardEntry[];
  levelStats: {
    totalQuestions: number;
    avgAccuracy: number;
    topScorer: { name: string; usn: string; score: number } | null;
  };
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  usn: string;
  totalScore: number;
  currentLevelScore: number;
  streak: number;
  faction?: string;
}

// ── Auction / Disaster ──
export interface AuctionToolInfo {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
}

export interface DisasterInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  metrics: string[];
}

// ── Full state sync (reconnect) ──
export interface GameStateSync {
  phase: GamePhase;
  currentLevel: number;
  currentQuestion: ClientQuestion | null;
  timerEndTime: number;   // epoch ms (replaces timerRemaining)
  timerTotal: number;
  serverTime: number;     // current server time
  leaderboard: LeaderboardEntry[];
  levelIntro: LevelIntroPayload | null;
  reviewData: QuestionEndPayload | null;
  myScore: PlayerScore | null;
  myAnswer: PlayerAnswer | null;
  hangmanState: {
    guessedLetters: string[];
    lives: number;
    revealedPositions: number[];
    wordLength: number;
    maskedWord: string;
  } | null;
  auctionState: {
    budget: number;
    ownedTools: string[];
    prices: Record<string, number>;
  } | null;
  disasterInfo: DisasterInfo | null;
  factionScores?: Record<string, number>;
}

// ── Admin ──
export interface AdminStatsPayload {
  connectedCount: number;
  phase: GamePhase;
  currentLevel: number;
  currentQIndex: number;
  totalQuestions: number;
  answeredCount: number;
  totalPlayers: number;
  bankCount: number;       // number of questions currently in the bank
  timerEndTime: number;
  levelLimits: Record<number, number>;
}

export interface AdminLiveStatsPayload {
  distribution: Record<string, number>; // e.g., {"A": 10, "B": 5} or {"SATELLITE": 2}
  reactions?: { id: string; emoji: string }[];
  factionScores?: Record<string, number>;
}

// ── Anomaly ──
export interface AnomalyPayload {
  type: 'patch' | 'identify';
  anomalyType: 'whack_a_mole' | 'sliders' | 'wire_routing' | 'overload';
  targetIds: string[];  // array of target node IDs or WIN_TOKEN
  /** @deprecated use targetIds — kept for legacy client compatibility */
  targetId: string;     // first target, for display fallback
  gridSize: number;
  timeLimit: number;
}

export interface AnomalyResultPayload {
  success: boolean;
  penalty: number;
  newTotalScore: number;
}

// ── Mission Commander ──
export interface MissionCommentaryPayload {
  text: string;
  mood: 'snarky' | 'encouraging' | 'urgent' | 'celebratory';
}
