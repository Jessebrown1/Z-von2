import { getToken, clearToken } from './authToken';

// Empty in dev (Vite proxies /api to the local backend, same-origin) — set
// VITE_API_URL in production to the deployed backend's origin (e.g. Render),
// since the frontend (Vercel) and backend live on different domains there.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/** Shared fetch wrapper — sends the session cookie plus a bearer token (Safari drops cross-site cookies), always parses JSON errors consistently. */
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) clearToken();
    const error = new Error(data.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}
