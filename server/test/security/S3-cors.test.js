import { vi } from 'vitest';
import request from 'supertest';

// The database is not needed to read CORS headers.
vi.mock('../../src/repositories/health.repository.js', () => ({
  getDatabaseStatus: vi.fn().mockResolvedValue({ databaseTime: new Date() }),
}));

const { default: app } = await import('../../src/app.js');

// The front end reaches the API through the Vite proxy (same origin), so the server sends no
// CORS headers at all: not for an attacker's origin, and not for the dev server's origin either.
const ORIGINS = ['http://attacker.example', 'http://localhost:5173', 'http://localhost:3000'];

describe('S3 cors() open to every origin', () => {
  it('S3 a request from another origin gets no Access-Control-Allow-Origin header', async () => {
    for (const origin of ORIGINS) {
      const response = await request(app).get('/api/health').set('Origin', origin);

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    }
  });

  it('S3 a preflight from another origin is not allowed', async () => {
    for (const origin of ORIGINS) {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
      expect(response.headers['access-control-allow-methods']).toBeUndefined();
    }
  });
});
