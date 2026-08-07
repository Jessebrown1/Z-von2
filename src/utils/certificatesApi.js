import { apiRequest } from './api';

export function fetchMyCertificates() {
  return apiRequest('/api/certificates/mine');
}

export function fetchCertificate(id) {
  return apiRequest(`/api/certificates/${encodeURIComponent(id)}`);
}
