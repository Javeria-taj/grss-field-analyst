import mongoose, { Schema, Document, Model } from 'mongoose';

// ── GameSnapshot ─────────────────────────────────────────────
// Persists engine state every 10 seconds.
// On PM2 restart / crash, GameEngine hydrates from this document
// so the live game is never reset for 250 players.
// ─────────────────────────────────────────────────────────────

export interface IGameSnapshot extends Document {
  sessionId: string;
  phase: string;
  currentLevel: number;
  currentQIndex: number;
  endTime: number;       // epoch ms of current timer end
  timerTotal: number;
  paused: boolean;
  playerScores: Array<{
    usn: string;
    name: string;
    totalScore: number;
    levelScores: Record<string, number>;
    currentLevelScore: number;
  }>;
  questionBank: any[];  // serialised BankQuestion[]
  auctionStates: any[];
  updatedAt: Date;
}

const GameSnapshotSchema = new Schema<IGameSnapshot>({
  sessionId:     { type: String, default: 'live', unique: true, index: true },
  phase:         { type: String, default: 'idle' },
  currentLevel:  { type: Number, default: 0 },
  currentQIndex: { type: Number, default: 0 },
  endTime:       { type: Number, default: 0 },
  timerTotal:    { type: Number, default: 0 },
  paused:        { type: Boolean, default: false },
  playerScores:  [{ type: Schema.Types.Mixed }],
  questionBank:  [{ type: Schema.Types.Mixed }],
  auctionStates: [{ type: Schema.Types.Mixed }],
  updatedAt:     { type: Date, default: Date.now },
});

// Only keep ONE snapshot document per game session
GameSnapshotSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const GameSnapshot: Model<IGameSnapshot> =
  mongoose.models.GameSnapshot ||
  mongoose.model<IGameSnapshot>('GameSnapshot', GameSnapshotSchema);
