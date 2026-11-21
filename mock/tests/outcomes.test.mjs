import { afterEach, describe, expect, it } from 'vitest';
import { bearer, login, prepareConfirmedSchedule, request, startMock } from './helpers.mjs';

describe('interviewer, result, and notification HTTP contract', () => {
  let mock;
  afterEach(async () => mock?.close());

  it('scopes assignments, keeps assessments immutable, and publishes unique notifications', async () => {
    mock = await startMock();
    const { exec, studentA, studentB } = await prepareConfirmedSchedule(mock.baseUrl);
    const content = await login(mock.baseUrl, 'int-content');
    const comms = await login(mock.baseUrl, 'int-comms');
    const assigned = await request(mock.baseUrl, '/api/me/interviews?campaignId=cmp-2026-hk1', {
      headers: bearer(content),
    });
    expect(assigned.body.interviews.map((item) => item.applicationId)).toEqual(['A01']);
    expect(
      (await request(mock.baseUrl, '/api/interviews/int-A02', { headers: bearer(content) })).body
        .code,
    ).toBe('INTERVIEW_NOT_ASSIGNED');
    expect(
      (await request(mock.baseUrl, '/api/interviews/int-A01', { headers: bearer(content) })).body,
    ).not.toHaveProperty('privateNote');

    const submit = (token, id, recommendation) =>
      request(mock.baseUrl, `/api/interviews/int-${id}/assessment`, {
        method: 'POST',
        headers: bearer(token, { 'content-type': 'application/json' }),
        body: JSON.stringify({ notes: `Assessment notes for ${id}.`, recommendation }),
      });
    expect((await submit(content, 'A01', 'pass')).response.status).toBe(201);
    expect((await submit(comms, 'A02', 'fail')).response.status).toBe(201);
    expect((await submit(content, 'A01', 'fail')).body.code).toBe('ASSESSMENT_ALREADY_SUBMITTED');

    for (const [id, decision] of [
      ['A01', 'pass'],
      ['A02', 'fail'],
    ]) {
      const result = await request(
        mock.baseUrl,
        `/api/campaigns/cmp-2026-hk1/applications/${id}/final-result`,
        {
          method: 'PUT',
          headers: bearer(exec, { 'content-type': 'application/json' }),
          body: JSON.stringify({ decision }),
        },
      );
      expect(result.body).toMatchObject({ applicationId: id, decision, publishedAt: null });
    }
    const publish = await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/results/publish', {
      method: 'POST',
      headers: bearer(exec),
    });
    expect(publish.body.publishedIds).toEqual(['A01', 'A02']);
    expect(
      (
        await request(mock.baseUrl, '/api/campaigns/cmp-2026-hk1/results/publish', {
          method: 'POST',
          headers: bearer(exec),
        })
      ).body.publishedIds,
    ).toEqual([]);

    const notifications = await request(mock.baseUrl, '/api/me/notifications', {
      headers: bearer(studentA),
    });
    expect(notifications.body).toMatchObject({ unreadCount: 2 });
    expect(notifications.body.items.map((item) => item.applicationId).sort()).toEqual([
      'A01',
      'A02',
    ]);
    expect(
      (await request(mock.baseUrl, '/api/me/notifications', { headers: bearer(studentB) })).body
        .items,
    ).toEqual([]);
    await request(mock.baseUrl, '/api/me/notifications', {
      method: 'PATCH',
      headers: bearer(studentA),
    });
    expect(
      (await request(mock.baseUrl, '/api/me/notifications', { headers: bearer(studentA) })).body
        .unreadCount,
    ).toBe(0);
  });
});
