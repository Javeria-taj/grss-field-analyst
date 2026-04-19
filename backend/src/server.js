require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Fallback for Leaderboard (if DB is missing)
let leaderboardFallback = [];
let isDbConnected = false;

// Basic Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    db_connected: isDbConnected,
    mode: isDbConnected ? 'production' : 'local-memory-fallback'
  });
});

// MongoDB Connection with Graceful Fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grss';
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    isDbConnected = true;
  })
  .catch(err => {
    console.warn('⚠️ MongoDB not found. Switching to Local Memory Mode.');
    console.log('💡 Note: Scores will not persist between server restarts.');
    isDbConnected = false;
  });

// Socket.io Logic
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  
  // Send current leaderboard on join
  socket.emit('leaderboard_update', leaderboardFallback);

  socket.on('submit_score', (data) => {
    // Basic validation
    if (!data.name || !data.score) return;
    
    leaderboardFallback.push({ name: data.name, score: data.score, usn: data.usn, date: new Date() });
    leaderboardFallback.sort((a,b) => b.score - a.score);
    leaderboardFallback = leaderboardFallback.slice(0, 50); // Keep top 50
    
    io.emit('leaderboard_update', leaderboardFallback);
  });

  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Backend server listening on port ${PORT}`);
  console.log(`📡 API Status: http://localhost:${PORT}`);
});
