"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const db_1 = require("../config/db");
const router = express_1.default.Router();
// ─── Health check ────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    res.json({
        status: 'online',
        db_connected: (0, db_1.getDbStatus)(),
        mode: (0, db_1.getDbStatus)() ? 'production' : 'local-memory-fallback',
        timestamp: new Date().toISOString(),
    });
});
// ─── Leaderboard REST endpoint (read-only snapshot) ──────────────────────────
// Live updates are delivered via WebSocket; this endpoint provides an
// initial snapshot for clients that connect before socket initialises.
const leaderboard_1 = require("../sockets/leaderboard");
router.get('/leaderboard', (req, res) => {
    try {
        const entries = (0, leaderboard_1.getLeaderboard)();
        res.json({ status: 'ok', count: entries.length, entries });
    }
    catch (err) {
        res.status(500).json({ status: 'error', error: 'Failed to fetch leaderboard' });
    }
});
// ─── Score submission REST fallback (if WebSocket is unavailable) ─────────────
const scoreSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).trim(),
    usn: zod_1.z.string().min(4).max(20).trim().toUpperCase(),
    score: zod_1.z.number().int().nonnegative().max(9999),
});
router.post('/score', async (req, res) => {
    const result = scoreSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: 'error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    try {
        await (0, leaderboard_1.addScore)(result.data);
        res.status(201).json({ status: 'ok', message: 'Score submitted successfully' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', error: 'Failed to record score' });
    }
});
exports.default = router;
