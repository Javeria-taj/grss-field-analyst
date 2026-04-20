const { z } = require('zod');

// ─── In-memory leaderboard ────────────────────────────────────────────────────
// Used when MongoDB is unavailable. Scores will not persist across server restarts.
/** @type {Array<{name: string, usn: string, score: number, date: Date}>} */
let leaderboardFallback = [];

// ─── Zod schema for strict payload validation ─────────────────────────────────
const scoreSchema = z.object({
  name:  z.string().min(2).max(50).trim(),
  usn:   z.string().min(4).max(20).trim(),
  score: z.number().int().nonnegative().max(9999),
});

// ─── Helpers (exported for REST route reuse) ──────────────────────────────────

/**
 * Returns the current top-50 leaderboard snapshot.
 * @returns {Array}
 */
function getLeaderboard() {
  return leaderboardFallback;
}

/**
 * Adds or updates a score entry, then re-sorts. Exported for REST fallback.
 * @param {{ name: string, usn: string, score: number }} data
 */
function addScore(data) {
  // Deduplicate: update if same USN already has a higher or equal score
  const existing = leaderboardFallback.findIndex(e => e.usn === data.usn);
  if (existing !== -1) {
    if (data.score <= leaderboardFallback[existing].score) return; // don't downgrade
    leaderboardFallback[existing] = { ...data, date: new Date() };
  } else {
    leaderboardFallback.push({ ...data, date: new Date() });
  }

  // Sort descending and cap at top 50
  leaderboardFallback.sort((a, b) => b.score - a.score);
  leaderboardFallback = leaderboardFallback.slice(0, 50);
}

// ─── Socket setup ─────────────────────────────────────────────────────────────
/**
 * @param {import('socket.io').Server} io
 */
module.exports = (io) => {
  // Track active connections for monitoring
  let connectedCount = 0;

  io.on('connection', (socket) => {
    connectedCount++;
    console.log(`👤 Connected: ${socket.id}  (active: ${connectedCount})`);

    // Immediately send current leaderboard on join
    socket.emit('leaderboard_update', leaderboardFallback);

    // ── Score submission from client ──────────────────────────────────────────
    socket.on('submit_score', (data) => {
      const result = scoreSchema.safeParse(data);

      if (!result.success) {
        console.warn(`⚠️  Invalid payload from ${socket.id}:`, result.error.flatten().fieldErrors);
        socket.emit('score_error', { error: 'Invalid score payload', details: result.error.flatten().fieldErrors });
        return;
      }

      addScore(result.data);
      console.log(`✅ Score recorded: ${result.data.name} (${result.data.usn}) → ${result.data.score} pts`);

      // Broadcast updated board to all connected clients
      io.emit('leaderboard_update', leaderboardFallback);
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      connectedCount = Math.max(0, connectedCount - 1);
      console.log(`👤 Disconnected: ${socket.id}  reason: ${reason}  (active: ${connectedCount})`);
    });

    // ── Error guard ───────────────────────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`[Socket Error] ${socket.id}:`, err.message);
    });
  });
};

// Export helpers for REST route
module.exports.getLeaderboard = getLeaderboard;
module.exports.addScore = addScore;
