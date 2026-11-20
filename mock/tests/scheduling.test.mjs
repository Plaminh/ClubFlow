import { afterEach, describe, expect, it } from 'vitest';
import { bearer, generateRequest, login, request, seedApplications, startMock } from './helpers.mjs';

describe('scheduling HTTP contract', () => {
  let mock;
  afterEach(async () => mock?.close());

  it('refuses invalid confirmation and recalculates conflict/unassigned rows', async () => {
    mock = await startMock();
    const exec = await login(mock.baseUrl, 'exec');
    await seedApplications(mock.baseUrl);
    const premature = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/confirm', { method: 'POST', headers: bearer(exec) });
    expect(premature.body).toMatchObject({ code: 'SCHEDULE_NOT_READY', details: { conditions: expect.any(Array) } });

    await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/close-applications', { method: 'POST', headers: bearer(exec) });
    for (const id of ['A01', 'A02', 'A03']) {
      await request(mock.baseUrl, `/api/campaigns/cmp-2026-hk1/applications/${id}/screening-decision`, {
        method: 'POST', headers: bearer(exec, { 'content-type': 'application/json' }), body: JSON.stringify({ decision: 'shortlisted' }),
      });
    }
    const generated = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/draft/generate', generateRequest(exec));
    expect(generated.body.summary).toEqual({ total: 3, proposed: 0, conflict: 2, unassigned: 1 });
    expect(generated.body.rows.find((row) => row.applicationId === 'A01').conflictWith).toEqual(['A02']);
    for (const row of generated.body.rows) expect(row.availabilityText).toEqual(expect.stringMatching(/^\d{2}:\d{2}-\d{2}:\d{2}/));

    const edit = async (id, start) => request(mock.baseUrl, `/api/campaigns/cmp-2026-hk1/schedule/draft/rows/${id}`, {
      method: 'PATCH',
      headers: bearer(exec, { 'content-type': 'application/json' }),
      body: JSON.stringify({ start, interviewerId: 'iv-comms', roomId: 'room-b105' }),
    });
    expect((await edit('A02', '2026-12-02T09:30:00+07:00')).body.summary).toEqual({ total: 3, proposed: 2, conflict: 0, unassigned: 1 });
    expect((await edit('A03', '2026-12-02T10:00:00+07:00')).body.summary).toEqual({ total: 3, proposed: 3, conflict: 0, unassigned: 0 });

    const unsaved = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/confirm', { method: 'POST', headers: bearer(exec) });
    expect(unsaved.body.code).toBe('SCHEDULE_NOT_READY');
    const saved = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/draft/save', { method: 'POST', headers: bearer(exec) });
    expect(saved.body).toMatchObject({ dirty: false, canConfirm: true });
    const exported = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule.csv', { headers: bearer(exec) });
    expect(exported.body).toContain('A03,Pham Quoc Bao');
    const confirmed = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/confirm', { method: 'POST', headers: bearer(exec) });
    expect(confirmed.body.status).toBe('confirmed');
    expect(confirmed.body.rows.every((row) => row.status === 'confirmed')).toBe(true);
    expect((await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/draft/generate', generateRequest(exec))).body.code).toBe('SCHEDULE_CONFIRMED');
  });
});
