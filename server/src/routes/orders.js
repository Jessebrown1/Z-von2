import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getOrdersByUser } from '../store/orders.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    res.json({ orders: await getOrdersByUser(req.userId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
