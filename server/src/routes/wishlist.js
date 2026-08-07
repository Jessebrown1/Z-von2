import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addToWishlist, removeFromWishlist, getWishlistProductIds } from '../store/wishlist.js';
import { getProductById } from '../store/products.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const ids = await getWishlistProductIds(req.userId);
    const products = (await Promise.all(ids.map((id) => getProductById(id)))).filter(Boolean);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:productId', async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await addToWishlist(req.userId, req.params.productId);
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    await removeFromWishlist(req.userId, req.params.productId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
