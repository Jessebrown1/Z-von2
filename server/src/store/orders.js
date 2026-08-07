import { db } from '../db.js';
import { getProductById } from './products.js';
import { getUserById } from './users.js';
import { issueCertificate } from './certificates.js';

const insertStmt = db.prepare(`
  INSERT INTO orders (reference, user_id, email, items, shipping_address, amount, currency, status, created_at)
  VALUES (@reference, @userId, @email, @items, @shippingAddress, @amount, @currency, @status, @createdAt)
`);

const getStmt = db.prepare('SELECT * FROM orders WHERE reference = ?');
const markPaidStmt = db.prepare(
  'UPDATE orders SET status = ?, paid_at = ?, paystack_reference = ? WHERE reference = ?'
);
const setStatusStmt = db.prepare('UPDATE orders SET status = ?, fulfillment_note = ? WHERE reference = ?');
const byUserStmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
const allWithUserStmt = db.prepare(`
  SELECT orders.*, users.first_name, users.last_name
  FROM orders
  LEFT JOIN users ON users.id = orders.user_id
  ORDER BY orders.created_at DESC
`);

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

export function createOrder(order) {
  const createdAt = new Date().toISOString();
  insertStmt.run({
    reference: order.reference,
    userId: order.userId ?? null,
    email: order.email,
    items: JSON.stringify(order.items),
    shippingAddress: order.shippingAddress ? JSON.stringify(order.shippingAddress) : null,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    createdAt,
  });
  return deserialize(getStmt.get(order.reference));
}

export function getOrder(reference) {
  return deserialize(getStmt.get(reference));
}

// Guest orders don't have an account to pull a name from — falls back to a
// capitalized version of the email's local part ("jay@x.com" -> "Jay").
function resolveOwnerName(order) {
  if (order.userId) {
    const user = getUserById(order.userId);
    if (user) return `${user.firstName} ${user.lastName}`;
  }
  const local = order.email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

// One certificate per unit of every limited-edition line item, each with the
// next sequential edition number for that product.
function issueCertificatesForOrder(order) {
  const ownerName = resolveOwnerName(order);
  for (const line of order.items) {
    const product = getProductById(line.id);
    if (!product || !product.isLimited) continue;
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    for (let i = 0; i < quantity; i++) {
      issueCertificate({
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

export function markOrderPaid(reference, paystackData) {
  const existing = getStmt.get(reference);
  if (!existing) return null;
  // Both the verify route and the webhook can call this for the same order —
  // only issue certificates once.
  if (existing.status === 'paid' || existing.status === 'completed') {
    return deserialize(existing);
  }
  markPaidStmt.run('paid', new Date().toISOString(), paystackData?.reference ?? reference, reference);
  const order = deserialize(getStmt.get(reference));
  issueCertificatesForOrder(order);
  return order;
}

export function getOrdersByUser(userId) {
  return byUserStmt.all(userId).map(deserialize);
}

export function getAllOrders() {
  return allWithUserStmt.all().map(deserialize);
}

export function setOrderStatus(reference, status, note) {
  if (!ORDER_STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);
  const existing = getStmt.get(reference);
  if (!existing) return null;
  setStatusStmt.run(status, note ?? existing.fulfillment_note, reference);
  return deserialize(getStmt.get(reference));
}
