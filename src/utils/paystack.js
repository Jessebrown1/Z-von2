const SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js';
let scriptPromise = null;

function loadPaystackScript() {
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load Paystack. Check your connection and try again.'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Opens the Paystack Inline popup and resolves with the transaction once the
 * customer completes payment. `amount` must already be in the currency's
 * smallest unit (kobo/cents) — pass through whatever /api/payments/initialize
 * returned, don't recompute it client-side.
 */
export async function payWithPaystack({ publicKey, email, amount, currency, reference, metadata }) {
  if (!publicKey) {
    throw new Error('Paystack is not configured — set VITE_PAYSTACK_PUBLIC_KEY in the project .env.');
  }

  await loadPaystackScript();

  return new Promise((resolve, reject) => {
    const popup = new window.PaystackPop();
    popup.newTransaction({
      key: publicKey,
      email,
      amount,
      currency,
      reference,
      metadata,
      onSuccess: (transaction) => resolve(transaction),
      onCancel: () => reject(new PaystackCancelledError()),
    });
  });
}

export class PaystackCancelledError extends Error {
  constructor() {
    super('Payment was cancelled.');
    this.name = 'PaystackCancelledError';
  }
}
