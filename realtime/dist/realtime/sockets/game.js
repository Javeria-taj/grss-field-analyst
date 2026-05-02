"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupGameSockets;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const GameEngine_1 = require("../game/GameEngine");
const connect_1 = __importDefault(require("../../lib/db/connect"));
const User_1 = require("../../lib/db/models/User");
const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';
function parseCookies(cookieStr) {
    return cookieStr.split(';').reduce((acc, str) => {
        const [k, v] = str.split('=').map(s => s.trim());
        if (k && v)
            acc[k] = decodeURIComponent(v);
        return acc;
    }, {});
}
function setupGameSockets(io) {
    const engine = new GameEngine_1.GameEngine(io);
    const rateLimitMap = new Map();
    const checkRateLimit = (socketId, limitMs = 150) => {
        const now = Date.now();
        const last = rateLimitMap.get(socketId) || 0;
        if (now - last < limitMs)
            return false;
        rateLimitMap.set(socketId, now);
        return true;
    };
    // Step 5: Hydrate engine from DB on boot
    engine.hydrateFromDb().catch((err) => console.error('Failed to hydrate DB', err));
    // ── Auth Middleware ──
    io.use((socket, next) => {
        try {
            const role = socket.handshake.query.role;
            const cookieStr = socket.request.headers.cookie || '';
            const cookies = parseCookies(cookieStr);
            // force rebuild - auth handshake fix
            const token = socket.handshake.auth?.token || cookies.auth_token;
            if (!token) {
                if (role === 'spectator')
                    return next();
                return next(new Error('Authentication required'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            socket.user = decoded;
            next();
        }
        catch {
            if (socket.handshake.query.role === 'spectator')
                return next();
            next(new Error('Invalid or expired session'));
        }
    });
    io.on('connection', (rawSocket) => {
        const socket = rawSocket;
        const isSpectator = socket.handshake.query.role === 'spectator';
        const usn = socket.user?.usn?.toUpperCase() || (isSpectator ? `SPECTATOR_${socket.id.slice(0, 4)}` : '');
        const name = socket.user?.name || (isSpectator ? 'Spectator' : 'Unknown');
        const isAdmin = !!socket.user?.isAdmin;
        // Register player/spectator
        if (isAdmin) {
            // Admins don't need registration in player list
        }
        else if (isSpectator) {
            engine.registerSpectator(socket.id);
        }
        else {
            engine.registerPlayer(socket.id, usn, name, socket.user?.faction);
        }
        if (usn)
            socket.join(usn);
        if (isAdmin)
            socket.join('admins');
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
        socket.on('admin_start_level', (data) => {
            if (!isAdmin)
                return;
            const ok = engine.startLevel(data.level);
            if (!ok)
                socket.emit('admin_error', { error: 'Cannot start level in current state' });
        });
        socket.on('admin_pause_game', () => {
            if (!isAdmin)
                return;
            const paused = engine.togglePause();
            console.log(`⏸️ Game ${paused ? 'paused' : 'resumed'} by ${usn}`);
        });
        socket.on('admin_timer_add_10', () => {
            if (!isAdmin)
                return;
            engine.addTimerSeconds(10);
            console.log(`⏱️ Timer +10s by ${usn}`);
        });
        socket.on('admin_timer_pause_resume', () => {
            if (!isAdmin)
                return;
            const paused = engine.togglePause();
            console.log(`⏸️ Timer ${paused ? 'paused' : 'resumed'} by ${usn}`);
        });
        socket.on('admin_reset_game', () => {
            if (!isAdmin)
                return;
            engine.reset();
            console.log(`🔄 Game reset by ${usn}`);
        });
        socket.on('admin_load_bank', (data) => {
            if (!isAdmin)
                return;
            engine.loadBank(data.questions);
            console.log(`📂 Bank loaded (${data.questions.length} Qs) by ${usn}`);
        });
        socket.on('admin_force_end_question', () => {
            if (!isAdmin)
                return;
            engine.forceEndQuestion();
        });
        socket.on('admin_kick_player', async (data) => {
            if (!isAdmin || !data.usn)
                return;
            const targetUsn = data.usn.toUpperCase();
            engine.kickPlayer(targetUsn);
            try {
                await User_1.User.deleteOne({ usn: targetUsn });
                io.to(targetUsn).emit('force_disconnect', { reason: 'Kicked by administrator' });
                console.log(`🚫 Kicked: ${targetUsn}`);
            }
            catch (err) {
                console.error('Kick deletion err', err);
            }
        });
        socket.on('admin_sabotage_player', (data) => {
            if (!isAdmin || !data.usn)
                return;
            engine.sabotagePlayer(data.usn.toUpperCase());
        });
        socket.on('admin_add_bank_question', (data) => {
            if (!isAdmin)
                return;
            engine.addBankQuestion(data.question);
        });
        socket.on('admin_trigger_anomaly', () => {
            if (!isAdmin)
                return;
            engine.triggerAnomaly();
        });
        socket.on('admin_trigger_scenario', (data) => {
            if (!isAdmin)
                return;
            engine.triggerScenario(data.type);
        });
        socket.on('admin_update_bank_question', (data) => {
            if (!isAdmin)
                return;
            engine.updateBankQuestion(data.id, data.updates);
        });
        socket.on('admin_delete_bank_question', (data) => {
            if (!isAdmin)
                return;
            engine.deleteBankQuestion(data.id);
        });
        socket.on('admin_update_level_limit', (data) => {
            if (!isAdmin)
                return;
            engine.updateLevelLimit(data.level, data.limit);
        });
        socket.on('admin_get_bank', () => {
            if (!isAdmin)
                return;
            socket.emit('bank_questions', engine.getBankQuestions());
        });
        socket.on('admin_global_broadcast', (msg) => {
            if (!isAdmin)
                return;
            if (typeof msg !== 'string' || msg.trim().length === 0)
                return;
            io.emit('global_announcement', msg.trim());
            console.log(`📢 Broadcast from ${usn}: "${msg}"`);
        });
        // ════════════════════════════════════════════════════════════
        // PLAYER EVENTS
        // ════════════════════════════════════════════════════════════
        socket.on('submit_answer', (data) => {
            if (isAdmin)
                return;
            // Rate limit
            if (!checkRateLimit(socket.id, 150))
                return;
            const result = engine.handleAnswer(usn, data.answer);
            if (result) {
                socket.emit('answer_result', result);
                // Admin Emit Live Stats (Exclusively to admins)
                io.to('admins').emit('admin_live_stats', engine.getLiveAnswerStats());
            }
        });
        socket.on('guess_letter', (data) => {
            if (isAdmin)
                return;
            if (typeof data.letter !== 'string' || data.letter.length !== 1)
                return;
            // Rate limit hangman guesses (150ms)
            if (!checkRateLimit(socket.id, 150))
                return;
            const result = engine.handleLetterGuess(usn, data.letter);
            if (result) {
                socket.emit('hangman_letter_result', result);
                // If solved or dead, also send answer_result
                if (result.solved || result.livesLeft <= 0) {
                    const pa = engine.getStateForClient(usn).myAnswer;
                    if (pa)
                        socket.emit('answer_result', {
                            correct: pa.correct,
                            score: pa.score,
                            totalScore: pa.totalScore,
                            currentLevelScore: pa.currentLevelScore
                        });
                }
            }
        });
        socket.on('buy_tool', (data) => {
            if (isAdmin)
                return;
            if (!checkRateLimit(socket.id, 150))
                return;
            const result = engine.handleBuyTool(usn, data.toolId);
            if (result)
                socket.emit('auction_update', result);
        });
        socket.on('sell_tool', (data) => {
            if (isAdmin)
                return;
            if (!checkRateLimit(socket.id, 150))
                return;
            const result = engine.handleSellTool(usn, data.toolId);
            if (result)
                socket.emit('auction_update', result);
        });
        socket.on('deploy_tools', (data) => {
            if (isAdmin)
                return;
            if (!Array.isArray(data.toolIds))
                return;
            const ok = engine.handleDeployTools(usn, data.toolIds);
            socket.emit('deploy_result', { success: ok });
        });
        socket.on('submit_anomaly_fix', (data) => {
            if (isAdmin)
                return;
            const success = engine.handleAnomalyFix(usn, data.targetId);
            if (success) {
                socket.emit('anomaly_fix_success', { targetId: data.targetId });
            }
        });
        socket.on('use_powerup', (data) => {
            if (isAdmin)
                return;
            const result = engine.handlePowerup(usn, data.type);
            socket.emit('powerup_result', result);
        });
        socket.on('reaction', (emoji) => {
            if (isAdmin)
                return;
            if (typeof emoji !== 'string' || emoji.length > 5)
                return; // Basic validation
            engine.handleReaction(emoji);
        });
        socket.on('focus_breach_penalty', () => {
            if (isAdmin)
                return;
            if (!checkRateLimit(socket.id, 2000))
                return; // prevent spamming penalties
            engine.applyPenalty(usn, 75);
            console.log(`⚠️ Security Breach: ${usn} penalized 75 pts for focus loss.`);
        });
        socket.on('use_hint', () => {
            if (isAdmin)
                return;
            if (!checkRateLimit(socket.id, 500))
                return;
            engine.applyPenalty(usn, 50);
            console.log(`💡 Hint used: ${usn} penalized 50 pts.`);
        });
        // ── Level 5 Finale: client submits locally-computed score ──
        socket.on('submit_level5_results', (data) => {
            if (isAdmin)
                return;
            if (!checkRateLimit(socket.id, 2000))
                return;
            if (typeof data.l5Score !== 'number' || data.l5Score < 0)
                return;
            // Cap at a reasonable max to prevent exploit
            const capped = Math.min(Math.round(data.l5Score), 9000);
            engine.applyLevel5Score(usn, capped);
            console.log(`🌍 L5 results from ${usn}: +${capped} pts`);
        });
        // ════════════════════════════════════════════════════════════
        // DISCONNECT
        // ════════════════════════════════════════════════════════════
        socket.on('disconnect', () => {
            if (!isAdmin)
                engine.unregisterPlayer(socket.id);
            rateLimitMap.delete(socket.id);
            engine.broadcastAdminStats();
            console.log(`👋 Disconnected: ${socket.id} | ${usn}`);
        });
    });
    // ── Periodic DB persistence & Snapshot ──
    setInterval(async () => {
        // 1. Sync scores using bulkWrite
        try {
            if (mongoose_1.default.connection.readyState !== 1)
                return; // Only run if DB is connected
            await (0, connect_1.default)();
            const leaderboard = engine.getLeaderboard();
            if (leaderboard.length > 0) {
                await User_1.User.bulkWrite(leaderboard.map(entry => ({
                    updateOne: {
                        filter: { usn: entry.usn },
                        update: { $set: { score: entry.totalScore, streak: entry.streak, lastActive: new Date() } },
                        upsert: false,
                    }
                })));
            }
        }
        catch (err) {
            console.error('DB bulkWrite error:', err);
        }
        // 2. Persist Engine Snapshot
        if (mongoose_1.default.connection.readyState === 1) {
            engine.snapshotToDb();
        }
    }, 10000); // every 10 seconds
}
