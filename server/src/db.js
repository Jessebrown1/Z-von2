import { createClient } from '@libsql/client';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { products as seedProducts } from '../../src/data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

// Turso (a hosted, SQLite-compatible database) in production — set
// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN in server/.env. Falls back to a local
// libSQL file for dev, so no Turso account is needed to work on this locally;
// same client, same API, same SQL either way.
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(DATA_DIR, 'zevon.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = authToken ? createClient({ url, authToken }) : createClient({ url });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function hasColumn(table, column) {
  const { rows } = await db.execute(`PRAGMA table_info(${table})`);
  return rows.some((col) => col.name === column);
}

// --- Lightweight migrations for columns added after the tables first shipped ---
// Verifies the ALTER actually landed and retries a couple of times if not —
// a brand-new remote Turso database's very first few requests can silently
// no-op (observed directly during initial setup: two ALTER TABLE calls
// against a freshly created database didn't take effect even though they
// didn't throw). Once a database has been up for a moment this never
// triggers; the retry only matters for that first-boot window.
async function ensureColumn(table, column, definition) {
  if (await hasColumn(table, column)) return;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch (err) {
      // A prior attempt's ALTER may have actually landed even though the
      // verification read after it didn't see it yet — that shows up here
      // as "duplicate column" on the retry, which just means we're done.
      if (!/duplicate column/i.test(err.message)) throw err;
    }
    if (await hasColumn(table, column)) return;
    await sleep(300 * attempt);
  }
  throw new Error(`Failed to add column ${table}.${column} after 3 attempts`);
}

/** Promotes a user to admin by email. Safe to call repeatedly (idempotent). */
export async function promoteToAdmin(email) {
  const result = await db.execute({
    sql: 'UPDATE users SET role = ? WHERE email = ?',
    args: ['admin', email.toLowerCase()],
  });
  return result.rowsAffected > 0;
}

// Limited pieces need a drop number to print on their certificate; every
// product needs mood/occasion/fit attributes for Product DNA and ZÉVON AI.
// Curated values for the founding catalog — new products get tagged through
// the admin Product DNA fields.
const DNA_BACKFILL = {
  'shadow-hoodie': {
    moodTags: ['dark', 'raw', 'confident'],
    occasionTags: ['casual', 'everyday', 'just-because'],
    silhouette: 'oversized',
    fit: 'relaxed',
    weightGsm: 480,
    colorFamily: 'black',
  },
  'midnight-tee': {
    moodTags: ['minimal', 'quiet-luxury', 'confident'],
    occasionTags: ['everyday', 'casual', 'date-night'],
    silhouette: 'fitted',
    fit: 'true-to-size',
    weightGsm: 220,
    colorFamily: 'black',
  },
  'relic-cargo': {
    moodTags: ['raw', 'rebellious', 'confident'],
    occasionTags: ['casual', 'everyday'],
    silhouette: 'tapered',
    fit: 'relaxed',
    weightGsm: 430,
    colorFamily: 'black',
  },
  'obsidian-jacket': {
    moodTags: ['dark', 'elegant', 'night', 'quiet-luxury'],
    occasionTags: ['party', 'date-night', 'event'],
    silhouette: 'streamlined',
    fit: 'tailored',
    weightGsm: 550,
    colorFamily: 'black',
  },
  'gold-cap': {
    moodTags: ['minimal', 'quiet-luxury'],
    occasionTags: ['everyday', 'casual', 'just-because'],
    silhouette: 'structured',
    fit: 'true-to-size',
    weightGsm: null,
    colorFamily: 'black',
  },
  'signet-ring': {
    moodTags: ['elegant', 'confident', 'quiet-luxury'],
    occasionTags: ['event', 'dinner', 'date-night', 'just-because'],
    silhouette: 'structured',
    fit: 'true-to-size',
    weightGsm: null,
    colorFamily: 'gold',
  },
};

