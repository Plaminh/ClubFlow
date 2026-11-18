import { apiClient } from './apiClient.js';

export const DEMO_PASSWORD = 'ClubFlowDemo!';
export const DEMO_CREDENTIALS = Object.freeze([
  { id: 'exec-recruitment', username: 'exec', role: 'executive', displayName: 'Recruitment Executive', description: 'Technology and Innovation Club', password: DEMO_PASSWORD },
  { id: 'ap-minhanh', username: 'studentA', role: 'applicant', displayName: 'Nguyen Minh Anh', password: DEMO_PASSWORD },
  { id: 'ap-quocbao', username: 'studentB', role: 'applicant', displayName: 'Pham Quoc Bao', password: DEMO_PASSWORD },
  { id: 'iv-giahuy', username: 'int-content', role: 'interviewer', displayName: 'Gia Huy', description: 'Content', password: DEMO_PASSWORD },
  { id: 'iv-comms', username: 'int-comms', role: 'interviewer', displayName: 'Linh Tran', description: 'Communications', password: DEMO_PASSWORD },
]);

export function signIn({ username = '', password = '' } = {}, options = {}) {
  return apiClient('/auth/login', { method: 'POST', body: { username: username.trim(), password }, ...options });
}

export function signOut(options = {}) {
  return apiClient('/auth/logout', { method: 'POST', ...options });
}

export function getCurrentUser(options = {}) {
  return apiClient('/auth/me', options);
}

export async function listDemoCredentials() {
  return DEMO_CREDENTIALS.map((credential) => ({ ...credential }));
}
