import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { User, IUser } from '../models/User';

// ─── Constants ────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

// ─── In-memory leaderboard ────────────────────────────────────────────────────
export interface LeaderboardEntry {
  name: string;
  usn: string;
  score: number;
  date: Date;
}

let leaderboardFallback: LeaderboardEntry[] = [];

// ─── Zod schema for strict payload validation ─────────────────────────────────
const scoreSchema = z.object({
  name:  z.string().min(2).max(50).trim(),
  usn:   z.string().min(4).max(50).trim(),
  score: z.number().int().nonnegative().max(9999),
});

export function getLeaderboard(): LeaderboardEntry[] {
  return leaderboardFallback;
}

export function userExists(usn: string): boolean {
  return leaderboardFallback.some(e => e.usn === usn);
}

export async function addScore(data: { name: string; usn: string; score: number, isAdmin?: boolean }): Promise<void> {
  const existing = leaderboardFallback.findIndex(e => e.usn === data.usn);
  
  if (existing !== -1) {
    if (data.score <= leaderboardFallback[existing].score) return;
    leaderboardFallback[existing] = { ...data, date: new Date() };
  } else {
    leaderboardFallback.push({ ...data, date: new Date() });
  }

  // Sort immediately
  leaderboardFallback.sort((a, b) => b.score - a.score);

  // Background persistence to MongoDB
  try {
    await User.findOneAndUpdate(
      { usn: data.usn },
      { 
        $set: { name: data.name, lastActive: new Date() },
        $max: { score: data.score },
        $setOnInsert: { isAdmin: data.isAdmin ?? false }
      },
      { upsert: true, new: true }
    ).catch(console.error);
  } catch (err) {
    console.error('Mongo Save Error', err);
  }
}

// ─── Hydration ────────────────────────────────────────────────────────────────
export async function hydrateLeaderboard(): Promise<void> {
  try {
    const users = await User.find({ isAdmin: false }).sort({ score: -1 }).exec();
    leaderboardFallback = users.map((u: any) => ({
      name: u.name,
      usn: u.usn,
      score: u.score,
      date: u.lastActive,
    }));
    console.log(`🗄️ Leaderboard hydrated from MongoDB: ${leaderboardFallback.length} records.`);
  } catch (err) {
    console.warn('⚠️ MongoDB hydration failed, using clean slate.');
  }
}

// ─── Socket setup ─────────────────────────────────────────────────────────────
export default function setupSockets(io: Server) {
  let connectedCount = 0;
  
  // Rate-limiting map: socketId -> last submission timestamp
  const rateLimitMap = new Map<string, number>();

  // Attempt to hydrate on setup
  hydrateLeaderboard();

  // Authenticaton Middleware
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
    console.log(`👤 Connected: ${socket.id}  (active: ${connectedCount})`);

    // Send initial board
    socket.emit('leaderboard_update', leaderboardFallback);
    
    // Broadcast active connection count to admins
    setInterval(() => {
      if (socket.user && socket.user.isAdmin) {
        socket.emit('admin_stats', { connectedCount });
      }
    }, 2000);

    // ── Score submission ──────────────────────────────────────────
    socket.on('submit_score', async (data: any) => {
      // Flaw #3 Fix: WebSocket Rate-Limiting (2s debounce)
      const now = Date.now();
      const lastSub = rateLimitMap.get(socket.id) || 0;
      if (now - lastSub < 2000) {
        return socket.emit('score_error', { error: 'Rate limit exceeded. Please wait 2 seconds.' });
      }
      rateLimitMap.set(socket.id, now);

      const result = scoreSchema.safeParse(data);
      if (!result.success) {
        return socket.emit('score_error', { error: 'Invalid score payload', details: result.error.flatten().fieldErrors });
      }

      await addScore(result.data);
      console.log(`✅ Score recorded: ${result.data.name} (${result.data.usn}) → ${result.data.score} pts`);
      io.emit('leaderboard_update', leaderboardFallback);
    });

    // ── ADMIN EVENTS ──────────────────────────────────────────────
    socket.on('admin_reset_board', async () => {
      if (!socket.user?.isAdmin) return console.warn(`🚨 UNATHORIZED admin_reset from ${socket.user?.usn}`);
      try {
        await User.updateMany({}, { $set: { score: 0 } });
        leaderboardFallback.forEach(u => u.score = 0);
        io.emit('leaderboard_update', leaderboardFallback);
        console.log(`🗑️ Admin ${socket.user.name} reset all scores.`);
      } catch (err) {
        console.error('Failed to reset DB:', err);
      }
    });

    socket.on('admin_delete_score', async (usn: string) => {
      if (!socket.user?.isAdmin) return;
      try {
        await User.deleteOne({ usn });
        leaderboardFallback = leaderboardFallback.filter(e => e.usn !== usn);
        io.emit('leaderboard_update', leaderboardFallback);
        console.log(`🗑️ Admin ${socket.user.name} deleted score for USN: ${usn}`);
      } catch (err) {
        console.error('Failed to delete DB user:', err);
      }
    });

    socket.on('admin_global_broadcast', (message: string) => {
      if (!socket.user?.isAdmin) return;
      // Broadcast to EVERYONE (including other admins)
      io.emit('global_announcement', message);
      console.log(`📢 Admin Broadcast: ${message}`);
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      connectedCount = Math.max(0, connectedCount - 1);
      rateLimitMap.delete(socket.id); // clean up memory
    });

    socket.on('error', (err: Error) => {
      console.error(`[Socket Error] ${socket.id}:`, err.message);
    });
  });
}

