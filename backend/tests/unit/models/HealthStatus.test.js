import { describe, expect, it } from 'vitest';
import HealthStatus from '../../../src/models/HealthStatus.js';

describe('HealthStatus', () => {
  it('serializes health data consistently', () => {
    const status = new HealthStatus({
      databaseTime: '2026-10-04T00:00:00.000Z',
      checkedAt: '2026-10-04T00:00:01.000Z',
    });

    expect(status.toJSON()).toEqual({
      status: 'ok',
      database: 'reachable',
      databaseTime: '2026-10-04T00:00:00.000Z',
      checkedAt: '2026-10-04T00:00:01.000Z',
    });
  });
});
