// Empty in dev (Vite proxies /api to the local backend, same-origin) — set
// VITE_API_URL in production to the deployed backend's origin (e.g. Render),
// since the frontend (Vercel) and backend live on different domains there.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/** Shared fetch wrapper — always sends the session cookie, always parses JSON errors consistently. */
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
