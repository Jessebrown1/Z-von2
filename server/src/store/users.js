import { db } from '../db.js';

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

export async function createUser({ id, email, passwordHash, firstName, lastName, phone }) {
  await db.execute({
    sql: `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, created_at)
          VALUES (@id, @email, @passwordHash, @firstName, @lastName, @phone, @createdAt)`,
    args: {
      id,
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone: phone || null,
      createdAt: new Date().toISOString(),
    },
  });
  return getUserById(id);
}

export async function getUserByEmail(email) {
  const { rows } = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email.toLowerCase()] });
  return deserialize(rows[0]);
}

export async function getUserById(id) {
  const { rows } = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
  return deserialize(rows[0]);
}
