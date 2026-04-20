import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  usn: string;
  score: number;
  lastActive: Date;
  isAdmin: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
  score: { type: Number, default: 0, min: 0 },
  lastActive: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false }
});

// Create model safely to avoid overwrite errors during hot-reloads
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
