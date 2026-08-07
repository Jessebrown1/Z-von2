import { db } from '../db.js';

const insertViewStmt = db.prepare(
  'INSERT INTO product_views (user_id, product_id, viewed_at) VALUES (?, ?, ?)'
);
// Recent-first, capped — a user's view history only needs to feed Style DNA
// and "recently viewed," not grow unbounded.
const recentViewsStmt = db.prepare(
  'SELECT product_id, viewed_at FROM product_views WHERE user_id = ? ORDER BY viewed_at DESC LIMIT ?'
);

const insertMoodStmt = db.prepare(
  'INSERT INTO mood_selections (user_id, mood, selected_at) VALUES (?, ?, ?)'
);
const recentMoodsStmt = db.prepare(
  'SELECT mood, selected_at FROM mood_selections WHERE user_id = ? ORDER BY selected_at DESC LIMIT ?'
);

export function recordProductView(userId, productId) {
  insertViewStmt.run(userId, productId, new Date().toISOString());
}

export function getRecentProductViews(userId, limit = 50) {
  return recentViewsStmt.all(userId, limit);
}

export function recordMoodSelection(userId, mood) {
  insertMoodStmt.run(userId, mood, new Date().toISOString());
}

export function getRecentMoodSelections(userId, limit = 20) {
  return recentMoodsStmt.all(userId, limit);
}
