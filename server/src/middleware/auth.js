import jwt from 'jsonwebtoken';
import { getUserById } from '../store/users.js';

const COOKIE_NAME = 'zevon_session';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set on the server — add it to server/.env');
  return secret;
}

export function signSession(userId) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '30d' });
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

function readUserId(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getJwtSecret());
    return payload.sub;
  } catch {
    return null;
  }
}

/** Blocks the request with 401 unless a valid session cookie is present. */
export function requireAuth(req, res, next) {
  const userId = readUserId(req);
  if (!userId) return res.status(401).json({ error: 'Not signed in' });
  req.userId = userId;
  next();
}

/** Attaches req.userId when a valid session cookie is present, but never blocks. */
export function optionalAuth(req, res, next) {
  req.userId = readUserId(req);
  next();
}

/** Blocks with 401/403 unless the signed-in user has the 'admin' role. */
export function requireAdmin(req, res, next) {
  const userId = readUserId(req);
  if (!userId) return res.status(401).json({ error: 'Not signed in' });

  const user = getUserById(userId);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  req.userId = userId;
  next();
}
