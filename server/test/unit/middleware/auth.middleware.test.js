import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticate, requireRole } from '../../../src/middleware/auth.middleware.js';
import { errorHandler } from '../../../src/middleware/errorHandler.js';
import { env } from '../../../src/config/env.js';
import { tokenFor } from '../../helpers/tokens.js';

// A small app with the real middleware and error handler: one route for any signed-in user,
// one for the Executive only.
const app = express();
app.get('/me', authenticate, (req, res) => res.json(req.user));
app.get('/exec-only', authenticate, requireRole('executive'), (req, res) => res.json(req.user));
app.use(errorHandler);

const payload = { sub: 'ap-minhanh', role: 'applicant' };

function expectInvalidToken(response) {
  expect(response.status).toBe(401);
  expect(response.body).toEqual({ error: expect.any(String), code: 'INVALID_TOKEN' });
}

describe('authenticate', () => {
  it('lets a valid token through and reads the user id and role from it', async () => {
    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${tokenFor('ap-minhanh', 'applicant')}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'ap-minhanh', role: 'applicant' });
  });

  it('answers 401 INVALID_TOKEN with no Authorization header, another scheme, or an empty token', async () => {
    expectInvalidToken(await request(app).get('/me'));
    expectInvalidToken(await request(app).get('/me').set('Authorization', 'Basic abc'));
    expectInvalidToken(await request(app).get('/me').set('Authorization', 'Bearer '));
    expectInvalidToken(await request(app).get('/me').set('Authorization', 'Bearer not-a-jwt'));
  });

  it('answers 401 to a token signed with another secret', async () => {
    const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
    expectInvalidToken(await request(app).get('/me').set('Authorization', `Bearer ${token}`));
  });

  it('answers 401 to a token with alg: none', async () => {
    const token = jwt.sign(payload, null, { algorithm: 'none' });
    expectInvalidToken(await request(app).get('/me').set('Authorization', `Bearer ${token}`));
  });

  it('answers 401 to an expired token', async () => {
    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '-1s' });
    expectInvalidToken(await request(app).get('/me').set('Authorization', `Bearer ${token}`));
  });

  it('answers 401 to a token whose payload was edited', async () => {
    const [header, , signature] = tokenFor('ap-minhanh', 'applicant').split('.');
    const edited = Buffer.from(JSON.stringify({ sub: 'ap-minhanh', role: 'executive' })).toString(
      'base64url',
    );
    expectInvalidToken(
      await request(app).get('/me').set('Authorization', `Bearer ${header}.${edited}.${signature}`),
    );
  });

  it('answers 401 to a correctly signed token without a user id or a known role', async () => {
    const noRole = jwt.sign({ sub: 'ap-minhanh' }, env.jwtSecret, { expiresIn: '1h' });
    const otherRole = jwt.sign({ sub: 'x', role: 'admin' }, env.jwtSecret, { expiresIn: '1h' });
    expectInvalidToken(await request(app).get('/me').set('Authorization', `Bearer ${noRole}`));
    expectInvalidToken(await request(app).get('/me').set('Authorization', `Bearer ${otherRole}`));
  });
});

describe('requireRole', () => {
  it('lets the right role through and answers 403 ROLE_FORBIDDEN to another role', async () => {
    const asExec = await request(app)
      .get('/exec-only')
      .set('Authorization', `Bearer ${tokenFor('exec-recruitment', 'executive')}`);
    expect(asExec.status).toBe(200);

    const asApplicant = await request(app)
      .get('/exec-only')
      .set('Authorization', `Bearer ${tokenFor('ap-minhanh', 'applicant')}`);
    expect(asApplicant.status).toBe(403);
    expect(asApplicant.body).toEqual({ error: expect.any(String), code: 'ROLE_FORBIDDEN' });
  });
});
