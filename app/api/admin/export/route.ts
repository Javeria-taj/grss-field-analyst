import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { GameSnapshot } from '@/lib/db/models/GameSnapshot';

export async function GET() {
  try {
    await dbConnect();
    const snap = await GameSnapshot.findOne({ sessionId: 'live' });
    
    if (!snap || !snap.playerScores) {
      return NextResponse.json({ error: 'No game data found' }, { status: 404 });
    }

    const headers = ['Rank', 'Name', 'USN', 'Faction', 'Total Score', 'Mission 1', 'Mission 2', 'Mission 3', 'Mission 4', 'Mission 5'];
    const rows = snap.playerScores.map((ps: any, i: number) => [
      i + 1,
      ps.name,
      ps.usn,
      ps.faction || 'N/A',
      ps.totalScore,
      ps.levelScores['1'] || 0,
      ps.levelScores['2'] || 0,
      ps.levelScores['3'] || 0,
      ps.levelScores['4'] || 0,
      ps.levelScores['5'] || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=grss_mission_report.csv'
      }
    });
  } catch (err) {
    console.error('Export Error:', err);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
