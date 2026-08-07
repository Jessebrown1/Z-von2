import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { recommendForStyleDna } from '../store/styleDna.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const { dna, recommendations, stretchPick } = recommendForStyleDna(req.userId, 4);
  res.json({
    hasSignal: dna.hasSignal,
    moodProfile: dna.moodProfile,
    signature: dna.signature,
    recommendations,
    stretchPick,
  });
});

export default router;
