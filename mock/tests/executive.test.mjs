import { afterEach, describe, expect, it } from 'vitest';
import { bearer, login, request, seedApplications, startMock } from './helpers.mjs';

const draft = {
  name: 'ClubFlow 2027 Recruitment',
  hostClub: 'Technology and Innovation Club',
  description: 'Recruit the next club cohort.',
  instructions: 'Choose a position and submit one PDF CV.',
  opensOn: '2027-01-10',
  closesOn: '2027-01-25',
  interviewDate: '2027-02-01',
  interviewWindow: { start: '09:00', end: '12:00' },
  slotMinutes: 30,
  positions: [{ departmentName: 'Communications', name: 'Content', quota: 2, description: 'Create useful club content.', requirements: 'Clear writing.' }],
};

describe('executive campaign and review HTTP contract', () => {
  let mock;
  afterEach(async () => mock?.close());

  it('creates, configures, publishes, and constrains campaign edits', async () => {
    mock = await startMock();
    const exec = await login(mock.baseUrl, 'exec');
    const created = await request(mock.baseUrl, '/api/campaigns', {
      method: 'POST', headers: bearer(exec, { 'content-type': 'application/json' }), body: JSON.stringify(draft),
    });
    expect(created.response.status).toBe(201);
    const positionId = created.body.positions[0].id;
    const setup = await request(mock.baseUrl, '/api/campaigns/cmp-2027-hk1/interview-setup', {
      method: 'PATCH',
      headers: bearer(exec, { 'content-type': 'application/json' }),
      body: JSON.stringify({
        interviewDate: '2027-02-01', interviewWindow: { start: '09:00', end: '12:00' }, slotMinutes: 30,
        roomIds: ['room-a201'],
        assignments: [{ interviewerId: 'iv-giahuy', positionIds: [positionId], availability: [{ start: '2027-02-01T09:00:00+07:00', end: '2027-02-01T12:00:00+07:00' }] }],
      }),
    });
    expect(setup.body.interviewSetup.assignments).toHaveLength(1);
    const published = await request(mock.baseUrl, '/api/campaigns/cmp-2027-hk1/publish', { method: 'POST', headers: bearer(exec) });
    expect(published.body).toMatchObject({ phase: 'before-open', campaign: { status: 'published' } });

    const constrained = await request(mock.baseUrl, '/api/campaigns/cmp-2027-hk1', {
      method: 'PATCH', headers: bearer(exec, { 'content-type': 'application/json' }), body: JSON.stringify({ closesOn: '2027-01-26', positions: [{ ...draft.positions[0], id: positionId, quota: 3 }] }),
    });
    expect(constrained.body.positions[0].quota).toBe(3);
    const invalid = await request(mock.baseUrl, '/api/campaigns/cmp-2027-hk1', {
      method: 'PATCH', headers: bearer(exec, { 'content-type': 'application/json' }), body: JSON.stringify({ slotMinutes: 20 }),
    });
    expect(invalid.response.status).toBe(400);
  });

  it('reviews applications independently and protects CSV, notes, and CV access', async () => {
    mock = await startMock();
    const exec = await login(mock.baseUrl, 'exec');
    const { studentA, studentB } = await seedApplications(mock.baseUrl);
    const list = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/applications?sort=oldest&page=1&pageSize=5', { headers: bearer(exec) });
    expect(list.body).toMatchObject({ total: 3, stats: { campaign: { applications: 3, applicants: 2 } } });
    expect(list.body.items.map((item) => item.id)).toEqual(['A01', 'A02', 'A03']);

    const note = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/applications/A01/private-note', {
      method: 'PATCH', headers: bearer(exec, { 'content-type': 'application/json' }), body: JSON.stringify({ note: 'Ask for an example.' }),
    });
    expect(note.body.privateNote).toBe('Ask for an example.');
    for (const id of ['A01', 'A02']) {
      const decided = await request(mock.baseUrl, `/api/campaigns/cmp-2026-hk1/applications/${id}/screening-decision`, {
        method: 'POST', headers: bearer(exec, { 'content-type': 'application/json' }), body: JSON.stringify({ decision: 'shortlisted' }),
      });
      expect(decided.body.screeningStatus).toBe('shortlisted');
    }
    const exported = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/applications.csv?status=shortlisted&sort=oldest', { headers: bearer(exec) });
    expect(exported.response.headers.get('content-type')).toContain('text/csv');
    expect(exported.body).toContain('A01,Nguyen Minh Anh');
    expect(exported.body).not.toContain('Ask for an example.');

    expect((await request(mock.baseUrl, '/api/applications/A01/cv', { headers: bearer(exec) })).response.headers.get('content-type')).toBe('application/pdf');
    expect((await request(mock.baseUrl, '/api/applications/A01/cv', { headers: bearer(studentA) })).response.status).toBe(200);
    expect((await request(mock.baseUrl, '/api/applications/A01/cv', { headers: bearer(studentB) })).body.code).toBe('CV_FORBIDDEN');
  });
});
