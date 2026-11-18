import { afterEach, describe, expect, it } from 'vitest';
import { bearer, login, request, startMock, submitApplication } from './helpers.mjs';

describe('deterministic mock modes and lifecycle', () => {
  let mock;
  afterEach(async () => mock?.close());

  it('applies slow, error, and recursive empty behavior after normal routing rules', async () => {
    mock = await startMock('slow', { slowDelayMs: 25 });
    const started = performance.now();
    await request(mock.baseUrl, '/api/health');
    expect(performance.now() - started).toBeGreaterThanOrEqual(20);
    await mock.close();

    mock = await startMock('error');
    expect(await login(mock.baseUrl, 'exec')).toBe('mock-token-exec');
    const domainError = await request(mock.baseUrl, '/api/campaigns/current');
    expect(domainError.body).toEqual({ error: 'The mock is running in deterministic error mode.', code: 'MOCK_ERROR_MODE' });
    await mock.close();

    mock = await startMock('empty');
    const token = await login(mock.baseUrl, 'exec');
    const campaign = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1', { headers: bearer(token) });
    expect(campaign.body.positions).toEqual([]);
    expect(campaign.body.interviewSetup.interviewers).toEqual([]);
    expect(campaign.body.campaign.id).toBe('cmp-2026-hk1');
  });

  it('records structured requests and resets mutable state without changing tokens', async () => {
    mock = await startMock();
    const student = await login(mock.baseUrl, 'studentA');
    await submitApplication(mock.baseUrl, student, 'pos-content');
    expect((await request(mock.baseUrl, '/api/me/applications', { headers: bearer(student) })).body.items).toHaveLength(1);
    expect(mock.logs.at(-1)).toEqual(expect.objectContaining({ method: 'GET', path: '/api/me/applications', status: 200, mode: 'normal', durationMs: expect.any(Number) }));
    mock.reset();
    expect((await request(mock.baseUrl, '/api/me/applications', { headers: bearer(student) })).body.items).toEqual([]);
    expect(await login(mock.baseUrl, 'studentA')).toBe(student);
  });
});
