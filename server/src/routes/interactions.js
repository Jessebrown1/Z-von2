import { Router } from 'express';
import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { recordProductView, recordMoodSelection } from '../store/interactions.js';

const router = Router();

// Silently no-ops for guests rather than 401ing — every product page fires
// this on mount regardless of auth state, and tracking is meaningless
// (there's no profile to attach it to) until someone's signed in. Failures
// are swallowed (logged, not surfaced) — this is best-effort analytics, not
// something a page visit should ever fail over.
router.post('/view', optionalAuth, express.json(), async (req, res) => {
  const { productId } = req.body || {};
  try {
    if (req.userId && productId) await recordProductView(req.userId, productId);
  } catch (err) {
    console.error('recordProductView failed:', err.message);
  }
  res.status(204).end();
});

router.post('/mood', optionalAuth, express.json(), async (req, res) => {
  const { mood } = req.body || {};
  try {
    if (req.userId && mood) await recordMoodSelection(req.userId, mood);
  } catch (err) {
    console.error('recordMoodSelection failed:', err.message);
  }
  res.status(204).end();
});

export default router;
