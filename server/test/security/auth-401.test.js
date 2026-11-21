import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { resetDatabase } from '../helpers/db.js';
import { SEED_USERS, tokenForSeedUser } from '../helpers/tokens.js';

// PA#4 criterion 5: every protected endpoint answers 401 to no token, a token signed with
// another secret, alg: none, an expired token and an edited payload. Checked here on
// GET /api/auth/me, the endpoint every role can call (docs/api/01-auth-profile.md).
// Each test also sends the request that must succeed, so it cannot pass on a missing endpoint.

const studentA = SEED_USERS.studentA;
const payload = { sub: studentA.id, role: studentA.role };

beforeAll(async () => {
  await resetDatabase();
});

async function expectSignedInWorks() {
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${tokenForSeedUser('studentA')}`);
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({ id: studentA.id, handle: 'studentA', role: 'applicant' });
}

async function expect401(authorization) {
  const call = request(app).get('/api/auth/me');
  const response = authorization ? await call.set('Authorization', authorization) : await call;
  expect(response.status).toBe(401);
  expect(response.body.code).toBe('INVALID_TOKEN');
}

describe('Sign-in token checks on a protected endpoint', () => {
  it('Auth no token answers 401, a valid token answers 200', async () => {
    await expectSignedInWorks();
    await expect401(undefined);
  });

  it('Auth a token signed with another secret answers 401', async () => {
    await expectSignedInWorks();
    await expect401(`Bearer ${jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' })}`);
  });

  it('Auth a token with alg: none answers 401', async () => {
    await expectSignedInWorks();
    await expect401(`Bearer ${jwt.sign(payload, null, { algorithm: 'none' })}`);
  });

  it('Auth an expired token answers 401', async () => {
    await expectSignedInWorks();
    await expect401(`Bearer ${jwt.sign(payload, env.jwtSecret, { expiresIn: '-1s' })}`);
  });

  it('Auth a token whose payload was edited answers 401', async () => {
    await expectSignedInWorks();
    const [header, , signature] = tokenForSeedUser('studentA').split('.');
    const edited = Buffer.from(JSON.stringify({ ...payload, role: 'executive' })).toString(
      'base64url',
    );
    await expect401(`Bearer ${header}.${edited}.${signature}`);
  });
});
