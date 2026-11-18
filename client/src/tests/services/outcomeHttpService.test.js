import { beforeEach, describe, expect, it } from 'vitest';
import { setAuthTokenProvider } from '../../services/apiClient.js';
import * as interviewerService from '../../services/interviewerService.js';
import * as resultService from '../../services/resultService.js';
import { getMockApiState, setMockApiMode, setMockApiScenario } from '../helpers/mockApi.js';

const as = (id) => setAuthTokenProvider(() => `mock-test-token-${id}`);
const interviewIdOf = (applicationId) => getMockApiState().interviews.find((item) => item.applicationId === applicationId).id;

describe('interviewer HTTP adapter (C10)', () => {
  beforeEach(() => {
    setMockApiScenario('confirmed');
    as('iv-hamy');
  });

  it('lists only the caller’s confirmed interviews and maps assessment state', async () => {
    const view = await interviewerService.listAssignedInterviews();
    expect(view.interviews.map((item) => item.applicationId)).toEqual(['CF-026', 'CF-030']);
    expect(view.interviews[0]).toMatchObject({ assessmentStatus: 'submitted', canAssess: false });
    expect(view.interviews[1]).toMatchObject({ assessmentStatus: 'awaiting', canAssess: true, timing: 'completed' });
  });

  it('returns an empty list (not an error) before confirmation and in empty mode', async () => {
    setMockApiScenario('screening');
    await expect(interviewerService.listAssignedInterviews()).resolves.toMatchObject({ scheduleConfirmed: false, interviews: [] });
    setMockApiScenario('confirmed');
    setMockApiMode('empty');
    await expect(interviewerService.listAssignedInterviews()).resolves.toMatchObject({ interviews: [] });
  });

  it('surfaces server errors instead of falling back to fixtures', async () => {
    setMockApiMode('error');
    await expect(interviewerService.listAssignedInterviews()).rejects.toMatchObject({ kind: 'unknown' });
  });

  it('refuses another interviewer’s interview, unknown ids, and the wrong role', async () => {
    as('iv-giahuy');
    await expect(interviewerService.getInterview(interviewIdOf('CF-030'))).rejects.toMatchObject({ kind: 'forbidden', code: 'INTERVIEW_NOT_ASSIGNED' });
    await expect(interviewerService.getInterview('nope')).rejects.toMatchObject({ kind: 'notFound', code: 'INTERVIEW_NOT_FOUND' });
    as('exec-recruitment');
    await expect(interviewerService.listAssignedInterviews()).rejects.toMatchObject({ kind: 'forbidden', code: 'ROLE_FORBIDDEN' });
    setAuthTokenProvider(() => null);
    await expect(interviewerService.listAssignedInterviews()).rejects.toMatchObject({ kind: 'forbidden', code: 'INVALID_TOKEN' });
  });

  it('omits Executive-only notes from interview detail', async () => {
    const detail = await interviewerService.getInterview(interviewIdOf('CF-030'));
    expect(detail).not.toHaveProperty('privateNote');
    expect(detail.cv.downloadPath).toBe('/api/applications/CF-030/cv');
  });

  it('persists exactly one validated assessment', async () => {
    const id = interviewIdOf('CF-030');
    await expect(interviewerService.submitAssessment(id, { notes: '   ' })).rejects.toMatchObject({ kind: 'validation', fieldErrors: { notes: expect.any(String) } });
    await interviewerService.submitAssessment(id, { notes: ' Rõ ràng. ', recommendation: '' });
    expect(getMockApiState().assessments.find((item) => item.interviewId === id)).toMatchObject({ notes: 'Rõ ràng.', recommendation: null });
    await expect(interviewerService.submitAssessment(id, { notes: 'again' })).rejects.toMatchObject({ kind: 'conflict', code: 'ASSESSMENT_ALREADY_SUBMITTED' });
  });
});

describe('final results HTTP adapter (C11)', () => {
  beforeEach(() => {
    setMockApiScenario('confirmed');
    as('exec-recruitment');
  });

  it('joins result rows with the confirmed schedule', async () => {
    const view = await resultService.list();
    const row = view.rows.find((item) => item.applicationId === 'CF-027');
    expect(row).toMatchObject({ publishedAt: null, start: expect.any(String), interviewerName: 'Gia Huy' });
    expect(row.assessmentStatus).toBe(row.assessmentSubmitted ? 'submitted' : 'awaiting');
    expect(view.rows.map((item) => item.applicationId)).not.toContain(view.rejectedIds[0]);
  });

  it('records independently per application and keeps results private until published', async () => {
    await resultService.record('CF-027', 'pass');
    expect(getMockApiState().results.find((item) => item.applicationId === 'CF-027')).toMatchObject({ decision: 'pass', publishedAt: null });
    expect(getMockApiState().notifications.some((item) => item.applicationId === 'CF-027')).toBe(false);
    await expect(resultService.record('CF-027', 'maybe')).rejects.toMatchObject({ kind: 'validation' });
  });

  it('publishes idempotently and locks published results', async () => {
    await resultService.record('CF-027', 'pass');
    await expect(resultService.publishRecorded()).resolves.toEqual({ publishedIds: ['CF-027'] });
    const count = getMockApiState().notifications.length;
    await expect(resultService.publishRecorded()).resolves.toEqual({ publishedIds: [] });
    expect(getMockApiState().notifications).toHaveLength(count);
    await expect(resultService.record('CF-027', 'fail')).rejects.toMatchObject({ kind: 'conflict', code: 'RESULT_ALREADY_PUBLISHED' });
  });

  it('is Executive-only and empty in empty mode', async () => {
    setMockApiMode('empty');
    await expect(resultService.list()).resolves.toMatchObject({ rows: [], rejectedIds: [] });
    as('ap-minhanh');
    await expect(resultService.list()).rejects.toMatchObject({ kind: 'forbidden' });
  });
});
