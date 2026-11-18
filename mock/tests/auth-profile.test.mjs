import { afterEach, describe, expect, it } from 'vitest';
import { bearer, login, request, startMock } from './helpers.mjs';

describe('authentication and profile HTTP contract', () => {
  let mock;
  afterEach(async () => mock?.close());

  it('uses canonical username credentials and stable restart tokens', async () => {
    mock = await startMock();
    const firstToken = await login(mock.baseUrl, 'studentA');
    expect(firstToken).toBe('mock-token-studentA');
    await mock.close();
    mock = await startMock();
    expect(await login(mock.baseUrl, 'studentA')).toBe(firstToken);

    const me = await request(mock.baseUrl, '/api/auth/me', { headers: bearer(firstToken) });
    expect(me.response.status).toBe(200);
    expect(me.body).toMatchObject({ id: 'ap-minhanh', role: 'applicant', handle: 'studentA' });
  });

  it('rejects invalid credentials and validates own profile updates', async () => {
    mock = await startMock();
    const invalid = await request(mock.baseUrl, '/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'exec', password: 'wrong' }),
    });
    expect(invalid.response.status).toBe(401);
    expect(invalid.body.code).toBe('INVALID_CREDENTIALS');

    const token = await login(mock.baseUrl, 'studentA');
    const badProfile = await request(mock.baseUrl, '/api/me/profile', {
      method: 'PATCH',
      headers: bearer(token, { 'content-type': 'application/json' }),
      body: JSON.stringify({ displayName: '', email: 'invalid' }),
    });
    expect(badProfile.response.status).toBe(400);
    expect(badProfile.body.fieldErrors).toEqual(expect.objectContaining({ displayName: expect.any(String), email: expect.any(String) }));

    const updated = await request(mock.baseUrl, '/api/me/profile', {
      method: 'PATCH',
      headers: bearer(token, { 'content-type': 'application/json' }),
      body: JSON.stringify({ displayName: 'Minh Anh Demo', email: 'minhanh.updated@demo.example' }),
    });
    expect(updated.body).toMatchObject({ displayName: 'Minh Anh Demo', email: 'minhanh.updated@demo.example', studentId: '26DEMO0142' });
    expect((await request(mock.baseUrl, '/api/auth/logout', { method: 'POST', headers: bearer(token) })).response.status).toBe(204);
  });
});
