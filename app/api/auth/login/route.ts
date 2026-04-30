import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

const authSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  usn: z.string().min(4).max(50).trim(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const result = authSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: 'error', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, usn } = result.data;
    const upperUsn = usn.toUpperCase();

    const ADMIN_USN = (process.env.ADMIN_USN || 'SUPER_ADMIN').toUpperCase();
    const ADMIN_NAME = (process.env.ADMIN_NAME || 'javeria_taj').toLowerCase();

    const isAdmin = (upperUsn === ADMIN_USN && name.toLowerCase() === ADMIN_NAME);

    // Retrieve user from DB
    const dbUser = await User.findOne({ usn: upperUsn });

    // If not admin, check if they exist and name matches
    if (!isAdmin) {
      if (!dbUser) {
        return NextResponse.json(
          { status: 'error', message: 'USN not found in active roster. Please register first.' },
          { status: 404 }
        );
      }
      if (dbUser.name.toLowerCase() !== name.toLowerCase()) {
        return NextResponse.json(
          { status: 'error', message: 'Credentials mismatch. Name does not match registered USN.' },
          { status: 401 }
        );
      }
    }

    // JWT contains identity only — keeps cookie small and prevents stale progress data in token
    const jwtPayload = { name: dbUser?.name || name, usn: upperUsn, isAdmin, faction: dbUser?.faction };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '12h' });

    // Full progress data returned in the response body for Zustand to hydrate from
    const responseUser = {
      name: dbUser?.name || name,
      usn: upperUsn,
      isAdmin,
      unlocked: dbUser?.unlocked || [1],
      completed: dbUser?.completed || [],
      scores: dbUser?.scores || {},
      powerups: dbUser?.powerups || { hint: 2, skip: 1, freeze: 1 },
      telemetry: dbUser?.telemetry || [],
      totalScore: dbUser?.score || 0,
      levelState: dbUser?.levelState || {},
      faction: dbUser?.faction,
      streak: dbUser?.streak || 0,
    };

    const response = NextResponse.json({ status: 'ok', user: responseUser, token });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
