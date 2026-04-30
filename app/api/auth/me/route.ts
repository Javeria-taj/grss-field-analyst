import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ status: 'ok', user: { ...(decoded as object), token } });
  } catch (err) {
    console.error('Session validation error:', err);
    return NextResponse.json({ status: 'error', message: 'Invalid token' }, { status: 401 });
  }
}
