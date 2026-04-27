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

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GRSS Realtime Server is running\n');
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupGameSockets(io);

server.listen(PORT, () => {
  console.log(`🚀 Dedicated Realtime Server listening on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
});
