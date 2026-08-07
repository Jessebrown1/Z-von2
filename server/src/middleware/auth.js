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
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    // In dev the frontend talks to this API through Vite's proxy, so it's
    // same-origin and 'lax' is fine. In production the frontend (Vercel) and
    // this API (Render) are different origins — cross-site fetch() only ever
    // sends cookies with SameSite=None, which in turn requires Secure.
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
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
export async function requireAdmin(req, res, next) {
  const userId = readUserId(req);
  if (!userId) return res.status(401).json({ error: 'Not signed in' });

  try {
    const user = await getUserById(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    req.userId = userId;
    next();
  } catch (err) {
    next(err);
  }
}
