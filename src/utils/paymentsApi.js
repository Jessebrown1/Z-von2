import { apiRequest } from './api';

/** Registers a pending order server-side and gets back the authoritative amount + reference to pay. */
export function initializePayment({ email, items, shippingAddress }) {
  return apiRequest('/api/payments/initialize', { method: 'POST', body: { email, items, shippingAddress } });
}

/** Confirms a completed Paystack transaction server-side before treating the order as paid. */
export function verifyPayment(reference) {
  return apiRequest('/api/payments/verify', { method: 'POST', body: { reference } });
}
