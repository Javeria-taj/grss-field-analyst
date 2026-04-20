import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { addScore, userExists } from '../sockets/leaderboard';

const router = express.Router();
const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

const authSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  usn: z.string().min(4).max(50).trim(), // Up to 50 for SUPER_ADMIN
});

// ─── LOGIN ENDPOINT ──────────────────────────────────────────────────────────
router.post('/login', (req: Request, res: Response) => {
  const result = authSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: 'error', errors: result.error.flatten().fieldErrors });
  }

  const { name, usn } = result.data;
  
  const ADMIN_USN = (process.env.ADMIN_USN || 'SUPER_ADMIN').toUpperCase();
  const ADMIN_NAME = (process.env.ADMIN_NAME || 'javeria_taj').toLowerCase();
  
  const isAdmin = (usn.toUpperCase() === ADMIN_USN && name.toLowerCase() === ADMIN_NAME);

  // If not admin, check if they exist in the roster
  if (!isAdmin && !userExists(usn.toUpperCase())) {
    return res.status(404).json({ status: 'error', message: 'USN not found in active roster. Please register first.' });
  }

  const payload = {
    name,
    usn: usn.toUpperCase(),
    isAdmin,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 12 * 60 * 60 * 1000 // 12 hours
  });

  res.status(200).json({ status: 'ok', user: payload });
});

// ─── REGISTER ENDPOINT ───────────────────────────────────────────────────────
router.post('/register', (req: Request, res: Response) => {
  const result = authSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: 'error', errors: result.error.flatten().fieldErrors });
  }

  const { name, usn } = result.data;
  const upperUsn = usn.toUpperCase();

  // Ensure they don't already exist
  if (userExists(upperUsn)) {
    return res.status(409).json({ status: 'error', message: 'USN already registered. Please login.' });
  }

  const ADMIN_USN = (process.env.ADMIN_USN || 'SUPER_ADMIN').toUpperCase();
  const ADMIN_NAME = (process.env.ADMIN_NAME || 'javeria_taj').toLowerCase();
  const isAdmin = (upperUsn === ADMIN_USN && name.toLowerCase() === ADMIN_NAME);

  if (!isAdmin) {
    // Initialize in the personnel roster
    addScore({ name, usn: upperUsn, score: 0 });
  }

  const payload = {
    name,
    usn: upperUsn,
    isAdmin,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 12 * 60 * 60 * 1000 // 12 hours
  });

  res.status(201).json({ status: 'ok', user: payload });
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ status: 'ok' });
});

router.get('/me', (req: Request, res: Response) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ status: 'ok', user: decoded });
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
});

export default router;
