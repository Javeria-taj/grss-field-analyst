import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import dbConnect from '../../lib/db/connect';
import { User } from '../../lib/db/models/User';

const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

// Extended socket type carrying the verified JWT payload
type AuthSocket = Socket & { user: jwt.JwtPayload };

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

// ── Cookie Parser ──────────────────────────────────────────────────────────
function parseCookies(cookieStr: string): Record<string, string> {
  return cookieStr.split(';').reduce((acc: Record<string, string>, str: string) => {
    const [k, v] = str.split('=').map(s => s.trim());
    if (k && v) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

// ── DB Hydration ───────────────────────────────────────────────────────────
export async function hydrateLeaderboard(): Promise<void> {
  try {
    await dbConnect();
    const users = await User.find({ isAdmin: false }).sort({ score: -1 }).limit(100).exec();
    leaderboardEntries = users.map((u: InstanceType<typeof User>) => ({
      name: u.name,
      usn: u.usn,
      score: u.score,
      date: u.lastActive,
    }));
    console.log(`🗄️  Realtime board hydrated: ${leaderboardEntries.length} records.`);
  } catch (err) {
    console.error('⚠️  Leaderboard hydration failed:', err);
  }
}

// ── Socket Setup ───────────────────────────────────────────────────────────
export default function setupSockets(io: Server) {
  let connectedCount = 0;
  const rateLimitMap = new Map<string, number>();

  hydrateLeaderboard();

  // ── Middleware: Require valid JWT ────────────────────────────────────────
  io.use((socket: Socket, next) => {
    try {
      const cookieStr = socket.request.headers.cookie || '';
      const cookies = parseCookies(cookieStr);

      if (!cookies.auth_token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(cookies.auth_token, JWT_SECRET) as jwt.JwtPayload;
      (socket as AuthSocket).user = decoded;
      next();
    } catch {
      // Invalid or expired JWT — reject the connection
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthSocket;
    connectedCount++;
    console.log(`👤 Connected: ${socket.id} | USN: ${socket.user?.usn} (Total: ${connectedCount})`);

    // Broadcast updated connection count to admin listeners
    io.emit('admin_stats', { connectedCount });

    // Emit initial leaderboard state to this client
    socket.emit('leaderboard_update', leaderboardEntries);

    // ── Score Submission ───────────────────────────────────────────────────
    socket.on('submit_score', async (data: unknown) => {
      const now = Date.now();
      const lastSub = rateLimitMap.get(socket.id) || 0;
      if (now - lastSub < 2000) {
        return socket.emit('score_error', { error: 'Rate limit exceeded.' });
      }
      rateLimitMap.set(socket.id, now);

      const result = scoreSchema.safeParse(data);
      if (!result.success) return;

      const { name, usn, score, progress } = result.data;

      // Ensure submitted USN matches the authenticated session
      if (usn.toUpperCase() !== socket.user?.usn?.toUpperCase()) {
        return socket.emit('score_error', { error: 'USN mismatch.' });
      }

      // Update in-memory leaderboard
      const idx = leaderboardEntries.findIndex(e => e.usn === usn.toUpperCase());
      if (idx !== -1) {
        if (score > leaderboardEntries[idx].score) {
          leaderboardEntries[idx].score = score;
          leaderboardEntries[idx].date = new Date();
        }
      } else {
        leaderboardEntries.push({ name, usn: usn.toUpperCase(), score, date: new Date() });
      }
      leaderboardEntries.sort((a, b) => b.score - a.score);

      // Persist to DB
      try {
        const update: Record<string, unknown> = {
          $set: { name, lastActive: new Date() },
          $max: { score },
        };
        if (progress && typeof progress === 'object') {
          const $set = update.$set as Record<string, unknown>;
          Object.entries(progress).forEach(([key, val]) => {
            if (val !== undefined) $set[key] = val;
          });
        }
        await User.findOneAndUpdate({ usn: usn.toUpperCase() }, update, { upsert: true });
      } catch (err) {
        console.error('DB persistence error:', err);
      }

      // Broadcast updated leaderboard to all clients
      io.emit('leaderboard_update', leaderboardEntries);
    });

    // ── Admin: Global Broadcast ────────────────────────────────────────────
    socket.on('admin_global_broadcast', (msg: string) => {
      if (!socket.user?.isAdmin) return;
      if (typeof msg !== 'string' || msg.trim().length === 0) return;
      io.emit('global_announcement', msg.trim());
      console.log(`📢 Admin broadcast from ${socket.user.usn}: "${msg}"`);
    });

    // ── Admin: Wipe Leaderboard ────────────────────────────────────────────
    socket.on('admin_reset_board', async () => {
      if (!socket.user?.isAdmin) return;
      try {
        await User.updateMany({ isAdmin: false }, { $set: { score: 0 } });
        leaderboardEntries = [];
        io.emit('leaderboard_update', leaderboardEntries);
        console.log(`⚠️  Leaderboard wiped by admin: ${socket.user.usn}`);
      } catch (err) {
        console.error('Board reset error:', err);
      }
    });

    // ── Admin: Delete Single Score ─────────────────────────────────────────
    socket.on('admin_delete_score', async (usn: string) => {
      if (!socket.user?.isAdmin) return;
      if (typeof usn !== 'string' || usn.trim().length === 0) return;
      const upperUsn = usn.trim().toUpperCase();
      try {
        await User.findOneAndUpdate({ usn: upperUsn }, { $set: { score: 0 } });
        leaderboardEntries = leaderboardEntries.filter(e => e.usn !== upperUsn);
        io.emit('leaderboard_update', leaderboardEntries);
        console.log(`🗑️  Score deleted for ${upperUsn} by admin: ${socket.user.usn}`);
      } catch (err) {
        console.error('Delete score error:', err);
      }
    });

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      connectedCount = Math.max(0, connectedCount - 1);
      rateLimitMap.delete(socket.id);
      io.emit('admin_stats', { connectedCount });
    });
  });
}
