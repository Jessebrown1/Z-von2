import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addToWishlist, removeFromWishlist, getWishlistProductIds } from '../store/wishlist.js';
import { getProductById } from '../store/products.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const products = getWishlistProductIds(req.userId)
    .map((id) => getProductById(id))
    .filter(Boolean);
  res.json({ products });
});

router.post('/:productId', (req, res) => {
  const product = getProductById(req.params.productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  addToWishlist(req.userId, req.params.productId);
  res.status(201).json({ ok: true });
});

router.delete('/:productId', (req, res) => {
  removeFromWishlist(req.userId, req.params.productId);
  res.status(204).end();
});

export default router;
