import { Router } from 'express';
import { listProducts, getProductBySlug } from '../store/products.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    res.json({ products: await listProducts() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
