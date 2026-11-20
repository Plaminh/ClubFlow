import { afterEach, describe, expect, it } from 'vitest';
import { bearer, generateRequest, login, request, seedApplications, startMock } from './helpers.mjs';

const GENERATE = '/api/campaigns/cmp-2026-hk1/schedule/draft/generate';

async function readyToGenerate(baseUrl) {
  const exec = await login(baseUrl, 'exec');
  await seedApplications(baseUrl);
  await request(baseUrl, '/api/campaigns/cmp-2026-hk1/close-applications', { method: 'POST', headers: bearer(exec) });
  for (const id of ['A01', 'A02', 'A03']) {
    await request(baseUrl, `/api/campaigns/cmp-2026-hk1/applications/${id}/screening-decision`, {
      method: 'POST', headers: bearer(exec, { 'content-type': 'application/json' }), body: JSON.stringify({ decision: 'shortlisted' }),
    });
  }
  return exec;
}

describe('C8 draft settings (date, window, duration)', () => {
  let mock;
  afterEach(async () => mock?.close());

  it('refuses a missing or impossible body field by field and keeps no draft', async () => {
    mock = await startMock();
    const exec = await readyToGenerate(mock.baseUrl);

    const missing = await request(mock.baseUrl, GENERATE, generateRequest(exec, {}));
    expect(missing.response.status).toBe(400);
    expect(missing.body).toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(Object.keys(missing.body.fieldErrors).sort()).toEqual(['interviewDate', 'interviewWindow', 'slotMinutes']);

    const noBody = await request(mock.baseUrl, GENERATE, { method: 'POST', headers: bearer(exec) });
    expect(noBody.response.status).toBe(400);

    const impossible = await request(mock.baseUrl, GENERATE, generateRequest(exec, {
      interviewDate: '2026-11-20', interviewWindow: { start: '12:00', end: '09:00' }, slotMinutes: 45,
    }));
    expect(impossible.body.fieldErrors).toEqual({
      interviewDate: 'Interview date must be after the campaign closes.',
      interviewWindow: 'Start must be before end.',
      slotMinutes: 'Must be 15, 20, or 30.',
    });

    const tooShort = await request(mock.baseUrl, GENERATE, generateRequest(exec, {
      interviewDate: '2026-12-02', interviewWindow: { start: '09:00', end: '09:15' }, slotMinutes: 30,
    }));
    expect(tooShort.body.fieldErrors).toEqual({ interviewWindow: 'The window must fit at least one interview.' });

    const schedule = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule', { headers: bearer(exec) });
    expect(schedule.body.status).toBe('none');
  });

  it('builds the draft on the chosen window and duration, and checks row edits against them', async () => {
    mock = await startMock();
    const exec = await readyToGenerate(mock.baseUrl);
    const settings = { interviewDate: '2026-12-02', interviewWindow: { start: '10:00', end: '12:00' }, slotMinutes: 20 };

    const generated = await request(mock.baseUrl, GENERATE, generateRequest(exec, settings));
    expect(generated.response.status).toBe(200);
    expect(generated.body.settings).toMatchObject(settings);
    const a01 = generated.body.rows.find((row) => row.applicationId === 'A01');
    expect(a01).toMatchObject({ start: '2026-12-02T10:00:00+07:00', end: '2026-12-02T10:20:00+07:00', status: 'conflict', conflictWith: ['A02'] });

    const read = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule', { headers: bearer(exec) });
    expect(read.body.settings).toMatchObject(settings);

    const edit = (start) => request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/draft/rows/A02', {
      method: 'PATCH', headers: bearer(exec, { 'content-type': 'application/json' }), body: JSON.stringify({ start, interviewerId: 'iv-comms', roomId: 'room-b105' }),
    });
    const outside = await edit('2026-12-02T09:30:00+07:00');
    expect(outside.response.status).toBe(400);
    expect(outside.body.fieldErrors).toHaveProperty('start');
    const inside = await edit('2026-12-02T10:20:00+07:00');
    expect(inside.body.rows.find((row) => row.applicationId === 'A02')).toMatchObject({ end: '2026-12-02T10:40:00+07:00', status: 'proposed' });

    // The Campaign's own interview configuration is not changed by a draft.
    const campaign = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1', { headers: bearer(exec) });
    expect(campaign.body.campaign).toMatchObject({ interviewDate: '2026-12-02', slotMinutes: 30 });
  });

  it('leaves an application Unassigned, with the reason, when nobody is free at the chosen time', async () => {
    mock = await startMock();
    const exec = await readyToGenerate(mock.baseUrl);

    const generated = await request(mock.baseUrl, GENERATE, generateRequest(exec, {
      interviewDate: '2026-12-03', interviewWindow: { start: '09:00', end: '12:00' }, slotMinutes: 30,
    }));
    expect(generated.body.summary).toEqual({ total: 3, proposed: 0, conflict: 0, unassigned: 3 });
    expect(generated.body.rows.find((row) => row.applicationId === 'A01').reasons).toEqual(['The applicant is not available at the start of the chosen window.']);
  });
});
