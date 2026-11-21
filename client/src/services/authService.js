import { apiClient } from './apiClient.js';

export const DEMO_PASSWORD = 'ClubFlowDemo!';
// Labels for the demo sign-in shortcuts only. People's names come from the API
// (POST /api/auth/login, GET /api/auth/me) after sign-in.
export const DEMO_CREDENTIALS = Object.freeze([
  {
    id: 'exec-recruitment',
    username: 'exec',
    role: 'executive',
    displayName: 'Executive',
    password: DEMO_PASSWORD,
  },
  {
    id: 'ap-minhanh',
    username: 'studentA',
    role: 'applicant',
    displayName: 'Student A',
    password: DEMO_PASSWORD,
  },
  {
    id: 'ap-quocbao',
    username: 'studentB',
    role: 'applicant',
    displayName: 'Student B',
    password: DEMO_PASSWORD,
  },
  {
    id: 'iv-giahuy',
    username: 'int-content',
    role: 'interviewer',
    displayName: 'Interviewer – Content',
    password: DEMO_PASSWORD,
  },
  {
    id: 'iv-comms',
    username: 'int-comms',
    role: 'interviewer',
    displayName: 'Interviewer – Communications',
    password: DEMO_PASSWORD,
  },
]);

export function signIn({ username = '', password = '' } = {}, options = {}) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: { username: username.trim(), password },
    ...options,
  });
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
