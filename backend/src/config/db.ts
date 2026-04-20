import mongoose from 'mongoose';

let isDbConnected: boolean = false;

let reconnectTimer: NodeJS.Timeout | null = null;

const RECONNECT_DELAY_MS = 10_000; // 10 seconds between retry attempts
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/grss';

/**
 * Attempts to connect to MongoDB. Falls back to local-memory mode gracefully.
 * Schedules automatic reconnection if initial connection fails.
 */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');
    isDbConnected = true;

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Will attempt reconnect...');
      isDbConnected = false;
      scheduleReconnect();
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error]', err.message);
    });
  } catch (err) {
    console.warn('⚠️  MongoDB unavailable. Running in Local Memory Mode.');
    console.warn('   Scores will not persist between server restarts.');
    isDbConnected = false;
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return; // avoid duplicate timers
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    console.log('🔄 Attempting MongoDB reconnect...');
    await connectDB();
  }, RECONNECT_DELAY_MS);
}

export function getDbStatus(): boolean {
  return isDbConnected;
}
