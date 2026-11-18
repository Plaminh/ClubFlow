import { apiClient } from './apiClient.js';

export function getProfile(options = {}) {
  return apiClient('/me/profile', options);
}

export function updateProfile({ displayName = '', email = '' } = {}, options = {}) {
  return apiClient('/me/profile', {
    method: 'PATCH',
    body: { displayName: displayName.trim(), email: email.trim().toLowerCase() },
    ...options,
  });
}
