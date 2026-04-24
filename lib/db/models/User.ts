import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  usn: string;
  score: number;
  lastActive: Date;
  isAdmin: boolean;
  // Enhanced Progress Data
  unlocked: number[];
  completed: number[];
  scores: Record<string, number>;
  powerups: { hint: number; skip: number; freeze: number };
  telemetry: any[];
  levelState?: {
    l1idx: number; l1score: number; l1correct: number;
    l2idx: number; l2score: number; l2correct: number;
    l3idx: number; l3score: number; l3correct: number; l3guessed: string[]; l3lives: number; l3hintGiven: boolean;
    l4idx: number; l4score: number; l4correct: number;
    budget: number; bought: string[]; priceMulti: number; auctScore: number;
    disasterId: string | null; applied: string[]; disasterScore: number;
  };
  streak: number;
  faction?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
  score: { type: Number, default: 0, min: 0 },
  lastActive: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  faction: { type: String, enum: ['team_sentinel', 'team_landsat', 'team_modis'] },
  
  // Progress Persistence
  unlocked: { type: [Number], default: [1] },
  completed: { type: [Number], default: [] },
  scores: { type: Map, of: Number, default: {} },
  powerups: {
    type: {
      hint: { type: Number, default: 2 },
      skip: { type: Number, default: 1 },
      freeze: { type: Number, default: 1 }
    },
    default: { hint: 2, skip: 1, freeze: 1 }
  },
  telemetry: { type: [Schema.Types.Mixed], default: [] },
  levelState: {
    type: {
      l1idx: { type: Number, default: 0 }, l1score: { type: Number, default: 0 }, l1correct: { type: Number, default: 0 },
      l2idx: { type: Number, default: 0 }, l2score: { type: Number, default: 0 }, l2correct: { type: Number, default: 0 },
      l3idx: { type: Number, default: 0 }, l3score: { type: Number, default: 0 }, l3correct: { type: Number, default: 0 },
      l3guessed: { type: [String], default: [] }, l3lives: { type: Number, default: 6 }, l3hintGiven: { type: Boolean, default: false },
      l4idx: { type: Number, default: 0 }, l4score: { type: Number, default: 0 }, l4correct: { type: Number, default: 0 },
      budget: { type: Number, default: 10000 }, bought: { type: [String], default: [] }, priceMulti: { type: Number, default: 1.0 },
      auctScore: { type: Number, default: 0 }, disasterId: { type: String, default: null }, applied: { type: [String], default: [] },
      disasterScore: { type: Number, default: 0 }
    },
    default: {
      l1idx: 0, l1score: 0, l1correct: 0,
      l2idx: 0, l2score: 0, l2correct: 0,
      l3idx: 0, l3score: 0, l3correct: 0, l3guessed: [], l3lives: 6, l3hintGiven: false,
      l4idx: 0, l4score: 0, l4correct: 0,
      budget: 10000, bought: [], priceMulti: 1.0, auctScore: 0,
      disasterId: null, applied: [], disasterScore: 0
    }
  }
});

// Create model safely to avoid overwrite errors during hot-reloads
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
