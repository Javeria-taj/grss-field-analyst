const express = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { addScore } = require('../sockets/leaderboard');

const router = express.Router();
const JWT_SECRET = process.env.SESSION_SECRET || 'grss_super_secret_change_in_production';

const loginSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  usn: z.string().min(4).max(50).trim(), // Up to 50 for SUPER_ADMIN
});

router.post('/login', (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ status: 'error', errors: result.error.flatten().fieldErrors });
  }

  const { name, usn } = result.data;
  
  // Initialize in the personnel roster tracked by sockets (existing ranks will not be overwritten by 0)
  if (usn.toUpperCase() !== 'SUPER_ADMIN') {
    addScore({ name, usn: usn.toUpperCase(), score: 0 });
  }

  // Option B: Hardcoded credentials for Admin Dashboard access
  const isAdmin = (usn.toUpperCase() === 'SUPER_ADMIN' && name.toLowerCase() === 'javeria_taj');
  
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

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ status: 'ok' });
});

router.get('/me', (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ status: 'ok', user: decoded });
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
});

module.exports = router;
