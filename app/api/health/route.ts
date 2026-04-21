import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const dbConnected = mongoose.connection.readyState === 1;

    return NextResponse.json({
      status: 'online',
      db_connected: dbConnected,
      mode: dbConnected ? 'production' : 'local-memory-fallback',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'online',
      db_connected: false,
      mode: 'local-memory-fallback',
      timestamp: new Date().toISOString(),
    });
  }
}
