"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const leaderboard_1 = require("../sockets/leaderboard");
const router = express_1.default.Router();
const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';
const authSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).trim(),
    usn: zod_1.z.string().min(4).max(50).trim(), // Up to 50 for SUPER_ADMIN
});
// ─── LOGIN ENDPOINT ──────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
    const result = authSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ status: 'error', errors: result.error.flatten().fieldErrors });
    }
    const { name, usn } = result.data;
    const ADMIN_USN = (process.env.ADMIN_USN || 'SUPER_ADMIN').toUpperCase();
    const ADMIN_NAME = (process.env.ADMIN_NAME || 'javeria_taj').toLowerCase();
    const isAdmin = (usn.toUpperCase() === ADMIN_USN && name.toLowerCase() === ADMIN_NAME);
    // If not admin, check if they exist in the roster
    if (!isAdmin && !(0, leaderboard_1.userExists)(usn.toUpperCase())) {
        return res.status(404).json({ status: 'error', message: 'USN not found in active roster. Please register first.' });
    }
    const payload = {
        name,
        usn: usn.toUpperCase(),
        isAdmin,
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });
    res.status(200).json({ status: 'ok', user: payload });
});
// ─── REGISTER ENDPOINT ───────────────────────────────────────────────────────
router.post('/register', (req, res) => {
    const result = authSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ status: 'error', errors: result.error.flatten().fieldErrors });
    }
    const { name, usn } = result.data;
    const upperUsn = usn.toUpperCase();
    // Ensure they don't already exist
    if ((0, leaderboard_1.userExists)(upperUsn)) {
        return res.status(409).json({ status: 'error', message: 'USN already registered. Please login.' });
    }
    const ADMIN_USN = (process.env.ADMIN_USN || 'SUPER_ADMIN').toUpperCase();
    const ADMIN_NAME = (process.env.ADMIN_NAME || 'javeria_taj').toLowerCase();
    const isAdmin = (upperUsn === ADMIN_USN && name.toLowerCase() === ADMIN_NAME);
    if (!isAdmin) {
        // Initialize in the personnel roster
        (0, leaderboard_1.addScore)({ name, usn: upperUsn, score: 0 });
    }
    const payload = {
        name,
        usn: upperUsn,
        isAdmin,
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });
    res.status(201).json({ status: 'ok', user: payload });
});
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({ status: 'ok' });
});
router.get('/me', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token)
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        res.status(200).json({ status: 'ok', user: decoded });
    }
    catch (err) {
        res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
});
exports.default = router;
