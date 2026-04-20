"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const api_1 = __importDefault(require("./routes/api"));
const auth_1 = __importDefault(require("./routes/auth"));
const leaderboard_1 = __importDefault(require("./sockets/leaderboard"));
// ─── ENV VALIDATION ──────────────────────────────────────────────────────────
function validateEnv() {
    const required = ['MONGODB_URI', 'SESSION_SECRET', 'ADMIN_NAME', 'ADMIN_USN'];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
        console.error(`❌ CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }
}
validateEnv();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.CLIENT_URL ?? 'http://localhost:3000',
];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS policy: origin "${origin}" not allowed`));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true, // allow cookies (for future JWT)
};
// ─── SOCKET.IO ──────────────────────────────────────────────────────────────
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
    pingTimeout: 20000,
    pingInterval: 10000,
    connectionStateRecovery: { maxDisconnectionDuration: 30000 },
});
// ─── RATE LIMITING ──────────────────────────────────────────────────────────
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 min window
    max: 150, // generous for live-event bursts
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests – please slow down.' },
});
// Stricter limiter for write-like endpoints if added later
const strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Rate limit exceeded.' },
});
// ─── SECURITY HEADERS ───────────────────────────────────────────────────────
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});
// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // development flexibility
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '64kb' })); // cap body size to prevent large-payload attacks
app.use((0, cookie_parser_1.default)());
app.use('/api', apiLimiter);
// ─── DATABASE ───────────────────────────────────────────────────────────────
(0, db_1.connectDB)();
// ─── ROUTES ─────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.use('/api', api_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Global error handler
app.use((err, req, res, _next) => {
    if (err.message?.startsWith('CORS policy')) {
        return res.status(403).json({ error: err.message });
    }
    console.error('[Server Error]', err);
    res.status(500).json({ error: 'Internal server error' });
});
// ─── SOCKETS ─────────────────────────────────────────────────────────────────
(0, leaderboard_1.default)(io);
// ─── START ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '4000', 10);
server.listen(PORT, () => {
    console.log(`🚀 Backend server listening on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🌐 Allowed origin: ${allowedOrigins.join(', ')}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
