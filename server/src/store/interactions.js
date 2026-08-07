import { db } from '../db.js';

export async function recordProductView(userId, productId) {
  await db.execute({
    sql: 'INSERT INTO product_views (user_id, product_id, viewed_at) VALUES (?, ?, ?)',
    args: [userId, productId, new Date().toISOString()],
  });
}

// Recent-first, capped — a user's view history only needs to feed Style DNA
// and "recently viewed," not grow unbounded.
export async function getRecentProductViews(userId, limit = 50) {
  const { rows } = await db.execute({
    sql: 'SELECT product_id, viewed_at FROM product_views WHERE user_id = ? ORDER BY viewed_at DESC LIMIT ?',
    args: [userId, limit],
  });
  return rows;
}

export async function recordMoodSelection(userId, mood) {
  await db.execute({
    sql: 'INSERT INTO mood_selections (user_id, mood, selected_at) VALUES (?, ?, ?)',
    args: [userId, mood, new Date().toISOString()],
  });
}

export async function getRecentMoodSelections(userId, limit = 20) {
  const { rows } = await db.execute({
    sql: 'SELECT mood, selected_at FROM mood_selections WHERE user_id = ? ORDER BY selected_at DESC LIMIT ?',
    args: [userId, limit],
  });
  return rows;
}
