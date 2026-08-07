export function formatPrice(amount, currency = 'GHS') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ZV-${stamp}-${rand}`;
}

export function cartLineKey(productId, size, color) {
  return [productId, size, color].join('__');
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
