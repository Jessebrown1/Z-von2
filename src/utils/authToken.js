const TOKEN_KEY = 'zevon_token';

// Safari's cross-site cookie blocking (ITP) can silently drop the session
// cookie between the Vercel frontend and Render backend, even with
// SameSite=None; Secure. Storing the token client-side and sending it as an
// Authorization header sidesteps that entirely — Chrome/Android never hit
// this, but Safari does.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
