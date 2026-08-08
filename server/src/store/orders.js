import { db } from '../db.js';
import { getProductById } from './products.js';
import { getUserById } from './users.js';
import { issueCertificate } from './certificates.js';

export const ORDER_STATUSES = ['pending', 'paid', 'completed', 'cancelled'];

function deserialize(row) {
  if (!row) return null;
  return {
    reference: row.reference,
    userId: row.user_id,
    email: row.email,
    customerName: row.first_name ? `${row.first_name} ${row.last_name}` : null,
    items: JSON.parse(row.items),
    shippingAddress: row.shipping_address ? JSON.parse(row.shipping_address) : null,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    fulfillmentNote: row.fulfillment_note,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    paystackReference: row.paystack_reference,
  };
}

export async function createOrder(order) {
  const createdAt = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO orders (reference, user_id, email, items, shipping_address, amount, currency, status, created_at)
          VALUES (@reference, @userId, @email, @items, @shippingAddress, @amount, @currency, @status, @createdAt)`,
    args: {
      reference: order.reference,
      userId: order.userId ?? null,
      email: order.email,
      items: JSON.stringify(order.items),
      shippingAddress: order.shippingAddress ? JSON.stringify(order.shippingAddress) : null,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      createdAt,
    },
  });
  return getOrder(order.reference);
}

export async function getOrder(reference) {
  const { rows } = await db.execute({ sql: 'SELECT * FROM orders WHERE reference = ?', args: [reference] });
  return deserialize(rows[0]);
}

// Guest orders don't have an account to pull a name from — falls back to a
// capitalized version of the email's local part ("jay@x.com" -> "Jay").
async function resolveOwnerName(order) {
  if (order.userId) {
    const user = await getUserById(order.userId);
    if (user) return `${user.firstName} ${user.lastName}`;
  }
  const local = order.email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

// One certificate per unit of every limited-edition line item, each with the
// next sequential edition number for that product. Deliberately sequential
// (not Promise.all) — issueCertificate's edition-number counter reads then
// writes, so concurrent calls for the same product could hand out duplicates.
async function issueCertificatesForOrder(order) {
  const ownerName = await resolveOwnerName(order);
  for (const line of order.items) {
    const product = await getProductById(line.id);
    if (!product || !product.isLimited) continue;
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    for (let i = 0; i < quantity; i++) {
      await issueCertificate({
        orderReference: order.reference,
        product,
        variantSize: line.size,
        variantColor: line.color,
        ownerUserId: order.userId,
        ownerName,
        ownerEmail: order.email,
      });
    }
  }
}

export async function markOrderPaid(reference, paystackData) {
  const existing = await getOrder(reference);
  if (!existing) return null;
  // Both the verify route and the webhook can call this for the same order —
  // only issue certificates once.
  if (existing.status === 'paid' || existing.status === 'completed') {
    return existing;
  }
  await db.execute({
    sql: 'UPDATE orders SET status = ?, paid_at = ?, paystack_reference = ? WHERE reference = ?',
    args: ['paid', new Date().toISOString(), paystackData?.reference ?? reference, reference],
  });
  const order = await getOrder(reference);
  await issueCertificatesForOrder(order);
  return order;
}

export async function getOrdersByUser(userId) {
  const { rows } = await db.execute({
    sql: 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });
  return rows.map(deserialize);
}

export async function getAllOrders() {
  const { rows } = await db.execute(`
    SELECT orders.*, users.first_name, users.last_name
    FROM orders
    LEFT JOIN users ON users.id = orders.user_id
    ORDER BY orders.created_at DESC
  `);
  return rows.map(deserialize);
}

// Powers the "X of Y remaining" urgency messaging on limited-edition product
// pages — same definition of "sold" as the admin overview's stock panel
// (paid or completed orders only; a pending/cancelled order never held stock).
export async function getSoldCounts() {
  const { rows } = await db.execute(`SELECT items FROM orders WHERE status IN ('paid', 'completed')`);
  const counts = new Map();
  for (const row of rows) {
    for (const line of JSON.parse(row.items)) {
      counts.set(line.id, (counts.get(line.id) || 0) + (Number(line.quantity) || 0));
    }
  }
  return counts;
}

export async function setOrderStatus(reference, status, note) {
  if (!ORDER_STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);
  const existing = await getOrder(reference);
  if (!existing) return null;
  await db.execute({
    sql: 'UPDATE orders SET status = ?, fulfillment_note = ? WHERE reference = ?',
    args: [status, note ?? existing.fulfillmentNote, reference],
  });
  return getOrder(reference);
}
