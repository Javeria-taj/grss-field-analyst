import dotenv from 'dotenv';
import path from 'path';
// Load env from the root (local dev only — on Render, vars come from the dashboard)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import setupGameSockets from './sockets/game';
import dbConnect from '../lib/db/connect';

// Connect to MongoDB. dbConnect() re-throws on failure, so it MUST be caught —
// an unhandled rejection here would kill the process and crash-loop the service
// whenever Atlas is slow to answer on a cold start. Retry in the background
// instead and let /health report "degraded" until the connection lands.
function connectWithRetry(attempt = 1) {
  dbConnect().catch((err: Error) => {
    const delay = Math.min(30000, 2000 * attempt);
    console.warn(`⚠️ MongoDB connect attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms`);
    setTimeout(() => connectWithRetry(attempt + 1), delay);
  });
}
connectWithRetry();

// Last line of defence: never let a stray rejection take the game down mid-event.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

// Render injects PORT and expects the process to bind to it. It must win over
// SOCKET_PORT, which is only a local-dev convenience. HOST must be 0.0.0.0 so
// the service is reachable from outside the container.
const PORT = parseInt(process.env.PORT ?? process.env.SOCKET_PORT ?? '4001', 10);
const HOST = process.env.HOST ?? '0.0.0.0';
const isDev = process.env.NODE_ENV !== 'production';

// Origins allowed to open a socket. Comma-separated; entries may use a single
// '*' wildcard in the hostname so Vercel preview deploys keep working, e.g.
//   https://grss.vercel.app,https://*.vercel.app
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

function isOriginAllowed(origin: string): boolean {
  const clean = origin.replace(/\/$/, '');
  return allowedOrigins.some(allowed => {
    if (!allowed.includes('*')) return allowed === clean;
    const pattern = new RegExp(
      '^' + allowed.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^./]+') + '$'
    );
    return pattern.test(clean);
  });
}

const server = http.createServer((req, res) => {
  // Liveness probe — point Render's "Health Check Path" here.
  // Deliberately 200 whenever the process is serving, even if Mongo is down:
  // a transient Atlas blip must not make Render restart the service and drop
  // every socket (and the in-memory game state) mid-event.
  if (req.url === '/health' || req.url === '/healthz') {
    const dbUp = mongoose.connection.readyState === 1;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: dbUp ? 'ok' : 'degraded',
      db: mongoose.connection.readyState,
      uptime: Math.round(process.uptime()),
      connections: io.engine.clientsCount,
    }));
    return;
  }

  // Strict readiness probe — 503 until Mongo is actually reachable.
  // For your own monitoring/debugging; do NOT point Render's health check here.
  if (req.url === '/ready') {
    const dbUp = mongoose.connection.readyState === 1;
    res.writeHead(dbUp ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ready: dbUp, db: mongoose.connection.readyState }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GRSS Realtime Server is running\n');
});

// UPGRADED SOCKET CONFIGURATION
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // 1. Always allow in development
      if (isDev) return callback(null, true);

      // 2. Allow if it matches our list, or if there's no origin (like mobile app clients or Postman)
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: rejected origin ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // 4. Crucial for Render's Load Balancers
  pingTimeout: 60000,
  pingInterval: 25000,
});

const engine = setupGameSockets(io);

server.listen(PORT, HOST, () => {
  console.log(`🚀 Dedicated Realtime Server listening on ${HOST}:${PORT}`);
  console.log(`🌐 Allowed origins: ${isDev ? '(dev: all)' : allowedOrigins.join(', ')}`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
// Render sends SIGTERM on every deploy/restart and SIGKILLs ~30s later. Flush
// the in-memory game state to Mongo first so a redeploy mid-event can rehydrate.
let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received — persisting game state before exit...`);

  const timer = setTimeout(() => {
    console.error('Shutdown timed out, forcing exit.');
    process.exit(1);
  }, 15000);

  try {
    if (mongoose.connection.readyState === 1) {
      await engine.snapshotToDb();
      console.log('✅ Game snapshot persisted.');
    }
    io.close();
    server.close();
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error during shutdown:', err);
  } finally {
    clearTimeout(timer);
    process.exit(0);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
