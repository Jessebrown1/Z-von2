import { Router } from 'express';
import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { recordProductView, recordMoodSelection } from '../store/interactions.js';

const router = Router();

// Silently no-ops for guests rather than 401ing — every product page fires
// this on mount regardless of auth state, and tracking is meaningless
// (there's no profile to attach it to) until someone's signed in.
router.post('/view', optionalAuth, express.json(), (req, res) => {
  const { productId } = req.body || {};
  if (req.userId && productId) recordProductView(req.userId, productId);
  res.status(204).end();
});

router.post('/mood', optionalAuth, express.json(), (req, res) => {
  const { mood } = req.body || {};
  if (req.userId && mood) recordMoodSelection(req.userId, mood);
  res.status(204).end();
});

export default router;
