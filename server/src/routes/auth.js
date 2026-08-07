import { Router } from 'express';
import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { createUser, getUserByEmail, getUserById, toPublicUser } from '../store/users.js';
import { requireAuth, signSession, setSessionCookie, clearSessionCookie } from '../middleware/auth.js';

const router = Router();
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

router.post('/signup', express.json(), async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body || {};

    if (!email || !EMAIL_PATTERN.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!firstName?.trim() || !lastName?.trim()) return res.status(400).json({ error: 'First and last name are required' });

    if (getUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
    });

    setSessionCookie(res, signSession(user.id));
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', express.json(), async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Incorrect email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect email or password' });

    setSessionCookie(res, signSession(user.id));
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// The client sends the ID token (JWT) it got back from Google's Identity
// Services button. We verify its signature and audience with Google
// directly — never trust a token just because the browser handed it to us.
router.post('/google', express.json(), async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({ error: 'Google sign-in is not configured on the server' });
    }

    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) return res.status(401).json({ error: 'Google did not return an email address' });
    if (!payload.email_verified) return res.status(401).json({ error: 'Google account email is not verified' });

    let user = getUserByEmail(payload.email);
    if (!user) {
      // Google-only accounts still need *some* password hash to satisfy the
      // column — a random one nobody knows, so password login just can't
      // succeed for them (they always come back through Google instead).
      const unusablePassword = crypto.randomBytes(32).toString('hex');
      user = createUser({
        id: crypto.randomUUID(),
        email: payload.email,
        passwordHash: await bcrypt.hash(unusablePassword, 12),
        firstName: payload.given_name || 'ZÉVON',
        lastName: payload.family_name || 'Member',
        phone: null,
      });
    }

    setSessionCookie(res, signSession(user.id));
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    res.status(401).json({ error: 'Could not verify Google sign-in' });
  }
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  const user = getUserById(req.userId);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  res.json({ user: toPublicUser(user) });
});

export default router;
