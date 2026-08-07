import { apiRequest } from './api';

export function fetchWishlist() {
  return apiRequest('/api/wishlist');
}

export function addToWishlist(productId) {
  return apiRequest(`/api/wishlist/${encodeURIComponent(productId)}`, { method: 'POST' });
}

export function removeFromWishlist(productId) {
  return apiRequest(`/api/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}
