import request from 'supertest';
import app from '../../src/app.js';

export const DEMO_PASSWORD = 'ClubFlowDemo!';

// Signs in through the real endpoint (docs/api/01-auth-profile.md) and returns the token.
// Needs POST /api/auth/login (tasks.md T041). Until then, use tokenFor() from ./tokens.js.
export async function loginAs(username, password = DEMO_PASSWORD) {
  const response = await request(app).post('/api/auth/login').send({ username, password });
  if (response.status !== 200) {
    throw new Error(`Sign-in as ${username} answered ${response.status}: ${response.text}`);
  }
  return response.body.token;
}
