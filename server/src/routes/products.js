import { Router } from 'express';
import { listProducts, getProductBySlug } from '../store/products.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ products: listProducts() });
});

router.get('/:slug', (req, res) => {
  const product = getProductBySlug(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

export default router;
