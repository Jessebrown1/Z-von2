import { apiRequest } from './api';

// Both silently no-op server-side for guests — safe to call unconditionally.
export function recordProductView(productId) {
  return apiRequest('/api/interactions/view', { method: 'POST', body: { productId } });
}

export function recordMoodSelection(mood) {
  return apiRequest('/api/interactions/mood', { method: 'POST', body: { mood } });
}
