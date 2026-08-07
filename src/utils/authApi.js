import { apiRequest } from './api';

export function signup({ email, password, firstName, lastName, phone }) {
  return apiRequest('/api/auth/signup', { method: 'POST', body: { email, password, firstName, lastName, phone } });
}

export function login({ email, password }) {
  return apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });
}

export function loginWithGoogle(credential) {
  return apiRequest('/api/auth/google', { method: 'POST', body: { credential } });
}

export function logout() {
  return apiRequest('/api/auth/logout', { method: 'POST' });
}

export function fetchCurrentUser() {
  return apiRequest('/api/auth/me');
}

export function fetchOrderHistory() {
  return apiRequest('/api/orders');
}
