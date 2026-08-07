/*
  Thin wrapper around the Paystack REST API. Only server-side verification
  lives here — transaction creation happens client-side via the Paystack
  Inline popup, which needs no secret key. Verifying with the secret key
  afterward is what actually proves a payment succeeded; never trust the
  browser's success callback on its own.
*/
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not set on the server — add it to server/.env');
  }
  return key;
}

export async function verifyTransaction(reference) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
  });

  const data = await res.json();
  if (!res.ok || data.status === false) {
    throw new Error(data?.message || `Paystack verify failed (${res.status})`);
  }
  return data.data;
}

export { getSecretKey };
