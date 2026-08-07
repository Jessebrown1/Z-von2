import { db } from '../db.js';

const listStmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
const bySlugStmt = db.prepare('SELECT * FROM products WHERE slug = ?');
const byIdStmt = db.prepare('SELECT * FROM products WHERE id = ?');
const deleteStmt = db.prepare('DELETE FROM products WHERE id = ?');

const insertStmt = db.prepare(`
  INSERT INTO products (
    id, slug, name, collection, category, price, currency, is_new, is_limited,
    edition_size, drop_number, mood_tags, occasion_tags, silhouette, fit, weight_gsm, color_family,
    description, details, sizes, colors, images, created_at, updated_at
  ) VALUES (
    @id, @slug, @name, @collection, @category, @price, @currency, @isNew, @isLimited,
    @editionSize, @dropNumber, @moodTags, @occasionTags, @silhouette, @fit, @weightGsm, @colorFamily,
    @description, @details, @sizes, @colors, @images, @createdAt, @updatedAt
  )
`);

const updateStmt = db.prepare(`
  UPDATE products SET
    slug = @slug, name = @name, collection = @collection, category = @category,
    price = @price, currency = @currency, is_new = @isNew, is_limited = @isLimited,
    edition_size = @editionSize, drop_number = @dropNumber,
    mood_tags = @moodTags, occasion_tags = @occasionTags, silhouette = @silhouette,
    fit = @fit, weight_gsm = @weightGsm, color_family = @colorFamily,
    description = @description, details = @details,
    sizes = @sizes, colors = @colors, images = @images, updated_at = @updatedAt
  WHERE id = @id
`);

function deserialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    collection: row.collection,
    category: row.category,
    price: row.price,
    currency: row.currency,
    isNew: Boolean(row.is_new),
    isLimited: Boolean(row.is_limited),
    editionSize: row.edition_size,
    dropNumber: row.drop_number || 1,
    moodTags: JSON.parse(row.mood_tags || '[]'),
    occasionTags: JSON.parse(row.occasion_tags || '[]'),
    silhouette: row.silhouette || 'regular',
    fit: row.fit || 'true-to-size',
    weightGsm: row.weight_gsm,
    colorFamily: row.color_family,
    description: row.description,
    details: JSON.parse(row.details || '[]'),
    sizes: JSON.parse(row.sizes || '[]'),
    colors: JSON.parse(row.colors || '[]'),
    images: JSON.parse(row.images || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function listProducts() {
  return listStmt.all().map(deserialize);
}

export function getProductBySlug(slug) {
  return deserialize(bySlugStmt.get(slug));
}

export function getProductById(id) {
  return deserialize(byIdStmt.get(id));
}

export function createProduct(input) {
  const now = new Date().toISOString();
  const slug = input.slug?.trim() || slugify(input.name);
  const id = `zevon-${slug}`;

  insertStmt.run({
    id,
    slug,
    name: input.name,
    collection: input.collection || 'fearless',
    category: input.category,
    price: Math.round(Number(input.price)),
    currency: input.currency || 'GHS',
    isNew: input.isNew ? 1 : 0,
    isLimited: input.isLimited ? 1 : 0,
    editionSize: input.editionSize ? Number(input.editionSize) : null,
    dropNumber: input.dropNumber ? Number(input.dropNumber) : 1,
    moodTags: JSON.stringify(input.moodTags || []),
    occasionTags: JSON.stringify(input.occasionTags || []),
    silhouette: input.silhouette || 'regular',
    fit: input.fit || 'true-to-size',
    weightGsm: input.weightGsm ? Number(input.weightGsm) : null,
    colorFamily: input.colorFamily || null,
    description: input.description || '',
    details: JSON.stringify(input.details || []),
    sizes: JSON.stringify(input.sizes || []),
    colors: JSON.stringify(input.colors || []),
    images: JSON.stringify(input.images || []),
    createdAt: now,
    updatedAt: now,
  });

  return getProductById(id);
}

export function updateProduct(id, input) {
  const existing = getProductById(id);
  if (!existing) return null;

  updateStmt.run({
    id,
    slug: input.slug?.trim() || existing.slug,
    name: input.name ?? existing.name,
    collection: input.collection ?? existing.collection,
    category: input.category ?? existing.category,
    price: input.price != null ? Math.round(Number(input.price)) : existing.price,
    currency: input.currency ?? existing.currency,
    isNew: input.isNew != null ? (input.isNew ? 1 : 0) : existing.isNew ? 1 : 0,
    isLimited: input.isLimited != null ? (input.isLimited ? 1 : 0) : existing.isLimited ? 1 : 0,
    editionSize: input.editionSize !== undefined ? (input.editionSize ? Number(input.editionSize) : null) : existing.editionSize,
    dropNumber: input.dropNumber !== undefined ? Number(input.dropNumber) || 1 : existing.dropNumber,
    moodTags: JSON.stringify(input.moodTags ?? existing.moodTags),
    occasionTags: JSON.stringify(input.occasionTags ?? existing.occasionTags),
    silhouette: input.silhouette ?? existing.silhouette,
    fit: input.fit ?? existing.fit,
    weightGsm: input.weightGsm !== undefined ? (input.weightGsm ? Number(input.weightGsm) : null) : existing.weightGsm,
    colorFamily: input.colorFamily ?? existing.colorFamily,
    description: input.description ?? existing.description,
    details: JSON.stringify(input.details ?? existing.details),
    sizes: JSON.stringify(input.sizes ?? existing.sizes),
    colors: JSON.stringify(input.colors ?? existing.colors),
    images: JSON.stringify(input.images ?? existing.images),
    updatedAt: new Date().toISOString(),
  });

  return getProductById(id);
}

export function deleteProduct(id) {
  const result = deleteStmt.run(id);
  return result.changes > 0;
}
