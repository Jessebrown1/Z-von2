import { Router } from 'express';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '../middleware/auth.js';
import { getAllOrders, setOrderStatus, ORDER_STATUSES } from '../store/orders.js';
import { listProducts, createProduct, updateProduct, deleteProduct, getProductById } from '../store/products.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Buffered in memory, not written to local disk — the server's filesystem
// is ephemeral in production (Render), so uploads go straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'zevon-products' }, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

const router = Router();
router.use(requireAdmin);

// ---- Orders ----
router.get('/orders', async (req, res) => {
  try {
    res.json({ orders: await getAllOrders() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:reference', express.json(), async (req, res) => {
  try {
    const { status, note } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }
    const order = await setOrderStatus(req.params.reference, status, note);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Products ----
router.get('/products', async (req, res) => {
  try {
    res.json({ products: await listProducts() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', express.json(), async (req, res) => {
  try {
    if (!req.body?.name || !req.body?.category || !req.body?.price) {
      return res.status(400).json({ error: 'name, category and price are required' });
    }
    const product = await createProduct(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/products/:id', express.json(), async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body || {});
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const existing = await getProductById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    await deleteProduct(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Image upload ----
router.post('/upload', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    try {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      res.status(201).json({ url: result.secure_url });
    } catch (uploadErr) {
      res.status(500).json({ error: uploadErr.message || 'Image upload to Cloudinary failed' });
    }
  });
});

export default router;
