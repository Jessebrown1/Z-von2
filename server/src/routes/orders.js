import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getOrdersByUser } from '../store/orders.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  res.json({ orders: getOrdersByUser(req.userId) });
});

export default router;
