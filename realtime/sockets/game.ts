import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
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

import { BankQuestion } from '../game/types';

export default function setupGameSockets(io: Server) {
  const engine = new GameEngine(io);
  const rateLimitMap = new Map<string, number>();

  const checkRateLimit = (socketId: string, limitMs: number = 150): boolean => {
    const now = Date.now();
    const last = rateLimitMap.get(socketId) || 0;
    if (now - last < limitMs) return false;
    rateLimitMap.set(socketId, now);
    return true;
  };

  // Step 5: Hydrate engine from DB on boot
  engine.hydrateFromDb().catch(err => console.error('Failed to hydrate DB', err));

  // ── Auth Middleware ──
  io.use((socket: Socket, next) => {
    try {
      const role = socket.handshake.query.role;
      const cookieStr = socket.request.headers.cookie || '';
      const cookies = parseCookies(cookieStr);
      
      if (!cookies.auth_token) {
        if (role === 'spectator') return next();
        return next(new Error('Authentication required'));
      }
      
      const decoded = jwt.verify(cookies.auth_token, JWT_SECRET);
      (socket as AuthSocket).user = decoded as jwt.JwtPayload;
      next();
    } catch {
      if (socket.handshake.query.role === 'spectator') return next();
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthSocket;
    const isSpectator = socket.handshake.query.role === 'spectator';
    const usn = socket.user?.usn?.toUpperCase() || (isSpectator ? `SPECTATOR_${socket.id.slice(0, 4)}` : '');
    const name = socket.user?.name || (isSpectator ? 'Spectator' : 'Unknown');
    const isAdmin = !!socket.user?.isAdmin;

    // Register player/spectator
    if (isAdmin) {
      // Admins don't need registration in player list
    } else if (isSpectator) {
      engine.registerSpectator(socket.id);
    } else {
      engine.registerPlayer(socket.id, usn, name, socket.user?.faction);
    }

    if (usn) socket.join(usn);
    if (isAdmin) socket.join('admins');

    console.log(`👤 Connected: ${socket.id} | ${usn} | Admin: ${isAdmin} (Total: ${engine.getConnectedCount()})`);
    engine.broadcastAdminStats();

    // ── Send initial sync state ──
    socket.emit('game_state_sync', engine.getStateForClient(usn));
    socket.emit('leaderboard_update', engine.getLeaderboard());

    socket.on('request_full_sync', () => {
      socket.emit('game_state_sync', engine.getStateForClient(usn));
    });

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

    socket.on('admin_timer_add_10', () => {
      if (!isAdmin) return;
      engine.addTimerSeconds(10);
      console.log(`⏱️ Timer +10s by ${usn}`);
    });

    socket.on('admin_timer_pause_resume', () => {
      if (!isAdmin) return;
      const paused = engine.togglePause();
      console.log(`⏸️ Timer ${paused ? 'paused' : 'resumed'} by ${usn}`);
    });

    socket.on('admin_reset_game', () => {
      if (!isAdmin) return;
      engine.reset();
      console.log(`🔄 Game reset by ${usn}`);
    });

    socket.on('admin_load_bank', (data: { questions: BankQuestion[] }) => {
      if (!isAdmin) return;
      engine.loadBank(data.questions);
      console.log(`📂 Bank loaded (${data.questions.length} Qs) by ${usn}`);
    });

    socket.on('admin_force_end_question', () => {
      if (!isAdmin) return;
      engine.forceEndQuestion();
    });

    socket.on('admin_kick_player', async (data: { usn: string }) => {
      if (!isAdmin || !data.usn) return;
      const targetUsn = data.usn.toUpperCase();
      engine.kickPlayer(targetUsn);
      try {
        await User.deleteOne({ usn: targetUsn });
        io.to(targetUsn).emit('force_disconnect', { reason: 'Kicked by administrator' });
        console.log(`🚫 Kicked: ${targetUsn}`);
      } catch (err) {
        console.error('Kick deletion err', err);
      }
    });

    socket.on('admin_sabotage_player', (data: { usn: string }) => {
      if (!isAdmin || !data.usn) return;
      engine.sabotagePlayer(data.usn.toUpperCase());
    });

    socket.on('admin_add_bank_question', (data: { question: BankQuestion }) => {
      if (!isAdmin) return;
      engine.addBankQuestion(data.question);
    });

    socket.on('admin_trigger_anomaly', () => {
      if (!isAdmin) return;
      engine.triggerAnomaly();
    });

    socket.on('admin_trigger_scenario', (data: { type: 'solar_flare' | 'data_corruption' }) => {
      if (!isAdmin) return;
      engine.triggerScenario(data.type);
    });

    socket.on('admin_update_bank_question', (data: { id: string; updates: Partial<BankQuestion> }) => {
      if (!isAdmin) return;
      engine.updateBankQuestion(data.id, data.updates);
    });

    socket.on('admin_delete_bank_question', (data: { id: string }) => {
      if (!isAdmin) return;
      engine.deleteBankQuestion(data.id);
    });
    
    socket.on('admin_update_level_limit', (data: { level: number; limit: number }) => {
      if (!isAdmin) return;
      engine.updateLevelLimit(data.level, data.limit);
    });

    socket.on('admin_get_bank', () => {
      if (!isAdmin) return;
      socket.emit('bank_questions', engine.getBankQuestions());
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
      if (!checkRateLimit(socket.id, 150)) return;

      const result = engine.handleAnswer(usn, data.answer);
      if (result) {
        socket.emit('answer_result', result);
        // Admin Emit Live Stats (Exclusively to admins)
        io.to('admins').emit('admin_live_stats', engine.getLiveAnswerStats());
      }
    });

    socket.on('guess_letter', (data: { letter: string }) => {
      if (isAdmin) return;
      if (typeof data.letter !== 'string' || data.letter.length !== 1) return;

      // Rate limit hangman guesses (150ms)
      if (!checkRateLimit(socket.id, 150)) return;

      const result = engine.handleLetterGuess(usn, data.letter);
      if (result) {
        socket.emit('hangman_letter_result', result);
        // If solved or dead, also send answer_result
        if (result.solved || result.livesLeft <= 0) {
          const pa = engine.getStateForClient(usn).myAnswer;
          if (pa) socket.emit('answer_result', { 
            correct: pa.correct, 
            score: pa.score, 
            totalScore: pa.totalScore, 
            currentLevelScore: pa.currentLevelScore 
          });
        }
      }
    });

    socket.on('buy_tool', (data: { toolId: string }) => {
      if (isAdmin) return;
      if (!checkRateLimit(socket.id, 150)) return;
      const result = engine.handleBuyTool(usn, data.toolId);
      if (result) socket.emit('auction_update', result);
    });

    socket.on('sell_tool', (data: { toolId: string }) => {
      if (isAdmin) return;
      if (!checkRateLimit(socket.id, 150)) return;
      const result = engine.handleSellTool(usn, data.toolId);
      if (result) socket.emit('auction_update', result);
    });

    socket.on('deploy_tools', (data: { toolIds: string[] }) => {
      if (isAdmin) return;
      if (!Array.isArray(data.toolIds)) return;
      const ok = engine.handleDeployTools(usn, data.toolIds);
      socket.emit('deploy_result', { success: ok });
    });

    socket.on('submit_anomaly_fix', (data: { targetId: string }) => {
      if (isAdmin) return;
      const success = engine.handleAnomalyFix(usn, data.targetId);
      if (success) {
        socket.emit('anomaly_fix_success', { targetId: data.targetId });
      }
    });

    socket.on('use_powerup', (data: { type: 'radar_pulse' | 'thermal_scan' }) => {
      if (isAdmin) return;
      const result = engine.handlePowerup(usn, data.type);
      socket.emit('powerup_result', result);
    });

    socket.on('reaction', (emoji: string) => {
      if (isAdmin) return;
      if (typeof emoji !== 'string' || emoji.length > 5) return; // Basic validation
      engine.handleReaction(emoji);
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

  // ── Periodic DB persistence & Snapshot ──
  setInterval(async () => {
    // 1. Sync scores using bulkWrite
    try {
      if (mongoose.connection.readyState !== 1) return; // Only run if DB is connected
      await dbConnect();
      const leaderboard = engine.getLeaderboard();
      if (leaderboard.length > 0) {
        await User.bulkWrite(
          leaderboard.map(entry => ({
            updateOne: {
              filter: { usn: entry.usn },
              update: { $set: { score: entry.totalScore, lastActive: new Date() } },
              upsert: false,
            }
          }))
        );
      }
    } catch (err) {
      console.error('DB bulkWrite error:', err);
    }

    // 2. Persist Engine Snapshot
    if (mongoose.connection.readyState === 1) {
      engine.snapshotToDb();
    }
  }, 10000); // every 10 seconds
}
