import { db } from '../db.js';

const insertStmt = db.prepare(`
  INSERT INTO users (id, email, password_hash, first_name, last_name, phone, created_at)
  VALUES (@id, @email, @passwordHash, @firstName, @lastName, @phone, @createdAt)
`);
const byEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?');
const byIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');

function deserialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  };
}

/** Strips the password hash — the only shape that should ever leave the server. */
export function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

export function createUser({ id, email, passwordHash, firstName, lastName, phone }) {
  insertStmt.run({
    id,
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    phone: phone || null,
    createdAt: new Date().toISOString(),
  });
  return deserialize(byIdStmt.get(id));
}

export function getUserByEmail(email) {
  return deserialize(byEmailStmt.get(email.toLowerCase()));
}

export function getUserById(id) {
  return deserialize(byIdStmt.get(id));
}
