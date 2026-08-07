import { db } from '../db.js';

const addStmt = db.prepare(
  'INSERT OR IGNORE INTO wishlist_items (user_id, product_id, created_at) VALUES (?, ?, ?)'
);
const removeStmt = db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?');
const byUserStmt = db.prepare('SELECT product_id, created_at FROM wishlist_items WHERE user_id = ? ORDER BY created_at DESC');
const hasStmt = db.prepare('SELECT 1 FROM wishlist_items WHERE user_id = ? AND product_id = ?');

export function addToWishlist(userId, productId) {
  addStmt.run(userId, productId, new Date().toISOString());
}

export function removeFromWishlist(userId, productId) {
  removeStmt.run(userId, productId);
}

export function getWishlistProductIds(userId) {
  return byUserStmt.all(userId).map((row) => row.product_id);
}

export function isWishlisted(userId, productId) {
  return Boolean(hasStmt.get(userId, productId));
}
