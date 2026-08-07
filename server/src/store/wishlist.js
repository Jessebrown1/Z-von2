import { db } from '../db.js';

export async function addToWishlist(userId, productId) {
  await db.execute({
    sql: 'INSERT OR IGNORE INTO wishlist_items (user_id, product_id, created_at) VALUES (?, ?, ?)',
    args: [userId, productId, new Date().toISOString()],
  });
}

export async function removeFromWishlist(userId, productId) {
  await db.execute({
    sql: 'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
    args: [userId, productId],
  });
}

export async function getWishlistProductIds(userId) {
  const { rows } = await db.execute({
    sql: 'SELECT product_id FROM wishlist_items WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });
  return rows.map((row) => row.product_id);
}

export async function isWishlisted(userId, productId) {
  const { rows } = await db.execute({
    sql: 'SELECT 1 FROM wishlist_items WHERE user_id = ? AND product_id = ?',
    args: [userId, productId],
  });
  return rows.length > 0;
}
