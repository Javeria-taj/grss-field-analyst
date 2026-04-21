import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Fetch users sorted by score (excluding admins)
    const users = await User.find({ isAdmin: false })
      .sort({ score: -1 })
      .limit(100)
      .select('name usn score lastActive')
      .exec();

    const entries = users.map(u => ({
      name: u.name,
      usn: u.usn,
      score: u.score,
      date: u.lastActive
    }));

    return NextResponse.json({ 
      status: 'ok', 
      count: entries.length, 
      entries 
    });
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
