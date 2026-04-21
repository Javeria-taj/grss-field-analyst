import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import dbConnect from '../../lib/db/connect';
import { User } from '../../lib/db/models/User';

const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

export interface LeaderboardEntry {
  name: string;
  usn: string;
  score: number;
  date: Date;
}

let leaderboardEntries: LeaderboardEntry[] = [];

const scoreSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  usn: z.string().min(4).max(50).trim(),
  score: z.number().int().nonnegative().max(9999),
  progress: z.any().optional()
});

export async function hydrateLeaderboard(): Promise<void> {
  try {
    await dbConnect();
    const users = await User.find({ isAdmin: false }).sort({ score: -1 }).limit(100).exec();
    leaderboardEntries = users.map((u: any) => ({
      name: u.name,
      usn: u.usn,
      score: u.score,
      date: u.lastActive,
    }));
    console.log(`🗄️ Realtime Board hydrated: ${leaderboardEntries.length} records.`);
  } catch (err) {
    console.error('⚠️ Leaderboard hydration failed:', err);
  }
}

export default function setupSockets(io: Server) {
  let connectedCount = 0;
  const rateLimitMap = new Map<string, number>();

  hydrateLeaderboard();

  // Socket Authentication
  io.use((socket: any, next) => {
    try {
      const cookieStr = socket.request.headers.cookie || '';
      const cookies = cookieStr.split(';').reduce((acc: any, str: string) => {
        const [k, v] = str.split('=').map(s => s.trim());
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});

      if (cookies.auth_token) {
        socket.user = jwt.verify(cookies.auth_token, JWT_SECRET);
      }
    } catch (err) {
      console.warn(`[Socket Auth Warning] Invalid JWT from ${socket.id}`);
    }
    next();
  });

  io.on('connection', (socket: any) => {
    connectedCount++;
    console.log(`👤 Connected: ${socket.id} (Total: ${connectedCount})`);

    // Emit initial leaderboard
    socket.emit('leaderboard_update', leaderboardEntries);

    // Score Submission
    socket.on('submit_score', async (data: any) => {
      const now = Date.now();
      const lastSub = rateLimitMap.get(socket.id) || 0;
      if (now - lastSub < 2000) {
        return socket.emit('score_error', { error: 'Rate limit exceeded.' });
      }
      rateLimitMap.set(socket.id, now);

      const result = scoreSchema.safeParse(data);
      if (!result.success) return;

      const { name, usn, score, progress } = result.data;

      // Update in-memory
      const idx = leaderboardEntries.findIndex(e => e.usn === usn);
      if (idx !== -1) {
        if (score > leaderboardEntries[idx].score) {
          leaderboardEntries[idx].score = score;
          leaderboardEntries[idx].date = new Date();
        }
      } else {
        leaderboardEntries.push({ name, usn, score, date: new Date() });
      }
      leaderboardEntries.sort((a, b) => b.score - a.score);

      // Persist to DB
      try {
        const update: any = { 
          $set: { name, lastActive: new Date() },
          $max: { score: score }
        };
        if (progress) {
          Object.keys(progress).forEach(key => {
            if (progress[key] !== undefined) update.$set[key] = progress[key];
          });
        }
        await User.findOneAndUpdate({ usn }, update, { upsert: true });
      } catch (err) {
        console.error('DB Persistence Error:', err);
      }

      io.emit('leaderboard_update', leaderboardEntries);
    });

    // Admin Handlers
    socket.on('admin_global_broadcast', (msg: string) => {
      if (socket.user?.isAdmin) {
        io.emit('global_announcement', msg);
      }
    });

    socket.on('disconnect', () => {
      connectedCount = Math.max(0, connectedCount - 1);
    });
  });
}
