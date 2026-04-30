import dotenv from 'dotenv';
import path from 'path';
// Load env from the root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import { Server } from 'socket.io';
import setupGameSockets from './sockets/game';
import dbConnect from '../lib/db/connect';

// Connect to MongoDB
dbConnect();

const PORT = parseInt(process.env.SOCKET_PORT ?? process.env.PORT ?? '4001', 10);
const isDev = process.env.NODE_ENV !== 'production';

// ... (keep your imports and dbConnect setup as is)

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GRSS Realtime Server is running\n');
});

// UPGRADED SOCKET CONFIGURATION
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // 1. Always allow in development
      if (isDev) return callback(null, true);

      // 2. Safely handle multiple URLs (useful for Vercel preview environments)
      const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
        .split(',')
        .map(url => url.trim().replace(/\/$/, '')); // Remove trailing slashes just in case

      // 3. Allow if it matches our list, or if there's no origin (like mobile app clients or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
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

setupGameSockets(io);


server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dedicated Realtime Server listening on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://0.0.0.0:${PORT}`);
});
