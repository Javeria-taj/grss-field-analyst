import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import setupLeaderboardSockets from './sockets/leaderboard';

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

const app = express();
const server = http.createServer(app);

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL ?? 'http://localhost:3000',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin "${origin}" not allowed`));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,         // allow cookies (for future JWT)
};

// ─── SOCKET.IO ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 20000,
  pingInterval: 10000,
  connectionStateRecovery: { maxDisconnectionDuration: 30000 },
});

// ─── RATE LIMITING ──────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min window
  max: 150,                   // generous for live-event bursts
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests – please slow down.' },
});

// Stricter limiter for write-like endpoints if added later
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded.' },
});

// ─── SECURITY HEADERS ───────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // development flexibility
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '64kb' }));   // cap body size to prevent large-payload attacks
app.use(cookieParser());
app.use('/api', apiLimiter);

// ─── DATABASE ───────────────────────────────────────────────────────────────
connectDB();

// ─── ROUTES ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err.message?.startsWith('CORS policy')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── SOCKETS ─────────────────────────────────────────────────────────────────
setupLeaderboardSockets(io);

// ─── START ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '4000', 10);
server.listen(PORT, () => {
  console.log(`🚀 Backend server listening on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🌐 Allowed origin: ${allowedOrigins.join(', ')}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
