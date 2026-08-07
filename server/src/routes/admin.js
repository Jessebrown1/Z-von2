import { Router } from 'express';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { requireAdmin } from '../middleware/auth.js';
import { getAllOrders, setOrderStatus, ORDER_STATUSES } from '../store/orders.js';
import { listProducts, createProduct, updateProduct, deleteProduct, getProductById } from '../store/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

const router = Router();
router.use(requireAdmin);

// ---- Orders ----
router.get('/orders', (req, res) => {
  res.json({ orders: getAllOrders() });
});

router.patch('/orders/:reference', express.json(), (req, res) => {
  try {
    const { status, note } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }
    const order = setOrderStatus(req.params.reference, status, note);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Products ----
router.get('/products', (req, res) => {
  res.json({ products: listProducts() });
});

router.post('/products', express.json(), (req, res) => {
  try {
    if (!req.body?.name || !req.body?.category || !req.body?.price) {
      return res.status(400).json({ error: 'name, category and price are required' });
    }
    const product = createProduct(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/products/:id', express.json(), (req, res) => {
  const product = updateProduct(req.params.id, req.body || {});
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

router.delete('/products/:id', (req, res) => {
  const existing = getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  deleteProduct(req.params.id);
  res.status(204).end();
});

// ---- Image upload ----
router.post('/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;
