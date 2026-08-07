import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { recommendForStyleDna } from '../store/styleDna.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { dna, recommendations, stretchPick } = await recommendForStyleDna(req.userId, 4);
    res.json({
      hasSignal: dna.hasSignal,
      moodProfile: dna.moodProfile,
      signature: dna.signature,
      recommendations,
      stretchPick,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
