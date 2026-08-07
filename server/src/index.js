import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import paymentsRouter from './routes/payments.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import productsRouter from './routes/products.js';
import adminRouter from './routes/admin.js';
import certificatesRouter from './routes/certificates.js';
import wishlistRouter from './routes/wishlist.js';
import interactionsRouter from './routes/interactions.js';
import styleDnaRouter from './routes/styledna.js';
import './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
const PORT = process.env.API_PORT || 4000;

const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
const isPlaceholderKey = !secretKey || secretKey.includes('xxxx');
const hasJwtSecret = Boolean(process.env.JWT_SECRET);
const hasGoogleClientId = Boolean(process.env.GOOGLE_CLIENT_ID);

app.use(
  cors({
    // The dev frontend talks to this API through Vite's /api proxy, so
    // requests are same-origin from the browser's point of view and this
    // mostly matters for direct API access (Postman, a future separately-
    // hosted frontend, etc).
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/products', productsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/style-dna', styleDnaRouter);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    paystackConfigured: !isPlaceholderKey,
    authConfigured: hasJwtSecret,
    googleConfigured: hasGoogleClientId,
  });
});

app.listen(PORT, () => {
  console.log(`ZÉVON API listening on http://localhost:${PORT}`);
  if (isPlaceholderKey) {
    console.warn(
      '⚠ PAYSTACK_SECRET_KEY in server/.env is missing or still the placeholder value — ' +
        'payments will fail verification with "Invalid key" until it\'s set to your real sk_test_/sk_live_ key, ' +
        'then the server is RESTARTED (env vars are only read once, at startup).'
    );
  }
  if (!hasJwtSecret) {
    console.warn('⚠ JWT_SECRET is not set in server/.env — login/signup will fail until it is.');
  }
  if (!hasGoogleClientId) {
    console.warn('⚠ GOOGLE_CLIENT_ID is not set in server/.env — "Sign in with Google" is disabled until it is.');
  }
});
