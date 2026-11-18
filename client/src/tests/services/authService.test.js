import { afterEach, describe, expect, it } from 'vitest';
import { setAuthTokenProvider } from '../../services/apiClient.js';
import * as authService from '../../services/authService.js';

afterEach(() => setAuthTokenProvider(null));

describe('authService HTTP adapter', () => {
  it.each([
    ['exec', 'exec-recruitment', 'executive'],
    ['studentA', 'ap-minhanh', 'applicant'],
    ['studentB', 'ap-quocbao', 'applicant'],
    ['int-content', 'iv-giahuy', 'interviewer'],
    ['int-comms', 'iv-comms', 'interviewer'],
  ])('signs %s in through the canonical endpoint', async (username, id, role) => {
    const session = await authService.signIn({ username, password: authService.DEMO_PASSWORD });
    expect(session).toMatchObject({ token: `mock-token-${username}`, user: { id, role, handle: username } });
    expect(JSON.stringify(session.user)).not.toContain(authService.DEMO_PASSWORD);
  });

  it('trims usernames and rejects invalid credentials with the backend code', async () => {
    await expect(authService.signIn({ username: ' studentA ', password: authService.DEMO_PASSWORD })).resolves.toMatchObject({ user: { id: 'ap-minhanh' } });
    await expect(authService.signIn({ username: 'studentA', password: 'wrong' })).rejects.toMatchObject({ kind: 'forbidden', code: 'INVALID_CREDENTIALS' });
  });

  it('restores the current user and logs out with the registered bearer token', async () => {
    setAuthTokenProvider(() => 'mock-token-studentA');
    await expect(authService.getCurrentUser()).resolves.toMatchObject({ id: 'ap-minhanh', role: 'applicant' });
    await expect(authService.signOut()).resolves.toBeNull();
  });

  it('lists all canonical fictional credentials without an API round trip', async () => {
    const credentials = await authService.listDemoCredentials();
    expect(credentials.map((item) => item.username)).toEqual(['exec', 'studentA', 'studentB', 'int-content', 'int-comms']);
    expect(credentials.every((item) => item.password === authService.DEMO_PASSWORD)).toBe(true);
  });
});
