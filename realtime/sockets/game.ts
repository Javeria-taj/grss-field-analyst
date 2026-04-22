import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { GameEngine } from '../game/GameEngine';
import dbConnect from '../../lib/db/connect';
import { User } from '../../lib/db/models/User';

const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

type AuthSocket = Socket & { user: jwt.JwtPayload };

function parseCookies(cookieStr: string): Record<string, string> {
  return cookieStr.split(';').reduce((acc: Record<string, string>, str: string) => {
    const [k, v] = str.split('=').map(s => s.trim());
    if (k && v) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

export default function setupGameSockets(io: Server) {
  const engine = new GameEngine(io);
  const rateLimitMap = new Map<string, number>();

  // ── Auth Middleware ──
  io.use((socket: Socket, next) => {
    try {
      const cookieStr = socket.request.headers.cookie || '';
      const cookies = parseCookies(cookieStr);
      if (!cookies.auth_token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(cookies.auth_token, JWT_SECRET) as jwt.JwtPayload;
      (socket as AuthSocket).user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthSocket;
    const usn = socket.user?.usn?.toUpperCase() || '';
    const name = socket.user?.name || 'Unknown';
    const isAdmin = !!socket.user?.isAdmin;

    // Register player (non-admin)
    if (!isAdmin) {
      engine.registerPlayer(socket.id, usn, name);
    }

    console.log(`👤 Connected: ${socket.id} | ${usn} | Admin: ${isAdmin} (Total: ${engine.getConnectedCount()})`);
    engine.broadcastAdminStats();

    // ── Send initial sync state ──
    socket.emit('game_state_sync', engine.getStateForClient(usn));
    socket.emit('leaderboard_update', engine.getLeaderboard());

    // ════════════════════════════════════════════════════════════
    // ADMIN EVENTS
    // ════════════════════════════════════════════════════════════

    socket.on('admin_start_level', (data: { level: number }) => {
      if (!isAdmin) return;
      const ok = engine.startLevel(data.level);
      if (!ok) socket.emit('admin_error', { error: 'Cannot start level in current state' });
    });

    socket.on('admin_pause_game', () => {
      if (!isAdmin) return;
      const paused = engine.togglePause();
      console.log(`⏸️ Game ${paused ? 'paused' : 'resumed'} by ${usn}`);
    });

    socket.on('admin_reset_game', () => {
      if (!isAdmin) return;
      engine.reset();
      console.log(`🔄 Game reset by ${usn}`);
    });

    socket.on('admin_global_broadcast', (msg: string) => {
      if (!isAdmin) return;
      if (typeof msg !== 'string' || msg.trim().length === 0) return;
      io.emit('global_announcement', msg.trim());
      console.log(`📢 Broadcast from ${usn}: "${msg}"`);
    });

    // ════════════════════════════════════════════════════════════
    // PLAYER EVENTS
    // ════════════════════════════════════════════════════════════

    socket.on('submit_answer', (data: { answer: string | number }) => {
      if (isAdmin) return;
      // Rate limit
      const now = Date.now();
      const last = rateLimitMap.get(socket.id) || 0;
      if (now - last < 500) return;
      rateLimitMap.set(socket.id, now);

      const result = engine.handleAnswer(usn, data.answer);
      if (result) {
        socket.emit('answer_result', result);
      }
    });

    socket.on('guess_letter', (data: { letter: string }) => {
      if (isAdmin) return;
      if (typeof data.letter !== 'string' || data.letter.length !== 1) return;

      const result = engine.handleLetterGuess(usn, data.letter);
      if (result) {
        socket.emit('hangman_letter_result', result);
        // If solved or dead, also send answer_result
        if (result.solved || result.livesLeft <= 0) {
          const pa = engine.getStateForClient(usn).myAnswer;
          if (pa) socket.emit('answer_result', { correct: pa.correct, score: pa.score });
        }
      }
    });

    socket.on('buy_tool', (data: { toolId: string }) => {
      if (isAdmin) return;
      const result = engine.handleBuyTool(usn, data.toolId);
      if (result) socket.emit('auction_update', result);
    });

    socket.on('sell_tool', (data: { toolId: string }) => {
      if (isAdmin) return;
      const result = engine.handleSellTool(usn, data.toolId);
      if (result) socket.emit('auction_update', result);
    });

    socket.on('deploy_tools', (data: { toolIds: string[] }) => {
      if (isAdmin) return;
      if (!Array.isArray(data.toolIds)) return;
      const ok = engine.handleDeployTools(usn, data.toolIds);
      socket.emit('deploy_result', { success: ok });
    });

    // ════════════════════════════════════════════════════════════
    // DISCONNECT
    // ════════════════════════════════════════════════════════════

    socket.on('disconnect', () => {
      if (!isAdmin) engine.unregisterPlayer(socket.id);
      rateLimitMap.delete(socket.id);
      engine.broadcastAdminStats();
      console.log(`👋 Disconnected: ${socket.id} | ${usn}`);
    });
  });

  // ── Periodic DB persistence ──
  setInterval(async () => {
    try {
      await dbConnect();
      const leaderboard = engine.getLeaderboard();
      for (const entry of leaderboard) {
        await User.findOneAndUpdate(
          { usn: entry.usn },
          { $set: { score: entry.totalScore, lastActive: new Date() } },
          { upsert: false }
        );
      }
    } catch (err) {
      console.error('DB sync error:', err);
    }
  }, 30000);
}
