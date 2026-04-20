const { z } = require('zod');
const jwt = require('jsonwebtoken');

// ─── Constants ────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

// ─── In-memory leaderboard ────────────────────────────────────────────────────
/** @type {Array<{name: string, usn: string, score: number, date: Date}>} */
let leaderboardFallback = [];

// ─── Zod schema for strict payload validation ─────────────────────────────────
const scoreSchema = z.object({
  name:  z.string().min(2).max(50).trim(),
  usn:   z.string().min(4).max(50).trim(),
  score: z.number().int().nonnegative().max(9999),
});

// ─── Helpers (exported for REST route reuse) ──────────────────────────────────
function getLeaderboard() {
  return leaderboardFallback;
}

function addScore(data) {
  const existing = leaderboardFallback.findIndex(e => e.usn === data.usn);
  if (existing !== -1) {
    if (data.score <= leaderboardFallback[existing].score) return;
    leaderboardFallback[existing] = { ...data, date: new Date() };
  } else {
    leaderboardFallback.push({ ...data, date: new Date() });
  }

  // Sort immediately
  leaderboardFallback.sort((a, b) => b.score - a.score);
}

// ─── Socket setup ─────────────────────────────────────────────────────────────
module.exports = (io) => {
  let connectedCount = 0;

  // Authenticaton Middleware
  io.use((socket, next) => {
    try {
      const cookieStr = socket.request.headers.cookie || '';
      const cookies = cookieStr.split(';').reduce((acc, str) => {
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

  io.on('connection', (socket) => {
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
    socket.on('submit_score', (data) => {
      const result = scoreSchema.safeParse(data);
      if (!result.success) {
        return socket.emit('score_error', { error: 'Invalid score payload', details: result.error.flatten().fieldErrors });
      }

      addScore(result.data);
      console.log(`✅ Score recorded: ${result.data.name} (${result.data.usn}) → ${result.data.score} pts`);
      io.emit('leaderboard_update', leaderboardFallback);
    });

    // ── ADMIN EVENTS ──────────────────────────────────────────────
    socket.on('admin_reset_board', () => {
      if (!socket.user?.isAdmin) return console.warn(`🚨 UNATHORIZED admin_reset from ${socket.user?.usn}`);
      leaderboardFallback = [];
      io.emit('leaderboard_update', leaderboardFallback);
      console.log(`🗑️ Admin ${socket.user.name} reset the leaderboard.`);
    });

    socket.on('admin_delete_score', (usn) => {
      if (!socket.user?.isAdmin) return;
      leaderboardFallback = leaderboardFallback.filter(e => e.usn !== usn);
      io.emit('leaderboard_update', leaderboardFallback);
      console.log(`🗑️ Admin ${socket.user.name} deleted score for USN: ${usn}`);
    });

    socket.on('admin_global_broadcast', (message) => {
      if (!socket.user?.isAdmin) return;
      // Broadcast to EVERYONE (including other admins)
      io.emit('global_announcement', message);
      console.log(`📢 Admin Broadcast: ${message}`);
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      connectedCount = Math.max(0, connectedCount - 1);
    });

    socket.on('error', (err) => {
      console.error(`[Socket Error] ${socket.id}:`, err.message);
    });
  });
};

module.exports.getLeaderboard = getLeaderboard;
module.exports.addScore = addScore;