// Runs once, awaited before the server starts accepting requests — see
// index.js. Top-level await below also means any other module that imports
// from db.js transparently waits for this to finish first.
async function init() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      reference TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      email TEXT NOT NULL,
      items TEXT NOT NULL,
      shipping_address TEXT,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      paid_at TEXT,
      paystack_reference TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      order_reference TEXT NOT NULL REFERENCES orders(reference),
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_slug TEXT NOT NULL,
      drop_number INTEGER NOT NULL DEFAULT 1,
      variant_size TEXT,
      variant_color TEXT,
      edition_number INTEGER NOT NULL,
      edition_size INTEGER,
      owner_user_id TEXT REFERENCES users(id),
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      issued_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_certificates_owner ON certificates(owner_user_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_product ON certificates(product_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_order ON certificates(order_reference);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_product_edition ON certificates(product_id, edition_number);

    CREATE TABLE IF NOT EXISTS wishlist_items (
      user_id TEXT NOT NULL REFERENCES users(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS product_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      viewed_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_product_views_user ON product_views(user_id);

    CREATE TABLE IF NOT EXISTS mood_selections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      mood TEXT NOT NULL,
      selected_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_mood_selections_user ON mood_selections(user_id);

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      collection TEXT,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GHS',
      is_new INTEGER NOT NULL DEFAULT 0,
      is_limited INTEGER NOT NULL DEFAULT 0,
      edition_size INTEGER,
      description TEXT,
      details TEXT,
      sizes TEXT,
      colors TEXT,
      images TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await ensureColumn('users', 'role', "TEXT NOT NULL DEFAULT 'customer'");
  await ensureColumn('orders', 'fulfillment_note', 'TEXT');
  await ensureColumn('products', 'drop_number', 'INTEGER');
  await ensureColumn('products', 'mood_tags', 'TEXT');
  await ensureColumn('products', 'occasion_tags', 'TEXT');
  await ensureColumn('products', 'silhouette', 'TEXT');
  await ensureColumn('products', 'fit', 'TEXT');
  await ensureColumn('products', 'weight_gsm', 'INTEGER');
  await ensureColumn('products', 'color_family', 'TEXT');

  // Limited pieces need a drop number to print on their certificate — backfill
  // anything created before this column existed with Drop 1.
  await db.execute('UPDATE products SET drop_number = 1 WHERE drop_number IS NULL');

  // --- One-time seed: populate products from the static catalog the first time the DB is empty ---
  const { rows: countRows } = await db.execute('SELECT COUNT(*) AS n FROM products');
  if (countRows[0].n === 0) {
    const now = new Date().toISOString();
    for (const p of seedProducts) {
      await db.execute({
        sql: `
          INSERT INTO products (
            id, slug, name, collection, category, price, currency, is_new, is_limited,
            edition_size, drop_number, description, details, sizes, colors, images, created_at, updated_at
          ) VALUES (
            @id, @slug, @name, @collection, @category, @price, @currency, @isNew, @isLimited,
            @editionSize, @dropNumber, @description, @details, @sizes, @colors, @images, @createdAt, @updatedAt
          )
        `,
        args: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          collection: p.collection ?? null,
          category: p.category,
          price: p.price,
          currency: p.currency || 'GHS',
          isNew: p.isNew ? 1 : 0,
          isLimited: p.isLimited ? 1 : 0,
          editionSize: p.editionSize ?? null,
          dropNumber: p.dropNumber ?? 1,
          description: p.description ?? '',
          details: JSON.stringify(p.details || []),
          sizes: JSON.stringify(p.sizes || []),
          colors: JSON.stringify(p.colors || []),
          images: JSON.stringify(p.images || []),
          createdAt: now,
          updatedAt: now,
        },
      });
    }
    console.log(`Seeded ${seedProducts.length} products into the database.`);
  }

  for (const [slug, dna] of Object.entries(DNA_BACKFILL)) {
    await db.execute({
      sql: 'UPDATE products SET mood_tags = @moodTags, occasion_tags = @occasionTags, silhouette = @silhouette, fit = @fit, weight_gsm = @weightGsm, color_family = @colorFamily WHERE slug = @slug AND mood_tags IS NULL',
      args: {
        slug,
        moodTags: JSON.stringify(dna.moodTags),
        occasionTags: JSON.stringify(dna.occasionTags),
        silhouette: dna.silhouette,
        fit: dna.fit,
        weightGsm: dna.weightGsm,
        colorFamily: dna.colorFamily,
      },
    });
  }
  // Anything else still untagged (a product created before this feature that
  // isn't one of the curated seeds above) gets a neutral default rather than
  // nulls breaking the AI's matching logic.
  await db.execute(`
    UPDATE products SET
      mood_tags = COALESCE(mood_tags, '[]'),
      occasion_tags = COALESCE(occasion_tags, '[]'),
      silhouette = COALESCE(silhouette, 'regular'),
      fit = COALESCE(fit, 'true-to-size')
    WHERE mood_tags IS NULL OR occasion_tags IS NULL OR silhouette IS NULL OR fit IS NULL
  `);

  // Bootstraps the very first admin from an env var, since there's no admin
  // UI yet to promote anyone from — set ADMIN_EMAIL in server/.env once, this
  // runs on every boot but only ever flips matching accounts to 'admin'.
  if (process.env.ADMIN_EMAIL) {
    await promoteToAdmin(process.env.ADMIN_EMAIL);
  }
}

await init();
