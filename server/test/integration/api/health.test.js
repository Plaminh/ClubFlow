import { vi } from 'vitest';
import request from 'supertest';

vi.mock('../../../src/repositories/health.repository.js', () => ({
  getDatabaseStatus: vi.fn().mockResolvedValue({
    databaseTime: new Date('2026-10-04T00:00:00.000Z'),
  }),
}));

const { default: app } = await import('../../../src/app.js');

describe('GET /api/health', () => {
  // docs/api/README.md, Health Example (Changes 2026-11-19): the answer is { "status": "ok" } only.
  it('Contract returns exactly { status: ok } once the database answers', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
