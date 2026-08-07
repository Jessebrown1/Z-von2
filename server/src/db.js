import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { products as seedProducts } from '../../src/data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'zevon.db'));
db.pragma('journal_mode = WAL');

db.exec(`
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

// --- Lightweight migrations for columns added after the tables first shipped ---
function ensureColumn(table, column, definition) {
  const existing = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!existing.some((col) => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn('users', 'role', "TEXT NOT NULL DEFAULT 'customer'");
ensureColumn('orders', 'fulfillment_note', 'TEXT');
ensureColumn('products', 'drop_number', 'INTEGER');
ensureColumn('products', 'mood_tags', 'TEXT');
ensureColumn('products', 'occasion_tags', 'TEXT');
ensureColumn('products', 'silhouette', 'TEXT');
ensureColumn('products', 'fit', 'TEXT');
ensureColumn('products', 'weight_gsm', 'INTEGER');
ensureColumn('products', 'color_family', 'TEXT');

// Limited pieces need a drop number to print on their certificate — backfill
// anything created before this column existed with Drop 1.
db.exec("UPDATE products SET drop_number = 1 WHERE drop_number IS NULL");

// --- One-time seed: populate products from the static catalog the first time the DB is empty ---
const productCount = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
if (productCount === 0) {
  const insert = db.prepare(`
    INSERT INTO products (
      id, slug, name, collection, category, price, currency, is_new, is_limited,
      edition_size, drop_number, description, details, sizes, colors, images, created_at, updated_at
    ) VALUES (
      @id, @slug, @name, @collection, @category, @price, @currency, @isNew, @isLimited,
      @editionSize, @dropNumber, @description, @details, @sizes, @colors, @images, @createdAt, @updatedAt
    )
  `);
  const now = new Date().toISOString();
  const insertMany = db.transaction((items) => {
    for (const p of items) {
      insert.run({
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
      });
    }
  });
  insertMany(seedProducts);
  console.log(`Seeded ${seedProducts.length} products into the database.`);
}

// Product DNA / ZÉVON AI need every product tagged with mood, occasion and
// fit attributes to match against — backfill curated values for the founding
// catalog. New products get tagged through the admin Product DNA fields.
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

const dnaBackfillStmt = db.prepare(
  'UPDATE products SET mood_tags = @moodTags, occasion_tags = @occasionTags, silhouette = @silhouette, fit = @fit, weight_gsm = @weightGsm, color_family = @colorFamily WHERE slug = @slug AND mood_tags IS NULL'
);
for (const [slug, dna] of Object.entries(DNA_BACKFILL)) {
  dnaBackfillStmt.run({
    slug,
    moodTags: JSON.stringify(dna.moodTags),
    occasionTags: JSON.stringify(dna.occasionTags),
    silhouette: dna.silhouette,
    fit: dna.fit,
    weightGsm: dna.weightGsm,
    colorFamily: dna.colorFamily,
  });
}
// Anything else still untagged (a product created before this feature that
// isn't one of the curated seeds above) gets a neutral default rather than
// nulls breaking the AI's matching logic.
db.exec(`
  UPDATE products SET
    mood_tags = COALESCE(mood_tags, '[]'),
    occasion_tags = COALESCE(occasion_tags, '[]'),
    silhouette = COALESCE(silhouette, 'regular'),
    fit = COALESCE(fit, 'true-to-size')
  WHERE mood_tags IS NULL OR occasion_tags IS NULL OR silhouette IS NULL OR fit IS NULL
`);

/** Promotes a user to admin by email. Safe to call repeatedly (idempotent). */
export function promoteToAdmin(email) {
  const result = db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', email.toLowerCase());
  return result.changes > 0;
}

// Bootstraps the very first admin from an env var, since there's no admin
// UI yet to promote anyone from — set ADMIN_EMAIL in server/.env once, this
// runs on every boot but only ever flips matching accounts to 'admin'.
if (process.env.ADMIN_EMAIL) {
  promoteToAdmin(process.env.ADMIN_EMAIL);
}
