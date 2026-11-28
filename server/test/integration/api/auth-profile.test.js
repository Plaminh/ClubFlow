import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../../src/app.js';
import { env } from '../../../src/config/env.js';
import { DEMO_PASSWORD, loginAs } from '../../helpers/auth.js';
import { pool, resetDatabase } from '../../helpers/db.js';
import { tokenForSeedUser } from '../../helpers/tokens.js';

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await resetDatabase();
});

describe('Authentication and profile API (T041)', () => {
  it('Auth login returns the contract user and an HS256 token with the expected role', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'studentA', password: DEMO_PASSWORD, role: 'executive' });

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual(['token', 'user']);
    expect(response.body.user).toEqual({
      id: 'ap-minhanh',
      handle: 'studentA',
      role: 'applicant',
      displayName: 'Nguyen Minh Anh',
      email: 'minh.anh@demo.example',
      studentId: '26DEMO0142',
      faculty: 'Information Technology',
      year: 'Year 2',
    });

    const decoded = jwt.decode(response.body.token, { complete: true });
    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.payload).toMatchObject({ sub: 'ap-minhanh', role: 'applicant' });
    expect(decoded.payload.exp - decoded.payload.iat).toBeLessThanOrEqual(24 * 60 * 60);
    expect(jwt.verify(response.body.token, env.jwtSecret, { algorithms: ['HS256'] })).toBeTruthy();
    expect(response.text).not.toContain('password_hash');
  });

  it('Auth malformed login fields return 400 VALIDATION_ERROR with field errors', async () => {
    const response = await request(app).post('/api/auth/login').send({ username: ' ' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        username: expect.any(String),
        password: expect.any(String),
      },
    });
  });

  it('Auth unknown username and wrong password have the same 401 answer', async () => {
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: DEMO_PASSWORD });
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ username: 'studentA', password: 'wrong-password' });

    expect(unknown.status).toBe(401);
    expect(unknown.body).toEqual({
      error: 'The username or password is incorrect.',
      code: 'INVALID_CREDENTIALS',
    });
    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknown.body);
  });

  it('Auth current user requires a token and returns the caller User DTO', async () => {
    const anonymous = await request(app).get('/api/auth/me');
    const authenticated = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenForSeedUser('studentA')}`);

    expect(anonymous.status).toBe(401);
    expect(anonymous.body.code).toBe('INVALID_TOKEN');
    expect(authenticated.status).toBe(200);
    expect(authenticated.body).toEqual({
      id: 'ap-minhanh',
      handle: 'studentA',
      role: 'applicant',
      displayName: 'Nguyen Minh Anh',
      email: 'minh.anh@demo.example',
      studentId: '26DEMO0142',
      faculty: 'Information Technology',
      year: 'Year 2',
    });
    expect(authenticated.text).not.toContain('password_hash');
  });

  it('Auth profile GET returns the authenticated user profile', async () => {
    const token = await loginAs('studentA');
    const response = await request(app)
      .get('/api/me/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'ap-minhanh',
      role: 'applicant',
      displayName: 'Nguyen Minh Anh',
      email: 'minh.anh@demo.example',
      studentId: '26DEMO0142',
      faculty: 'Information Technology',
      year: 'Year 2',
    });
  });

  it('Auth profile PATCH updates allowed fields and ignores role and unknown fields', async () => {
    const token = await loginAs('studentA');
    const response = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'Nguyen Minh Anh Updated',
        email: 'minh.anh.updated@demo.example',
        role: 'executive',
        password_hash: 'not-allowed',
        isAdmin: true,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'ap-minhanh',
      role: 'applicant',
      displayName: 'Nguyen Minh Anh Updated',
      email: 'minh.anh.updated@demo.example',
      studentId: '26DEMO0142',
      faculty: 'Information Technology',
      year: 'Year 2',
    });

    const { rows } = await pool.query('SELECT role, password_hash FROM users WHERE id = $1', [
      'ap-minhanh',
    ]);
    expect(rows[0].role).toBe('applicant');
    expect(rows[0].password_hash).not.toBe('not-allowed');
  });

  it('Auth profile PATCH rejects invalid fields and an e-mail already used by another account', async () => {
    const token = await loginAs('studentA');
    const invalid = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: ' ', email: 'not-an-email' });
    const duplicateEmail = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: 'Nguyen Minh Anh', email: 'executive@clubflow.demo.example' });

    expect(invalid.status).toBe(400);
    expect(invalid.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        displayName: expect.any(String),
        email: expect.any(String),
      },
    });
    expect(duplicateEmail.status).toBe(409);
    expect(duplicateEmail.body).toMatchObject({ code: 'EMAIL_ALREADY_USED' });
  });

  it('Auth logout answers 204 and does not revoke the stateless token', async () => {
    const token = await loginAs('studentA');
    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    const stillValid = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(logout.status).toBe(204);
    expect(logout.text).toBe('');
    expect(stillValid.status).toBe(200);
  });
});
