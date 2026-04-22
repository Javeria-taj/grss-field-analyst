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
  | 'game_over';

export interface PlayerScore {
  usn: string;
  name: string;
  totalScore: number;
  levelScores: Record<number, number>;
  currentLevelScore: number;
}

export interface PlayerAnswer {
  usn: string;
  answer: string | number;
  timeRemaining: number;
  correct: boolean;
  score: number;
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

export interface ClientQuestion {
  index: number;
  total: number;
  type: 'scramble' | 'riddle' | 'image_mcq' | 'hangman' | 'mcq';
  timeLimit: number;
  points: number;
  scrambled?: string;
  question?: string;
  hint?: string;
  category?: string;
  imageUrl?: string;
  options?: string[];
  emoji?: string;
  wordLength?: number;
  difficulty?: number;
}

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
}

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

export interface GameStateSync {
  phase: GamePhase;
  currentLevel: number;
  currentQuestion: ClientQuestion | null;
  timerRemaining: number;
  timerTotal: number;
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
  } | null;
  auctionState: {
    budget: number;
    ownedTools: string[];
    prices: Record<string, number>;
  } | null;
  disasterInfo: DisasterInfo | null;
}

export interface AdminStatsPayload {
  connectedCount: number;
  phase: GamePhase;
  currentLevel: number;
  currentQIndex: number;
  totalQuestions: number;
  answeredCount: number;
  totalPlayers: number;
}
