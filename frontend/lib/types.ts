// ============================================
// GRSS FIELD ANALYST — Shared TypeScript Types
// ============================================

export interface User {
  name: string;
  usn: string;
  isAdmin?: boolean;
  // Progress
  unlocked?: number[];
  completed?: number[];
  scores?: Record<number, number>;
  powerups?: Powerups;
  telemetry?: TelemetryRecord[];
  totalScore?: number;
  levelState?: any;
}

export interface LeaderboardEntry {
  name: string;
  usn: string;
  score: number;
  date?: string | Date;
}

export type PowerupType = 'hint' | 'skip' | 'freeze';

export interface Powerups {
  hint: number;
  skip: number;
  freeze: number;
}

export type FeedbackType = 'ok' | 'bad' | 'timeout' | 'info';
export type ToastType = 'ok' | 'err' | 'inf';

export interface ApiResponse<T = unknown> {
  status: 'online' | 'offline' | 'error';
  data?: T;
  error?: string;
}

export interface ScorePayload {
  name: string;
  usn: string;
  score: number;
}

export interface TelemetryRecord {
  id: string; // e.g. "L1-Q3"
  level: number;
  question: string;
  isCorrect: boolean;
  timeTaken: number;
  timestamp: number;
}

