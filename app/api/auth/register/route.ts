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

    // Check if user already exists
    const existingUser = await User.findOne({ usn: upperUsn });
    if (existingUser) {
      return NextResponse.json(
        { status: 'error', message: 'USN already registered. Please login.' },
        { status: 409 }
      );
    }

    const ADMIN_USN = (process.env.ADMIN_USN || 'SUPER_ADMIN').toUpperCase();
    const ADMIN_NAME = (process.env.ADMIN_NAME || 'javeria_taj').toLowerCase();
    const isAdmin = (upperUsn === ADMIN_USN && name.toLowerCase() === ADMIN_NAME);

    // Create the user in the personnel roster (DB)
    if (!isAdmin) {
      await User.create({
        name,
        usn: upperUsn,
        score: 0,
        unlocked: [1],
        completed: [],
        scores: {},
        powerups: { hint: 2, skip: 1, freeze: 1 },
        telemetry: [],
        levelState: {}
      });
    }

    // JWT contains identity only — keeps cookie small
    const jwtPayload = { name, usn: upperUsn, isAdmin };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '12h' });

    // Full initial state returned in response body for Zustand to hydrate from
    const responseUser = {
      name,
      usn: upperUsn,
      isAdmin,
      unlocked: [1],
      completed: [],
      scores: {},
      powerups: { hint: 2, skip: 1, freeze: 1 },
      telemetry: [],
      totalScore: 0,
    };

    const response = NextResponse.json({ status: 'ok', user: responseUser }, { status: 201 });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
