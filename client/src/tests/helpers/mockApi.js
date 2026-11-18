import { vi } from 'vitest';
import { ACCOUNTS } from '../../mocks/fixtures.js';

const BASE_USERS = [
  { id: 'exec-recruitment', handle: 'exec', role: 'executive', displayName: 'Recruitment Executive', email: 'executive@clubflow.demo.example', description: 'Technology and Innovation Club' },
  { id: 'ap-minhanh', handle: 'studentA', role: 'applicant', displayName: 'Nguyen Minh Anh', email: 'minh.anh@demo.example', studentId: '26DEMO0142', faculty: 'Information Technology', year: 'Year 2' },
  { id: 'ap-quocbao', handle: 'studentB', role: 'applicant', displayName: 'Pham Quoc Bao', email: 'quoc.bao@demo.example', studentId: '26DEMO0177', faculty: 'Design', year: 'Year 3' },
  { id: 'iv-giahuy', handle: 'int-content', role: 'interviewer', displayName: 'Gia Huy', email: 'gia.huy@clubflow.demo.example', description: 'Content' },
  { id: 'iv-comms', handle: 'int-comms', role: 'interviewer', displayName: 'Linh Tran', email: 'linh.tran@clubflow.demo.example', description: 'Communications' },
];

let users;
let legacyUsers;
let mode;
let delayMs;

export function resetMockApi() {
  users = structuredClone(BASE_USERS);
  legacyUsers = structuredClone(ACCOUNTS);
  mode = 'normal';
  delayMs = 0;
}

export function setMockApiMode(nextMode) {
  mode = nextMode;
}

export function setMockApiDelay(milliseconds) {
  delayMs = milliseconds;
}

function response(status, body) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: status === 204 ? {} : { 'content-type': 'application/json' },
  });
}

function tokenFrom(init) {
  const headers = new Headers(init?.headers);
  return headers.get('authorization')?.replace(/^Bearer\s+/iu, '') ?? null;
}

function userForToken(token) {
  if (token?.startsWith('mock-test-token-')) {
    return legacyUsers.find((user) => user.id === token.slice('mock-test-token-'.length)) ?? null;
  }
  const handle = token?.replace(/^mock-token-/u, '');
  return users.find((user) => user.handle === handle) ?? null;
}

async function handleFetch(input, init = {}) {
  if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (mode === 'network-error') throw new TypeError('Failed to fetch');
  const url = new URL(String(input), 'http://clubflow.test');
  const method = init.method ?? 'GET';
  if (url.pathname === '/api/health') return response(200, { status: 'ok' });
  if (url.pathname === '/api/auth/login' && method === 'POST') {
    const body = JSON.parse(init.body ?? '{}');
    const user = users.find((candidate) => candidate.handle === body.username);
    if (!user || body.password !== 'ClubFlowDemo!') return response(401, { error: 'Username or password is incorrect.', code: 'INVALID_CREDENTIALS' });
    return response(200, { token: `mock-token-${user.handle}`, user });
  }
  const user = userForToken(tokenFrom(init));
  if (!user) return response(401, { error: 'A valid bearer token is required.', code: 'INVALID_TOKEN' });
  if (url.pathname === '/api/auth/me' && method === 'GET') return response(200, user);
  if (url.pathname === '/api/auth/logout' && method === 'POST') return response(204);
  if (url.pathname === '/api/me/profile' && method === 'GET') {
    const { handle: _handle, description: _description, ...profile } = user;
    return response(200, profile);
  }
  if (url.pathname === '/api/me/profile' && method === 'PATCH') {
    const body = JSON.parse(init.body ?? '{}');
    const fieldErrors = {};
    if (!body.displayName?.trim()) fieldErrors.displayName = 'Display name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(body.email ?? '')) fieldErrors.email = 'A valid email is required.';
    if (Object.keys(fieldErrors).length) return response(400, { error: 'Profile fields are invalid.', code: 'VALIDATION_ERROR', fieldErrors });
    if ([...users, ...legacyUsers].some((candidate) => candidate.id !== user.id && candidate.email.toLowerCase() === body.email.toLowerCase())) return response(409, { error: 'That email is already in use.', code: 'EMAIL_ALREADY_USED', fieldErrors: { email: 'That email is already in use.' } });
    user.displayName = body.displayName.trim();
    user.email = body.email.trim().toLowerCase();
    const { handle: _handle, description: _description, ...profile } = user;
    return response(200, profile);
  }
  return response(404, { error: 'Endpoint not found.', code: 'NOT_FOUND' });
}

export function installMockApi() {
  vi.stubGlobal('fetch', vi.fn(handleFetch));
}

resetMockApi();
