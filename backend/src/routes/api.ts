import express, { Request, Response } from 'express';
import { z } from 'zod';
import { getDbStatus } from '../config/db';

const router = express.Router();

// ─── Health check ────────────────────────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    db_connected: getDbStatus(),
    mode: getDbStatus() ? 'production' : 'local-memory-fallback',
    timestamp: new Date().toISOString(),
  });
});

// ─── Leaderboard REST endpoint (read-only snapshot) ──────────────────────────
// Live updates are delivered via WebSocket; this endpoint provides an
// initial snapshot for clients that connect before socket initialises.
import { getLeaderboard, addScore } from '../sockets/leaderboard';

router.get('/leaderboard', (req: Request, res: Response) => {
  try {
    const entries = getLeaderboard();
    res.json({ status: 'ok', count: entries.length, entries });
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Failed to fetch leaderboard' });
  }
});

// ─── Score submission REST fallback (if WebSocket is unavailable) ─────────────
const scoreSchema = z.object({
  name:  z.string().min(2).max(50).trim(),
  usn:   z.string().min(4).max(20).trim().toUpperCase(),
  score: z.number().int().nonnegative().max(9999),
});

router.post('/score', async (req: Request, res: Response): Promise<any> => {
  const result = scoreSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      errors: result.error.flatten().fieldErrors,
    });
  }
  try {
    await addScore(result.data);
    res.status(201).json({ status: 'ok', message: 'Score submitted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Failed to record score' });
  }
});

export default router;
