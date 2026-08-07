import { Router } from 'express';
import express from 'express';
import crypto from 'node:crypto';
import { getProductById } from '../store/products.js';
import { verifyTransaction, getSecretKey } from '../services/paystack.js';
import { createOrder, getOrder, markOrderPaid } from '../store/orders.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Kept in sync with the same constants in
// src/components/Checkout/OrderSummary.jsx, which computes the same totals
// client-side just for display — this route is the authoritative source
// for what actually gets charged.
const SHIPPING_FLAT_RATE = 270;
const TAX_RATE = 0.08;
const DEFAULT_CURRENCY = process.env.PAYSTACK_CURRENCY || 'GHS';

/**
 * Recomputes the order total from the shared product catalog (prices are
 * GHS-native there) rather than trusting whatever price the client sends —
 * the only way to stop a tampered request from checking out a
 * GH₵3,750 hoodie for GH₵1.
 */
async function computeAmount(items) {
  let subtotal = 0;
  for (const line of items) {
    const product = await getProductById(line.id);
    if (!product) throw new Error(`Unknown product: ${line.id}`);
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    subtotal += product.price * quantity;
  }
  const shipping = subtotal > 0 ? SHIPPING_FLAT_RATE : 0;
  const tax = subtotal * TAX_RATE;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { subtotal, shipping, tax, total, currency: DEFAULT_CURRENCY };
}

function generateReference() {
  return `zevon_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// Registers a pending order and hands back the server-computed amount and a
// unique reference. The frontend uses these — not its own numbers — to open
// the Paystack popup.
router.post('/initialize', optionalAuth, express.json(), async (req, res) => {
  try {
    const { email, items, shippingAddress } = req.body || {};
    if (!email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'email and items are required' });
    }

    const totals = await computeAmount(items);
    const reference = generateReference();
    const amountInSubunits = Math.round(totals.total * 100);

    await createOrder({
      reference,
      userId: req.userId, // null for guest checkout — order just won't show in anyone's history
      email,
      items,
      shippingAddress,
      amount: amountInSubunits,
      currency: DEFAULT_CURRENCY,
      status: 'pending',
    });

    res.json({
      reference,
      amount: amountInSubunits,
      currency: DEFAULT_CURRENCY,
      totals,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Confirms a transaction with Paystack directly (server-to-server, using the
// secret key) before treating an order as paid. The client's own "success"
// callback is never enough on its own — it can be spoofed.
router.post('/verify', express.json(), async (req, res) => {
  try {
    const { reference } = req.body || {};
    if (!reference) return res.status(400).json({ error: 'reference is required' });

    const order = await getOrder(reference);
    if (!order) return res.status(404).json({ error: 'Unknown order reference' });

    if (order.status === 'paid') {
      return res.json({ status: 'paid', reference, email: order.email });
    }

    const tx = await verifyTransaction(reference);

    if (tx.status !== 'success') {
      return res.status(402).json({ error: 'Payment was not successful', paystackStatus: tx.status });
    }
    if (tx.amount !== order.amount || tx.currency !== order.currency) {
      return res.status(400).json({ error: 'Amount or currency mismatch — refusing to fulfill' });
    }

    await markOrderPaid(reference, tx);
    res.json({ status: 'paid', reference, email: order.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Paystack's async notification, independent of whether the customer's
// browser stuck around for the popup's onSuccess callback. Needs the raw
// body (not JSON-parsed) to check the HMAC signature.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let secret;
  try {
    secret = getSecretKey();
  } catch {
    return res.sendStatus(500);
  }

  const signature = req.headers['x-paystack-signature'];
  const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');
  if (hash !== signature) return res.sendStatus(401);

  try {
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event === 'charge.success' && event.data?.reference) {
      await markOrderPaid(event.data.reference, event.data);
    }
    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

export default router;
