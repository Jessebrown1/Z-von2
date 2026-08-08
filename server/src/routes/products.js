import { Router } from 'express';
import { listProducts, getProductBySlug } from '../store/products.js';
import { getSoldCounts } from '../store/orders.js';

const router = Router();

function withRemaining(product, soldCounts) {
  if (!product.isLimited || !product.editionSize) return product;
  const sold = soldCounts.get(product.id) || 0;
  return { ...product, remaining: Math.max(0, product.editionSize - sold) };
}

router.get('/', async (req, res) => {
  try {
    const [products, soldCounts] = await Promise.all([listProducts(), getSoldCounts()]);
    res.json({ products: products.map((p) => withRemaining(p, soldCounts)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const soldCounts = await getSoldCounts();
    res.json({ product: withRemaining(product, soldCounts) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
