import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import paymentsRouter from './routes/payments.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import productsRouter from './routes/products.js';
import adminRouter from './routes/admin.js';
import certificatesRouter from './routes/certificates.js';
import wishlistRouter from './routes/wishlist.js';
import interactionsRouter from './routes/interactions.js';
import styleDnaRouter from './routes/styledna.js';
import './db.js'; // has top-level await — this import blocks until schema/seed/migrations finish

const app = express();
// API_PORT wins first — local dev tooling (this project's own preview
// server, some editors) sets a generic PORT env var for the frontend that
// gets inherited by every child process under `concurrently`, which would
// otherwise steal this server's port too. Render only ever sets PORT (no
// API_PORT), so production still picks it up via the second fallback.
const PORT = process.env.API_PORT || process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
const isPlaceholderKey = !secretKey || secretKey.includes('xxxx');
const hasJwtSecret = Boolean(process.env.JWT_SECRET);
const hasGoogleClientId = Boolean(process.env.GOOGLE_CLIENT_ID);
const hasTurso = Boolean(process.env.TURSO_DATABASE_URL);
const hasCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

// Behind Render's reverse proxy, this makes req.secure/req.protocol reflect
// the original client request rather than the internal proxy hop.
if (isProduction) app.set('trust proxy', 1);

// FRONTEND_ORIGIN can be a comma-separated list — useful for allowing both
// your production Vercel domain and its preview deployments at once.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (curl, server-to-server, same-origin) — allow.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(cookieParser());

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
    databaseConfigured: hasTurso,
    imageUploadsConfigured: hasCloudinary,
  });
});

// Safety net — every route above already catches its own errors, but this
// stops anything that slips through from hanging the request forever.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
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
  if (!hasTurso) {
    console.warn('⚠ TURSO_DATABASE_URL is not set — using a local libSQL file. Fine for dev, not for production.');
  }
  if (!hasCloudinary) {
    console.warn('⚠ CLOUDINARY_CLOUD_NAME is not set — admin image uploads will fail until Cloudinary is configured.');
  }
});
