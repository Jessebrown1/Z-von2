import { apiRequest } from './api';

export function fetchStyleDna() {
  return apiRequest('/api/style-dna');
}
