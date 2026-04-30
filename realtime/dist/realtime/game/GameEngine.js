"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const gameData_1 = __importStar(require("./gameData"));
const connect_1 = __importDefault(require("../../lib/db/connect"));
const GameSnapshot_1 = require("../../lib/db/models/GameSnapshot");
const crypto_1 = require("crypto");
const MissionCommander_1 = require("./MissionCommander");
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function calcScore(correct, timeLeft, maxTime, base) {
    if (!correct)
        return 0;
    // Base points + speed bonus (0% to 100% of base points)
    const speedBonus = Math.round(base * (timeLeft / maxTime));
    return base + speedBonus;
}
// Strict normalisation: strips all non-alphanumeric chars before comparison
function normalise(s) {
    return String(s).replace(/[^A-Z0-9]/gi, '').toUpperCase();
}
class GameEngine {
    earnAchievement(usn, achievementId) {
        const ps = this.playerScores.get(usn);
        if (!ps)
            return;
        if (ps.achievements.includes(achievementId))
            return;
        ps.achievements.push(achievementId);
        this.io.to(usn).emit('achievement_earned', achievementId);
        // Global Feed Notification
        this.io.emit('mission_event', {
            type: 'achievement',
            user: ps.name,
            achievementId
        });
    }
    constructor(io) {
        this.leaderboardDirty = false;
        this.adminStatsDirty = false;
        this.bankDirty = false;
        this.broadcastInterval = null;
        // ── Core State ──
        this.phase = 'idle';
        this.currentLevel = 0;
        this.currentQIndex = 0;
        this.paused = false;
        // ── Timer (endTime-based — no tick events sent to clients) ──
        this.timerRemaining = 0; // server-side only, for score calc
        this.timerTotal = 0;
        this.endTime = 0; // epoch ms; clients count down locally
        this.timerInterval = null;
        this.priceTickInterval = null;
        this.heatMultiplier = 1.0;
        // ── Question Bank (admin-managed, overrides gameData when populated) ──
        this.questionBank = [];
        this.levelLimits = { 1: 10, 2: 5, 3: 5, 4: 10 };
        // ── Questions (prepared for current level) ──
        this.questions = [];
        // ── Players ──
        this.playerScores = new Map();
        this.currentAnswers = new Map();
        this.connectedPlayers = new Map(); // socketId → usn
        // ── Level 3 Hangman ──
        this.hangmanStates = new Map();
        // ── Level 5 Auction/Disaster ──
        this.auctionStates = new Map();
        this.currentPrices = {};
        this.priceMulti = 1.0;
        this.currentDisaster = null;
        this.l5phase = null;
        this.recentReactions = [];
        this.factionScores = { team_sentinel: 0, team_landsat: 0, team_modis: 0 };
        // ── Anomaly State ──
        this.anomalyTargets = new Set(); // 3 distinct error nodes
        this.anomalyFixers = new Set(); // USNs who resolved ALL 3
        // ── Stats ──
        this.levelCorrectCounts = [];
        this.levelTotalAnswered = [];
        this.io = io;
        // Hydrate state from last snapshot
        this.hydrateFromDb();
        // Snapshot tick counter
        let snapshotTick = 0;
        // Throttle broadcasts to once every 2.0 seconds to prevent "broadcast storms" on mobile/vercel
        this.broadcastInterval = setInterval(() => {
            if (this.leaderboardDirty) {
                this.io.emit('leaderboard_update', this.getLeaderboard());
                this.leaderboardDirty = false;
            }
            if (this.adminStatsDirty) {
                this.io.emit('admin_stats', this.getAdminStats());
                this.adminStatsDirty = false;
            }
            if (this.bankDirty) {
                this.io.emit('bank_questions', this.getBankQuestions());
                this.bankDirty = false;
            }
            // Save snapshot every ~20 seconds (10 ticks * 2.0s)
            snapshotTick++;
            if (snapshotTick >= 10) {
                this.snapshotToDb();
                snapshotTick = 0;
            }
        }, 1500);
    }
    // ═══════════════════════════════════════════════════════════════
    // QUESTION BANK (admin-managed)
    // ═══════════════════════════════════════════════════════════════
    loadBank(questions) {
        this.questionBank = questions.map(q => ({ ...q, id: q.id || (0, crypto_1.randomUUID)() }));
        this.broadcastAdminStats();
        this.broadcastBank();
    }
    addBankQuestion(q) {
        const newQ = { ...q, id: (0, crypto_1.randomUUID)() };
        this.questionBank.push(newQ);
        this.broadcastAdminStats();
        this.broadcastBank();
        return newQ;
    }
    updateBankQuestion(id, updates) {
        const idx = this.questionBank.findIndex(q => q.id === id);
        if (idx === -1)
            return false;
        this.questionBank[idx] = { ...this.questionBank[idx], ...updates, id };
        this.broadcastAdminStats();
        this.broadcastBank();
        return true;
    }
    deleteBankQuestion(id) {
        const before = this.questionBank.length;
        this.questionBank = this.questionBank.filter(q => q.id !== id);
        this.broadcastAdminStats();
        this.broadcastBank();
        return this.questionBank.length < before;
    }
    getBankQuestions() {
        return this.questionBank;
    }
    updateLevelLimit(level, limit) {
        if (level < 1 || level > 4)
            return;
        this.levelLimits[level] = Math.max(1, limit);
        this.broadcastAdminStats();
    }
    // ═══════════════════════════════════════════════════════════════
    // PLAYER REGISTRATION
    // ═══════════════════════════════════════════════════════════════
    registerPlayer(socketId, usn, name, faction) {
        this.connectedPlayers.set(socketId, usn);
        if (!this.playerScores.has(usn)) {
            this.playerScores.set(usn, {
                usn, name, totalScore: 0, levelScores: {}, currentLevelScore: 0,
                telemetry: [], streak: 0, achievements: [], faction: faction || 'team_sentinel'
            });
        }
    }
    registerSpectator(socketId) {
        this.connectedPlayers.set(socketId, `SPECTATOR_${socketId.slice(0, 4)}`);
    }
    unregisterPlayer(socketId) {
        this.connectedPlayers.delete(socketId);
    }
    kickPlayer(usn) {
        this.playerScores.delete(usn);
        // Remove from connectedPlayers (Map<socketId, usn>)
        for (const [sid, pUsn] of this.connectedPlayers.entries()) {
            if (pUsn === usn) {
                this.connectedPlayers.delete(sid);
            }
        }
        this.leaderboardDirty = true;
    }
    getPlayerCount() {
        // Unique USNs
        return new Set(this.connectedPlayers.values()).size;
    }
    getConnectedCount() {
        return this.connectedPlayers.size;
    }
    // ═══════════════════════════════════════════════════════════════
    // LEVEL LIFECYCLE
    // ═══════════════════════════════════════════════════════════════
    startLevel(level) {
        if (level < 1 || level > 5)
            return false;
        if (this.phase !== 'idle' && this.phase !== 'level_complete')
            return false;
        this.currentLevel = level;
        this.currentQIndex = 0;
        this.currentAnswers.clear();
        this.hangmanStates.clear();
        this.auctionStates.clear();
        this.levelCorrectCounts = [];
        this.levelTotalAnswered = [];
        // Reset current level score for all players
        for (const [, ps] of this.playerScores) {
            ps.currentLevelScore = 0;
        }
        // Prepare questions
        this.prepareQuestions(level);
        // Show intro
        this.phase = 'level_intro';
        const intro = gameData_1.LEVEL_INTROS[level];
        const payload = {
            level, startsIn: gameData_1.INTRO_TIME,
            icon: intro.icon, badge: intro.badge,
            title: intro.title, story: intro.story, rules: intro.rules,
        };
        this.io.emit('level_intro', payload);
        this.broadcastAdminStats();
        // Auto-start first question after intro
        this.startCountdown(gameData_1.INTRO_TIME, () => {
            if (level === 5) {
                this.startAuction();
            }
            else {
                this.startQuestion();
            }
        });
        return true;
    }
    prepareQuestions(level) {
        this.questions = [];
        // ── Bank-first: use admin Question Bank if it has questions for this level ──
        const bankForLevel = this.questionBank.filter(q => q.level === level);
        if (bankForLevel.length > 0) {
            const limit = this.levelLimits[level] || bankForLevel.length;
            const subset = shuffle(bankForLevel).slice(0, limit);
            this.questions = subset.map((bq, i) => {
                const total = subset.length;
                const timeLimit = bq.timerLimit || gameData_1.TIME_LIMITS[level] || 60;
                // Build sanitised ClientQuestion — answer/word/explanation NEVER included
                const clientQ = {
                    index: i, total, type: bq.type, timeLimit, points: bq.points,
                    hint: bq.hint1, hint2: bq.hint2, category: bq.category,
                    imageUrl: bq.imageUrl,
                    ...(bq.type === 'scramble' ? { scrambled: bq.scrambledText } : {}),
                    ...(bq.type === 'riddle' || bq.type === 'mcq' || bq.type === 'image_mcq'
                        ? { question: bq.questionText, options: bq.options } : {}),
                    ...(bq.type === 'hangman' ? { emoji: bq.questionText, wordLength: bq.word?.length ?? 0 } : {}),
                    ...(bq.difficulty ? { difficulty: bq.difficulty } : {}),
                };
                const answer = bq.type === 'mcq' || bq.type === 'image_mcq'
                    ? (bq.correctOptionIndex ?? 0)
                    : bq.type === 'hangman' ? normalise(bq.word || '') : normalise(bq.answer || '');
                return { clientQ, answer, explanation: bq.explanation ?? '', word: bq.word ? normalise(bq.word) : undefined };
            });
            return;
        }
        // ── Fallback: hard-coded gameData ──
        switch (level) {
            case 1: {
                const all = shuffle([
                    ...gameData_1.default.level1.scrambles.map(q => ({ ...q })),
                    ...gameData_1.default.level1.riddles.map(q => ({ ...q })),
                ]);
                this.questions = all.map((q, i) => {
                    if (q.type === 'scramble') {
                        const sq = q;
                        return {
                            clientQ: {
                                index: i, total: all.length, type: 'scramble',
                                timeLimit: gameData_1.TIME_LIMITS[1], points: sq.pts,
                                scrambled: sq.sc, hint: sq.hint, hint2: sq.hint2, category: sq.cat,
                            },
                            answer: normalise(sq.word),
                            explanation: `The answer is ${sq.word}.`,
                        };
                    }
                    else {
                        const rq = q;
                        return {
                            clientQ: {
                                index: i, total: all.length, type: 'riddle',
                                timeLimit: gameData_1.TIME_LIMITS[1], points: rq.pts,
                                question: rq.q, hint: rq.hint, hint2: rq.hint2, category: rq.cat,
                            },
                            answer: normalise(rq.ans),
                            explanation: `The answer is ${rq.ans}.`,
                        };
                    }
                });
                break;
            }
            case 2: {
                const qs = shuffle(gameData_1.default.level2.qs.map(q => ({ ...q })));
                this.questions = qs.map((q, i) => ({
                    clientQ: {
                        index: i, total: qs.length, type: 'image_mcq',
                        timeLimit: gameData_1.TIME_LIMITS[2], points: q.pts,
                        imageUrl: q.img, question: q.q, options: q.opts,
                        hint: q.hint, hint2: q.hint2,
                    },
                    answer: q.ans,
                    explanation: q.expl,
                }));
                break;
            }
            case 3: {
                const chs = shuffle(gameData_1.default.level3.chs.map(c => ({ ...c })));
                this.questions = chs.map((c, i) => ({
                    clientQ: {
                        index: i, total: chs.length, type: 'hangman',
                        timeLimit: gameData_1.TIME_LIMITS[3], points: c.pts,
                        emoji: c.em, hint: c.hint, hint2: c.hint2, wordLength: c.word.length,
                    },
                    answer: normalise(c.word),
                    explanation: c.expl,
                    word: normalise(c.word),
                }));
                break;
            }
            case 4: {
                const qs = shuffle(gameData_1.default.level4.qs.map(q => ({ ...q })));
                this.questions = qs.map((q, i) => ({
                    clientQ: {
                        index: i, total: qs.length, type: 'mcq',
                        timeLimit: gameData_1.TIME_LIMITS[4], points: q.pts,
                        question: q.q, options: q.opts, difficulty: q.diff,
                    },
                    answer: q.ans,
                    explanation: q.expl,
                }));
                break;
            }
        }
    }
    // ═══════════════════════════════════════════════════════════════
    // QUESTION FLOW (Levels 1-4)
    // ═══════════════════════════════════════════════════════════════
    startQuestion() {
        if (this.currentQIndex >= this.questions.length) {
            this.endLevel();
            return;
        }
        this.phase = 'question_active';
        this.currentAnswers.clear();
        this.hangmanStates.clear();
        const q = this.questions[this.currentQIndex];
        // Initialize hangman state for level 3
        if (this.currentLevel === 3 && q.word) {
            for (const usn of this.getActiveUSNs()) {
                this.hangmanStates.set(usn, {
                    guessedLetters: [], lives: 6,
                    revealedPositions: [], solved: false, submitted: false,
                });
            }
        }
        this.io.emit('question_start', {
            ...q.clientQ,
            timeLimit: Math.round(q.clientQ.timeLimit * this.heatMultiplier)
        });
        this.broadcastAdminStats();
        // Preload next question's image silently so clients cache it before it appears
        const nextQ = this.questions[this.currentQIndex + 1];
        if (nextQ?.clientQ.imageUrl) {
            this.io.emit('preload_asset', { url: nextQ.clientQ.imageUrl });
        }
        this.startCountdown(Math.round(q.clientQ.timeLimit * this.heatMultiplier), () => this.endQuestion());
    }
    handleAnswer(usn, answer) {
        if (this.phase !== 'question_active')
            return null;
        if (this.currentAnswers.has(usn))
            return null; // Already answered
        const q = this.questions[this.currentQIndex];
        if (!q)
            return null;
        let correct = false;
        if (typeof q.answer === 'string' && typeof answer === 'string') {
            // Strip ALL punctuation, spaces, special chars before comparing
            correct = normalise(answer) === normalise(q.answer);
        }
        else if (typeof q.answer === 'number' && typeof answer === 'number') {
            correct = answer === q.answer;
        }
        const preciseTimeLeft = Math.max(0, (this.endTime - Date.now()) / 1000);
        const score = calcScore(correct, preciseTimeLeft, this.timerTotal, q.clientQ.points);
        let finalScore = score;
        // Update player scores
        const ps = this.playerScores.get(usn);
        if (ps) {
            if (correct) {
                ps.streak++;
                // Achievements: Speed Demon (< 2.2s)
                const timeTaken = this.timerTotal - this.timerRemaining;
                if (timeTaken < 2.2) {
                    this.earnAchievement(usn, 'SPEED_DEMON');
                }
                // Achievements: Streak 5
                if (ps.streak === 5) {
                    this.earnAchievement(usn, 'STREAK_5');
                }
            }
            else {
                ps.streak = 0;
            }
            // Apply multiplier if streak >= 3
            finalScore = (ps.streak >= 3) ? Math.round(score * 1.2) : score;
            ps.totalScore += finalScore;
            ps.currentLevelScore += finalScore;
            // Log Telemetry
            ps.telemetry.push({
                qIndex: this.currentQIndex,
                timeTaken: this.timerTotal - this.timerRemaining,
                correct,
                points: finalScore
            });
            const pa = {
                usn, answer, timeRemaining: this.timerRemaining, correct, score: finalScore,
                totalScore: ps.totalScore,
                currentLevelScore: ps.currentLevelScore,
                telemetry: ps.telemetry
            };
            this.currentAnswers.set(usn, pa);
        }
        // Flag for throttled broadcast
        this.leaderboardDirty = true;
        this.adminStatsDirty = true;
        // Check if all active players have answered
        const activeUSNs = this.getActiveUSNs();
        const allAnswered = activeUSNs.every(u => this.currentAnswers.has(u));
        if (allAnswered && activeUSNs.length > 0) {
            this.clearTimer();
            this.endQuestion();
        }
        // For Admin: Calculate live stats distribution
        this.io.to('admins').emit('admin_live_stats', this.getLiveAnswerStats());
        return {
            usn,
            answer,
            timeRemaining: this.timerRemaining,
            correct,
            score: finalScore,
            totalScore: ps?.totalScore ?? 0,
            currentLevelScore: ps?.currentLevelScore ?? 0,
            telemetry: ps?.telemetry || []
        };
    }
    handlePowerup(usn, type) {
        if (this.phase !== 'question_active')
            return { success: false, error: 'Mission not active' };
        let ps = this.playerScores.get(usn);
        // Auto-register player if they're connected but not yet in playerScores
        if (!ps) {
            this.playerScores.set(usn, {
                usn, name: usn, totalScore: 0, levelScores: {}, currentLevelScore: 0,
                telemetry: [], streak: 0, achievements: [], faction: 'team_sentinel'
            });
            ps = this.playerScores.get(usn);
        }
        const q = this.questions[this.currentQIndex];
        if (!q)
            return { success: false, error: 'Mission data error' };
        if (type === 'radar_pulse') {
            const cost = 200;
            if (ps.totalScore < cost)
                return { success: false, error: 'Insufficient credits (200 req)' };
            // Only works for ImageMCQ (level 2) or Rapid Fire (level 4) if it has options
            if (!q.clientQ.options)
                return { success: false, error: 'Radar not compatible with this mission' };
            ps.totalScore -= cost;
            // Pick 2 wrong answers to remove
            const correctIdx = typeof q.answer === 'number'
                ? q.answer
                : q.clientQ.options.findIndex(o => normalise(o) === normalise(q.answer));
            const wrongIndices = q.clientQ.options.map((_, i) => i).filter(i => i !== correctIdx);
            const toRemove = [];
            while (toRemove.length < 2 && wrongIndices.length > 0) {
                const rand = Math.floor(Math.random() * wrongIndices.length);
                toRemove.push(wrongIndices.splice(rand, 1)[0]);
            }
            return { success: true, type: 'radar_pulse', removed: toRemove };
        }
        if (type === 'thermal_scan') {
            const cost = 300;
            if (ps.totalScore < cost)
                return { success: false, error: 'Insufficient credits (300 req)' };
            ps.totalScore -= cost;
            return { success: true, type: 'thermal_scan', distribution: this.getLiveAnswerStats().distribution };
        }
        return { success: false, error: 'Unknown toolkit' };
    }
    forceEndQuestion() {
        this.endQuestion();
    }
    endQuestion() {
        if (this.phase !== 'question_active')
            return;
        this.clearTimer();
        this.phase = 'question_review';
        const q = this.questions[this.currentQIndex];
        const answeredCount = this.currentAnswers.size;
        let correctCount = 0;
        let totalTimeUsed = 0;
        for (const [, pa] of this.currentAnswers) {
            if (pa.correct)
                correctCount++;
            totalTimeUsed += (this.timerTotal - pa.timeRemaining);
        }
        this.levelCorrectCounts.push(correctCount);
        this.levelTotalAnswered.push(answeredCount);
        const totalPlayers = this.getActiveUSNs().length;
        const accuracy = totalPlayers > 0 ? (correctCount / totalPlayers) : 0;
        // Dynamic Difficulty Scaling (Heat)
        if (accuracy > 0.8) {
            this.heatMultiplier = Math.max(0.6, this.heatMultiplier - 0.05);
        }
        else if (accuracy < 0.4) {
            this.heatMultiplier = Math.min(1.0, this.heatMultiplier + 0.05);
        }
        const payload = {
            correctAnswer: String(q.answer),
            explanation: q.explanation,
            stats: {
                totalPlayers,
                answeredCount,
                correctCount,
                avgTimeUsed: answeredCount > 0 ? Math.round(totalTimeUsed / answeredCount) : 0,
            },
        };
        this.updateFactionScores();
        this.io.emit('question_end', payload);
        this.broadcastAdminStats();
        // Generate AI Commentary
        MissionCommander_1.MissionCommander.generateCommentary(String(q.clientQ.question || q.clientQ.scrambled || 'Mission task'), String(q.answer), this.getLiveAnswerStats(), totalPlayers, this.phase).then(commentary => {
            this.io.emit('mission_commentary', commentary);
        });
        // Auto-advance after review period
        this.startCountdown(gameData_1.REVIEW_TIME, () => {
            this.currentQIndex++;
            if (this.currentQIndex >= this.questions.length) {
                this.endLevel();
            }
            else {
                this.startQuestion();
            }
        });
    }
    endLevel() {
        this.clearTimer();
        this.phase = 'level_complete';
        // Persist level scores and check for Perfect Level achievement
        for (const [usn, ps] of this.playerScores) {
            ps.levelScores[this.currentLevel] = ps.currentLevelScore;
            const levelTelemetry = ps.telemetry.slice(-this.levelCorrectCounts.length);
            const isPerfect = levelTelemetry.length > 0 && levelTelemetry.every(t => t.correct);
            if (isPerfect) {
                this.earnAchievement(usn, 'PERFECT_LEVEL');
            }
        }
        const leaderboard = this.getLeaderboard();
        const totalQ = this.levelCorrectCounts.length;
        const totalCorrect = this.levelCorrectCounts.reduce((a, b) => a + b, 0);
        const totalAnswered = this.levelTotalAnswered.reduce((a, b) => a + b, 0);
        const topEntry = leaderboard[0] || null;
        const payload = {
            level: this.currentLevel,
            leaderboard,
            levelStats: {
                totalQuestions: totalQ,
                avgAccuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
                topScorer: topEntry ? { name: topEntry.name, usn: topEntry.usn, score: topEntry.currentLevelScore } : null,
            },
        };
        this.io.emit('level_complete', payload);
        this.broadcastAdminStats();
        // Zero-Day Anomaly (Sabotage Event) triggered 8 seconds after Level 3 completion
        if (this.currentLevel === 3) {
            setTimeout(() => this.triggerAnomaly(), 8000);
        }
        // If level 5 just completed, game over
        if (this.currentLevel >= 5) {
            this.phase = 'game_over';
            this.io.emit('game_over', { finalLeaderboard: leaderboard });
        }
    }
    // ═══════════════════════════════════════════════════════════════
    // LEVEL 3 — HANGMAN
    // ═══════════════════════════════════════════════════════════════
    handleLetterGuess(usn, letter) {
        if (this.phase !== 'question_active' || this.currentLevel !== 3)
            return null;
        const hs = this.hangmanStates.get(usn);
        if (!hs || hs.submitted || hs.solved)
            return null;
        const upper = letter.toUpperCase();
        if (hs.guessedLetters.includes(upper))
            return null;
        hs.guessedLetters.push(upper);
        const q = this.questions[this.currentQIndex];
        if (!q || !q.word)
            return null;
        const word = q.word;
        const positions = [];
        for (let i = 0; i < word.length; i++) {
            if (word[i] === upper)
                positions.push(i);
        }
        const hit = positions.length > 0;
        if (hit) {
            hs.revealedPositions.push(...positions);
        }
        else {
            hs.lives--;
        }
        // Check if word is fully revealed
        const uniqueLetters = new Set(word.split(''));
        const allRevealed = [...uniqueLetters].every(l => l === ' ' || hs.guessedLetters.includes(l));
        if (allRevealed) {
            hs.solved = true;
            hs.submitted = true;
            // Achievements: Survivor (solve with 1 life)
            if (hs.lives === 1) {
                this.earnAchievement(usn, 'SURVIVOR');
            }
            // Auto-submit correct answer
            this.handleAnswer(usn, word);
        }
        else if (hs.lives <= 0) {
            hs.submitted = true;
            // Auto-submit wrong answer
            this.handleAnswer(usn, '');
        }
        const maskedWord = word.split('').map((char, idx) => (hs.revealedPositions.includes(idx) || char === ' ') ? char : '_').join('');
        return { hit, positions, livesLeft: hs.lives, solved: hs.solved, maskedWord };
    }
    // ═══════════════════════════════════════════════════════════════
    // LEVEL 5 — AUCTION
    // ═══════════════════════════════════════════════════════════════
    startAuction() {
        this.phase = 'auction_active';
        this.l5phase = 'auction';
        this.priceMulti = 1.0;
        this.auctionStates.clear();
        // Initialize prices
        this.currentPrices = {};
        for (const t of gameData_1.default.level5.tools) {
            this.currentPrices[t.id] = t.price;
        }
        // Initialize player auction state
        for (const usn of this.getActiveUSNs()) {
            this.auctionStates.set(usn, {
                budget: 10000, ownedTools: [], deployed: [], submitted: false,
            });
        }
        // Send tool catalog (without effectiveness values)
        const toolCatalog = gameData_1.default.level5.tools.map(t => ({
            id: t.id, name: t.name, price: t.price, icon: t.icon, desc: t.desc,
        }));
        this.io.emit('auction_start', { tools: toolCatalog, prices: this.currentPrices, timeLimit: gameData_1.AUCTION_TIME });
        this.broadcastAdminStats();
        // Price tick every 20s
        this.priceTickInterval = setInterval(() => {
            this.priceMulti += 0.1;
            for (const t of gameData_1.default.level5.tools) {
                this.currentPrices[t.id] = Math.round(t.price * this.priceMulti);
            }
            this.io.emit('auction_price_tick', { prices: this.currentPrices, multiplier: this.priceMulti });
        }, 20000);
        this.startCountdown(gameData_1.AUCTION_TIME, () => {
            if (this.priceTickInterval)
                clearInterval(this.priceTickInterval);
            this.priceTickInterval = null;
            // Achievements: Auction Master (spend exactly 10000)
            for (const [usn, as] of this.auctionStates) {
                if (as.budget === 0 && as.ownedTools.length > 0) {
                    this.earnAchievement(usn, 'AUCTION_MASTER');
                }
            }
            this.startDisaster();
        });
    }
    handleBuyTool(usn, toolId) {
        if (this.phase !== 'auction_active')
            return null;
        const as = this.auctionStates.get(usn);
        if (!as)
            return null;
        if (as.ownedTools.length >= 5)
            return { success: false, budget: as.budget, owned: as.ownedTools, error: 'Max 5 tools' };
        if (as.ownedTools.includes(toolId))
            return { success: false, budget: as.budget, owned: as.ownedTools, error: 'Already owned' };
        const price = this.currentPrices[toolId];
        if (!price || as.budget < price)
            return { success: false, budget: as.budget, owned: as.ownedTools, error: 'Insufficient budget' };
        as.budget -= price;
        as.ownedTools.push(toolId);
        return { success: true, budget: as.budget, owned: as.ownedTools };
    }
    handleSellTool(usn, toolId) {
        if (this.phase !== 'auction_active')
            return null;
        const as = this.auctionStates.get(usn);
        if (!as)
            return null;
        const idx = as.ownedTools.indexOf(toolId);
        if (idx === -1)
            return { success: false, budget: as.budget, owned: as.ownedTools };
        const refund = Math.round(this.currentPrices[toolId] * 0.7);
        as.budget += refund;
        as.ownedTools.splice(idx, 1);
        return { success: true, budget: as.budget, owned: as.ownedTools };
    }
    // ═══════════════════════════════════════════════════════════════
    // LEVEL 5 — DISASTER
    // ═══════════════════════════════════════════════════════════════
    startDisaster() {
        this.phase = 'disaster_active';
        this.l5phase = 'disaster';
        // Pick random disaster
        const disasters = gameData_1.default.level5.disasters;
        this.currentDisaster = disasters[Math.floor(Math.random() * disasters.length)];
        // Reset deployment for all
        for (const [, as] of this.auctionStates) {
            as.deployed = [];
            as.submitted = false;
        }
        const info = {
            id: this.currentDisaster.id, name: this.currentDisaster.name,
            icon: this.currentDisaster.icon, color: this.currentDisaster.color,
            desc: this.currentDisaster.desc, metrics: this.currentDisaster.metrics,
        };
        this.io.emit('disaster_start', { disaster: info, timeLimit: gameData_1.DISASTER_TIME });
        this.broadcastAdminStats();
        this.startCountdown(gameData_1.DISASTER_TIME, () => this.scoreLevel5());
    }
    handleDeployTools(usn, toolIds) {
        if (this.phase !== 'disaster_active')
            return false;
        const as = this.auctionStates.get(usn);
        if (!as || as.submitted)
            return false;
        // Validate all tools are owned
        const valid = toolIds.every(id => as.ownedTools.includes(id));
        if (!valid)
            return false;
        as.deployed = toolIds;
        as.submitted = true;
        // Check if all players have deployed
        const activeUSNs = this.getActiveUSNs();
        const allDeployed = activeUSNs.every(u => this.auctionStates.get(u)?.submitted);
        if (allDeployed && activeUSNs.length > 0) {
            this.clearTimer();
            setTimeout(() => this.scoreLevel5(), 1000);
        }
        return true;
    }
    scoreLevel5() {
        if (!this.currentDisaster) {
            this.endLevel();
            return;
        }
        const disasterId = this.currentDisaster.id;
        for (const [usn, as] of this.auctionStates) {
            // Tool effectiveness score
            let effScore = 0;
            for (const toolId of as.deployed) {
                const tool = gameData_1.default.level5.tools.find(t => t.id === toolId);
                if (tool)
                    effScore += tool.eff[disasterId] * 20;
            }
            // Combo bonuses
            let comboScore = 0;
            for (const combo of gameData_1.default.level5.combos) {
                if (combo.tools.every(t => as.deployed.includes(t))) {
                    comboScore += combo.bonus;
                }
            }
            // Budget efficiency bonus (remaining budget / 100)
            const budgetBonus = Math.round(as.budget / 100);
            const total = effScore + comboScore + budgetBonus;
            const ps = this.playerScores.get(usn);
            if (ps) {
                ps.totalScore += total;
                ps.currentLevelScore += total;
            }
        }
        this.leaderboardDirty = true;
        this.adminStatsDirty = true;
        this.updateFactionScores();
        this.io.emit('leaderboard_update', this.getLeaderboard());
        this.endLevel();
    }
    // ═══════════════════════════════════════════════════════════════
    // TIMER
    // ═══════════════════════════════════════════════════════════════
    startCountdown(seconds, onComplete) {
        this.clearTimer();
        this.timerRemaining = seconds;
        this.timerTotal = seconds;
        this.endTime = Date.now() + seconds * 1000;
        // Emit the single authoritative start event to clients
        this.io.emit('timer_start', {
            endTime: this.endTime,
            total: this.timerTotal,
            serverTime: Date.now()
        });
        this.timerInterval = setInterval(() => {
            if (this.paused) {
                // Shift end time forward while paused
                this.endTime += 1000;
                return;
            }
            this.timerRemaining--;
            if (this.timerRemaining <= 0) {
                this.clearTimer();
                onComplete();
            }
        }, 1000);
    }
    addTimerSeconds(seconds) {
        if (this.phase === 'idle' || this.phase === 'game_over')
            return;
        this.timerRemaining += seconds;
        this.timerTotal += seconds;
        this.endTime += seconds * 1000;
        this.io.emit('timer_override', { endTime: this.endTime, serverTime: Date.now() });
        this.broadcastAdminStats();
    }
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    togglePause() {
        this.paused = !this.paused;
        this.io.emit('game_paused', { paused: this.paused });
        // Whenever we pause or resume, recalculate the absolute end time
        // and broadcast it so clients can correct their local timers
        this.io.emit('timer_override', { endTime: this.endTime, serverTime: Date.now() });
        return this.paused;
    }
    // ═══════════════════════════════════════════════════════════════
    // LEADERBOARD
    // ═══════════════════════════════════════════════════════════════
    getLeaderboard() {
        const sorted = [...this.playerScores.values()].sort((a, b) => b.totalScore - a.totalScore);
        const entries = sorted
            .map((ps, i) => {
            // Track previous rank by looking up where they were before (if implemented)
            // Here we just map the structure, prevRank will be handled server-side logic if needed,
            // but for now, we just attach a static rank so the client has an absolute sorting key.
            return {
                rank: i + 1, name: ps.name, usn: ps.usn,
                totalScore: ps.totalScore, currentLevelScore: ps.currentLevelScore,
                streak: ps.streak, faction: ps.faction
            };
        })
            .slice(0, 50); // limit to 50 to save bandwidth & client rendering
        return entries;
    }
    // ═══════════════════════════════════════════════════════════════
    // SYNC (late joiners / reconnects)
    // ═══════════════════════════════════════════════════════════════
    getStateForClient(usn) {
        const ps = this.playerScores.get(usn) || null;
        const pa = this.currentAnswers.get(usn) || null;
        let hangmanState = null;
        if (this.currentLevel === 3 && this.phase === 'question_active') {
            const hs = this.hangmanStates.get(usn);
            const q = this.questions[this.currentQIndex];
            if (hs && q?.word) {
                const masked = q.word.split('').map((char, idx) => (hs.revealedPositions.includes(idx) || char === ' ') ? char : '_').join('');
                hangmanState = {
                    guessedLetters: hs.guessedLetters, lives: hs.lives,
                    revealedPositions: hs.revealedPositions, wordLength: q.word.length,
                    maskedWord: masked,
                };
            }
        }
        let auctionState = null;
        if (this.phase === 'auction_active' || this.phase === 'disaster_active') {
            const as = this.auctionStates.get(usn);
            if (as) {
                auctionState = { budget: as.budget, ownedTools: as.ownedTools, prices: this.currentPrices };
            }
        }
        let disasterInfo = null;
        if (this.phase === 'disaster_active' && this.currentDisaster) {
            disasterInfo = {
                id: this.currentDisaster.id, name: this.currentDisaster.name,
                icon: this.currentDisaster.icon, color: this.currentDisaster.color,
                desc: this.currentDisaster.desc, metrics: this.currentDisaster.metrics,
            };
        }
        const currentQ = (this.phase === 'question_active' && this.currentQIndex < this.questions.length)
            ? this.questions[this.currentQIndex].clientQ : null;
        // For level_intro, include intro data
        let levelIntro = null;
        if (this.phase === 'level_intro' && this.currentLevel > 0) {
            const intro = gameData_1.LEVEL_INTROS[this.currentLevel];
            if (intro) {
                levelIntro = {
                    level: this.currentLevel, startsIn: this.timerRemaining,
                    icon: intro.icon, badge: intro.badge, title: intro.title,
                    story: intro.story, rules: intro.rules,
                };
            }
        }
        return {
            phase: this.phase, currentLevel: this.currentLevel,
            currentQuestion: currentQ, timerEndTime: this.endTime,
            timerTotal: this.timerTotal, serverTime: Date.now(),
            leaderboard: this.getLeaderboard(), levelIntro,
            reviewData: null, myScore: ps, myAnswer: pa,
            hangmanState, auctionState, disasterInfo,
            factionScores: this.factionScores
        };
    }
    getAdminStats() {
        return {
            connectedCount: this.getConnectedCount(),
            phase: this.phase, currentLevel: this.currentLevel,
            currentQIndex: this.currentQIndex,
            totalQuestions: this.questions.length,
            answeredCount: this.currentAnswers.size,
            totalPlayers: this.getPlayerCount(),
            bankCount: this.questionBank.length,
            timerEndTime: this.endTime,
            levelLimits: this.levelLimits,
        };
    }
    broadcastAdminStats() {
        this.adminStatsDirty = true;
    }
    broadcastBank() {
        this.bankDirty = true;
    }
    // ═══════════════════════════════════════════════════════════════
    // RESET
    // ═══════════════════════════════════════════════════════════════
    reset() {
        this.clearTimer();
        if (this.priceTickInterval) {
            clearInterval(this.priceTickInterval);
            this.priceTickInterval = null;
        }
        this.phase = 'idle';
        this.currentLevel = 0;
        this.currentQIndex = 0;
        this.paused = false;
        this.timerRemaining = 0;
        this.timerTotal = 0;
        this.questions = [];
        this.playerScores.clear();
        this.currentAnswers.clear();
        this.hangmanStates.clear();
        this.auctionStates.clear();
        this.currentPrices = {};
        this.priceMulti = 1.0;
        this.currentDisaster = null;
        this.l5phase = null;
        this.levelCorrectCounts = [];
        this.levelTotalAnswered = [];
        this.recentReactions = [];
        this.factionScores = { team_sentinel: 0, team_landsat: 0, team_modis: 0 };
        this.io.emit('game_reset', {});
        this.broadcastAdminStats();
    }
    // ── Helpers ──
    getActiveUSNs() {
        return [...new Set(this.connectedPlayers.values())];
    }
    getLiveAnswerStats() {
        const distribution = {};
        for (const [, pa] of this.currentAnswers) {
            const val = String(pa.answer).toUpperCase();
            distribution[val] = (distribution[val] || 0) + 1;
        }
        const reactions = [...this.recentReactions];
        this.recentReactions = []; // Clear after broadcast
        return { distribution, reactions, factionScores: this.factionScores };
    }
    handleReaction(emoji) {
        const payload = { id: (0, crypto_1.randomUUID)(), emoji };
        this.recentReactions.push(payload);
        if (this.recentReactions.length > 50)
            this.recentReactions.shift();
        // Broadcast to EVERYONE for the floating overlay
        this.io.emit('reaction_broadcast', payload);
        this.adminStatsDirty = true; // Still update admin view
    }
    applyPenalty(usn, amount) {
        const ps = this.playerScores.get(usn);
        if (ps) {
            ps.totalScore = Math.max(0, ps.totalScore - amount);
            this.io.to(usn).emit('penalty_applied', { penalty: amount, newTotalScore: ps.totalScore });
            this.leaderboardDirty = true;
            this.broadcastAdminStats();
        }
    }
    updateFactionScores() {
        const totals = { team_sentinel: 0, team_landsat: 0, team_modis: 0 };
        const counts = { team_sentinel: 0, team_landsat: 0, team_modis: 0 };
        for (const ps of this.playerScores.values()) {
            const f = ps.faction || 'team_sentinel';
            totals[f] = (totals[f] || 0) + ps.totalScore;
            counts[f] = (counts[f] || 0) + 1;
        }
        for (const f in totals) {
            this.factionScores[f] = counts[f] > 0 ? Math.round(totals[f] / counts[f]) : 0;
        }
    }
    // ═══════════════════════════════════════════════════════════════
    // ANOMALY (SABOTAGE EVENT)
    // ═══════════════════════════════════════════════════════════════
    triggerAnomaly() {
        if (this.phase === 'game_over')
            return;
        this.phase = 'anomaly_active';
        this.anomalyFixers.clear();
        this.anomalyTargets.clear();
        this._anomalyPatchedBy = new Map();
        // Create a 3×3 grid (9 nodes). Pick exactly 3 distinct indices.
        const allIndices = Array.from({ length: 9 }, (_, i) => i);
        const picked = [];
        while (picked.length < 3) {
            const idx = allIndices.splice(Math.floor(Math.random() * allIndices.length), 1)[0];
            picked.push(idx);
        }
        picked.forEach(i => this.anomalyTargets.add(`node_${i}`));
        const targetIdsArr = [...this.anomalyTargets];
        const payload = {
            type: 'patch',
            targetIds: targetIdsArr,
            targetId: targetIdsArr[0], // legacy fallback
            gridSize: 9,
            timeLimit: 15
        };
        this.io.emit('anomaly_detected', payload);
        this.broadcastAdminStats();
        // Trigger Urgent AI Commentary
        MissionCommander_1.MissionCommander.generateCommentary("TRIPLE SECURITY BREACH", targetIdsArr.join(','), { distribution: {}, factionScores: {} }, this.getPlayerCount(), this.phase).then(commentary => {
            this.io.emit('mission_commander_comment', commentary);
        });
        // Start 15-second countdown
        this.startCountdown(15, () => this.endAnomaly());
    }
    triggerScenario(type) {
        if (this.phase === 'game_over' || this.phase === 'idle')
            return;
        if (type === 'solar_flare') {
            // Speed up timer for everyone
            if (this.timerRemaining > 10) {
                this.timerRemaining = Math.floor(this.timerRemaining / 2);
                this.endTime = Date.now() + this.timerRemaining * 1000;
                this.io.emit('timer_start', {
                    endTime: this.endTime,
                    total: this.timerTotal,
                    serverTime: Date.now(),
                    flare: true
                });
            }
            this.io.emit('mission_event', { type: 'scenario', text: 'SOLAR FLARE: TIMERS COMPRESSED', user: 'SYSTEM' });
        }
        if (type === 'data_corruption') {
            this.io.emit('targeted_sabotage', { type: 'glitch' });
            this.io.emit('mission_event', { type: 'scenario', text: 'DATA CORRUPTION: DISTORTION ACTIVE', user: 'SYSTEM' });
        }
    }
    sabotagePlayer(targetUsn) {
        this.io.to(targetUsn).emit('targeted_sabotage', { type: 'glitch' });
    }
    handleAnomalyFix(usn, targetId) {
        if (this.phase !== 'anomaly_active')
            return false;
        // Validate this is actually one of the 3 error nodes
        if (!this.anomalyTargets.has(targetId))
            return false;
        // Track per-player patched nodes using a Map
        if (!this._anomalyPatchedBy)
            this._anomalyPatchedBy = new Map();
        const patchedByMap = this._anomalyPatchedBy;
        if (!patchedByMap.has(usn))
            patchedByMap.set(usn, new Set());
        patchedByMap.get(usn).add(targetId);
        // Check if this player has patched ALL 3 targets
        if (patchedByMap.get(usn).size >= this.anomalyTargets.size) {
            this.anomalyFixers.add(usn);
            return true; // All 3 patched — signal success to client
        }
        return false; // Still more nodes to patch
    }
    endAnomaly() {
        if (this.phase !== 'anomaly_active')
            return;
        // Penalty for those who didn't fix it
        const activeUSNs = this.getActiveUSNs();
        for (const usn of activeUSNs) {
            if (!this.anomalyFixers.has(usn)) {
                const ps = this.playerScores.get(usn);
                if (ps) {
                    const penalty = 500;
                    ps.totalScore = Math.max(0, ps.totalScore - penalty);
                    // Emit individual result
                    this.io.to(usn).emit('anomaly_resolved', {
                        success: false,
                        penalty,
                        newTotalScore: ps.totalScore
                    });
                }
            }
            else {
                const ps = this.playerScores.get(usn);
                if (ps) {
                    this.io.to(usn).emit('anomaly_resolved', {
                        success: true,
                        penalty: 0,
                        newTotalScore: ps.totalScore
                    });
                }
            }
        }
        this.phase = 'idle'; // Or return to where it was
        this.io.emit('anomaly_cleared', {});
        this.leaderboardDirty = true;
        this.broadcastAdminStats();
    }
    // ═══════════════════════════════════════════════════════════════
    // PERSISTENCE (Crash Recovery)
    // ═══════════════════════════════════════════════════════════════
    async snapshotToDb() {
        try {
            await (0, connect_1.default)();
            await GameSnapshot_1.GameSnapshot.findOneAndUpdate({ sessionId: 'live' }, {
                $set: {
                    phase: this.phase,
                    currentLevel: this.currentLevel,
                    currentQIndex: this.currentQIndex,
                    endTime: this.endTime,
                    timerTotal: this.timerTotal,
                    paused: this.paused,
                    playerScores: Array.from(this.playerScores.values()),
                    questionBank: this.questionBank,
                    levelLimits: this.levelLimits,
                    auctionStates: Array.from(this.auctionStates.entries()),
                }
            }, { upsert: true });
        }
        catch (err) {
            console.error('Error saving game snapshot to DB:', err);
        }
    }
    async hydrateFromDb() {
        try {
            await (0, connect_1.default)();
            const snap = await GameSnapshot_1.GameSnapshot.findOne({ sessionId: 'live' });
            if (!snap)
                return;
            this.phase = snap.phase;
            this.currentLevel = snap.currentLevel;
            this.currentQIndex = snap.currentQIndex;
            this.endTime = snap.endTime;
            this.timerTotal = snap.timerTotal;
            this.paused = snap.paused;
            this.timerRemaining = Math.max(0, Math.ceil((this.endTime - Date.now()) / 1000));
            if (Array.isArray(snap.questionBank)) {
                this.questionBank = snap.questionBank;
            }
            if (snap.levelLimits) {
                this.levelLimits = { ...this.levelLimits, ...snap.levelLimits };
            }
            this.playerScores.clear();
            if (Array.isArray(snap.playerScores)) {
                for (const ps of snap.playerScores) {
                    this.playerScores.set(ps.usn, {
                        ...ps,
                        telemetry: ps.telemetry || [],
                        streak: ps.streak || 0,
                        achievements: ps.achievements || []
                    });
                }
            }
            this.auctionStates.clear();
            if (Array.isArray(snap.auctionStates)) {
                for (const [usn, as] of snap.auctionStates) {
                    this.auctionStates.set(usn, as);
                }
            }
            // Re-prepare questions based on current bank and level
            if (this.currentLevel > 0) {
                this.prepareQuestions(this.currentLevel);
            }
            // If we were in the middle of a question and the timer was still running
            if (this.timerRemaining > 0 && (this.phase === 'question_active' || this.phase === 'auction_active' || this.phase === 'disaster_active')) {
                let callback = () => this.endQuestion();
                if (this.phase === 'auction_active')
                    callback = () => {
                        if (this.priceTickInterval)
                            clearInterval(this.priceTickInterval);
                        this.priceTickInterval = null;
                        this.startDisaster(); // Call original method manually here is tricky, using cast.
                        // Note: In real setup, you might need a public method to trigger next phase cleanly.
                        // However, this is just for crash recovery.
                    };
                // Simplified recovery countdown
                this.clearTimer();
                this.startCountdown(this.timerRemaining, () => {
                    if (this.phase === 'question_active')
                        this.endQuestion();
                    // Implement other phase endings if needed here
                });
            }
            console.log('✅ Hydrated game engine from DB snapshot');
        }
        catch (err) {
            console.error('Error hydrating game engine from DB:', err);
        }
    }
}
exports.GameEngine = GameEngine;
