import { vi } from 'vitest';
import request from 'supertest';

const getDatabaseStatus = vi.fn();
vi.mock('../../../src/repositories/health.repository.js', () => ({ getDatabaseStatus }));

const { default: app } = await import('../../../src/app.js');

// docs/api/README.md, Error Convention: every non-2xx answer is { error, code, fieldErrors?, details? }.
function expectErrorShape(body, code) {
  expect(typeof body.error).toBe('string');
  expect(body.error.length).toBeGreaterThan(0);
  expect(body.code).toBe(code);
  for (const key of Object.keys(body)) {
    expect(['error', 'code', 'fieldErrors', 'details']).toContain(key);
  }
}

describe('Error convention', () => {
  it('Contract broken JSON in a request body returns 400 INVALID_JSON, not 500', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"username": "exec", "password":');

    expect(response.status).toBe(400);
    expectErrorShape(response.body, 'INVALID_JSON');
  });

  it('Contract a body over the JSON size limit returns 413 PAYLOAD_TOO_LARGE', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ username: 'exec', password: 'x'.repeat(200 * 1024) }));

    expect(response.status).toBe(413);
    expectErrorShape(response.body, 'PAYLOAD_TOO_LARGE');
  });

  it('Contract an unknown path returns 404 NOT_FOUND in the error shape', async () => {
    const response = await request(app).get('/api/no-such-endpoint');

    expect(response.status).toBe(404);
    expectErrorShape(response.body, 'NOT_FOUND');
  });

  it('Contract an unexpected failure returns 500 INTERNAL_ERROR with no stack trace or detail', async () => {
    getDatabaseStatus.mockRejectedValueOnce(new Error('connect ECONNREFUSED 10.0.0.7:5432'));

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(500);
    expectErrorShape(response.body, 'INTERNAL_ERROR');
    expect(response.text).not.toContain('ECONNREFUSED');
    expect(response.text).not.toMatch(/\bat .+\.js:\d+/);
  });
});
