import { apiRequest, API_BASE_URL } from './api';
import { getToken } from './authToken';

export function fetchAllOrders() {
  return apiRequest('/api/admin/orders');
}

export function setOrderStatus(reference, status) {
  return apiRequest(`/api/admin/orders/${encodeURIComponent(reference)}`, { method: 'PATCH', body: { status } });
}

export function fetchAdminProducts() {
  return apiRequest('/api/admin/products');
}

export function createProduct(payload) {
  return apiRequest('/api/admin/products', { method: 'POST', body: payload });
}

export function updateProduct(id, payload) {
  return apiRequest(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
}

export function deleteProduct(id) {
  return apiRequest(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** Multipart upload — doesn't go through apiRequest since that always JSON-encodes the body. */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data;
}
