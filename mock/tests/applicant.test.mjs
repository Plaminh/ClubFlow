import { afterEach, describe, expect, it } from 'vitest';
import { applicationForm, bearer, login, request, startMock, submitApplication } from './helpers.mjs';

describe('public and applicant HTTP contract', () => {
  let mock;
  afterEach(async () => mock?.close());

  it('returns the public campaign and creates independent A01/A02 applications', async () => {
    mock = await startMock();
    const current = await request(mock.baseUrl, '/api/campaigns/current');
    expect(current.body).toMatchObject({ phase: 'open', acceptingApplications: true });
    expect(current.body.positions).toHaveLength(2);

    const studentA = await login(mock.baseUrl, 'studentA');
    const first = await submitApplication(mock.baseUrl, studentA, 'pos-content');
    const second = await submitApplication(mock.baseUrl, studentA, 'pos-comms');
    expect(first.response.status).toBe(201);
    expect(first.body.id).toBe('A01');
    expect(second.body.id).toBe('A02');

    const duplicate = await submitApplication(mock.baseUrl, studentA, 'pos-content');
    expect(duplicate.response.status).toBe(409);
    expect(duplicate.body).toMatchObject({ code: 'DUPLICATE_APPLICATION', details: { existingApplicationId: 'A01' } });

    const own = await request(mock.baseUrl, '/api/me/applications?campaignId=cmp-2026-hk1', { headers: bearer(studentA) });
    expect(own.body.items.map((item) => item.id)).toEqual(['A01', 'A02']);
    expect(own.body.items.every((item) => !Object.hasOwn(item, 'privateNote'))).toBe(true);
  });

  it('validates multipart limits, role, closed state, and ownership isolation', async () => {
    mock = await startMock();
    const studentA = await login(mock.baseUrl, 'studentA');
    const studentB = await login(mock.baseUrl, 'studentB');
    const invalidForm = applicationForm({ positionId: 'pos-content', student: 'A' });
    invalidForm.set('sop', '');
    invalidForm.set('cv', new Blob(['not a pdf'], { type: 'text/plain' }), 'cv.txt');
    const invalid = await request(mock.baseUrl, '/api/applications', { method: 'POST', headers: bearer(studentA), body: invalidForm });
    expect(invalid.response.status).toBe(400);
    expect(invalid.body.fieldErrors).toEqual(expect.objectContaining({ sop: expect.any(String), cv: expect.any(String) }));

    await submitApplication(mock.baseUrl, studentA, 'pos-content');
    const other = await request(mock.baseUrl, '/api/me/applications', { headers: bearer(studentB) });
    expect(other.body.items).toEqual([]);

    const exec = await login(mock.baseUrl, 'exec');
    await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/close-applications', { method: 'POST', headers: bearer(exec) });
    const closed = await submitApplication(mock.baseUrl, studentB, 'pos-comms', 'B');
    expect(closed.body.code).toBe('APPLICATIONS_CLOSED');
    const forbidden = await submitApplication(mock.baseUrl, exec, 'pos-comms');
    expect(forbidden.body.code).toBe('ROLE_FORBIDDEN');
  });
});
