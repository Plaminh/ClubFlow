import { vi } from 'vitest';
import request from 'supertest';

vi.mock('../../../src/repositories/health.repository.js', () => ({
  getDatabaseStatus: vi.fn().mockResolvedValue({
    databaseTime: new Date('2026-10-04T00:00:00.000Z'),
  }),
}));

const { default: app } = await import('../../../src/app.js');

describe('GET /api/health', () => {
  it('returns API and database health', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('reachable');
    expect(response.body.databaseTime).toBe('2026-10-04T00:00:00.000Z');
  });
});
