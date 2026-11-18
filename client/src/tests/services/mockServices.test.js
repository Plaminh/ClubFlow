import { describe, expect, it } from 'vitest';
import * as demoSessionService from '../../services/demoSessionService.js';
import * as interviewerService from '../../services/interviewerService.js';
import * as resultService from '../../services/resultService.js';
import { getState } from '../../mocks/store.js';

const asExecutive = () => demoSessionService.signIn('exec-recruitment');


describe('interviewer context', () => {
  it('gives interviewers campaign context from their assignment list', async () => {
    await demoSessionService.signIn('iv-hamy');
    expect(await interviewerService.listAssignedInterviews()).toMatchObject({
      campaignName: expect.any(String),
      interviewDate: expect.any(String),
    });
  });
});

describe('assessments and results', () => {
  it('requires notes, keeps the recommendation optional, and accepts only Pass or Fail for it (Q-04)', async () => {
    demoSessionService.setScenario('confirmed');
    await demoSessionService.signIn('iv-giahuy');

    await expect(interviewerService.submitAssessment('iv-031', { recommendation: 'pass', notes: '   ' })).rejects.toMatchObject({
      kind: 'validation',
      fieldErrors: { notes: 'Vui lòng nhập nhận xét phỏng vấn.' },
    });
    await expect(
      interviewerService.submitAssessment('iv-031', { recommendation: 'recommend', notes: 'Ổn.' }),
    ).rejects.toMatchObject({ kind: 'validation', fieldErrors: { recommendation: expect.any(String) } });
    // Only the assigned interviewer may submit: iv-030 belongs to Hà My.
    await expect(interviewerService.submitAssessment('iv-030', { notes: 'Không phải buổi của tôi.' })).rejects.toMatchObject({
      kind: 'forbidden',
    });

    const saved = await interviewerService.submitAssessment('iv-031', { notes: '  Chủ động, có ý tưởng video.  ' });
    expect(saved).toMatchObject({ interviewId: 'iv-031', interviewerId: 'iv-giahuy', recommendation: null, notes: 'Chủ động, có ý tưởng video.' });
    expect(Object.keys(saved).sort()).toEqual(['id', 'interviewId', 'interviewerId', 'notes', 'recommendation', 'submittedAt']);
  });

  it('refuses an assessment before the interview has taken place (Q-04)', async () => {
    demoSessionService.setScenario('confirmed');
    await demoSessionService.signIn('iv-giahuy');
    // 05/11/2026 09:10 in Vietnam: the 09:00–09:15 interview of CF-031 is still running.
    getState().now = '2026-11-05T02:10:00.000Z';

    await expect(interviewerService.submitAssessment('iv-031', { notes: 'Quá sớm.' })).rejects.toMatchObject({ kind: 'conflict' });
    expect((await interviewerService.getInterview('iv-031')).canAssess).toBe(false);
  });

  it('lets the assigned interviewer submit one assessment, then the Executive records and publishes', async () => {
    demoSessionService.setScenario('confirmed');
    await demoSessionService.signIn('iv-hamy');
    const { interviews } = await interviewerService.listAssignedInterviews();
    expect(interviews.map((item) => item.applicationId)).toEqual(['CF-026', 'CF-030']);
    const detail = await interviewerService.getInterview('iv-030');
    expect(detail).not.toHaveProperty('privateNote');
    await expect(interviewerService.getInterview('iv-027')).rejects.toMatchObject({ kind: 'forbidden' });

    // The interviewer recommends Fail; the Executive is free to record Pass (Q-04).
    await interviewerService.submitAssessment('iv-030', { recommendation: 'fail', notes: 'Tốt.' });
    await expect(
      interviewerService.submitAssessment('iv-030', { recommendation: 'pass', notes: 'Lần hai.' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    expect((await interviewerService.getInterview('iv-030')).assessment).toMatchObject({ recommendation: 'fail', notes: 'Tốt.' });

    await asExecutive();
    // Submitting an assessment never creates a final decision by itself.
    expect((await resultService.list()).rows.find((row) => row.applicationId === 'CF-030')).toMatchObject({
      assessmentStatus: 'submitted',
      decision: null,
      publishedAt: null,
    });
    await expect(resultService.record('CF-031', 'pass')).rejects.toMatchObject({ kind: 'conflict' });
    expect(await resultService.record('CF-030', 'pass')).toMatchObject({ decision: 'pass' });
    expect((await resultService.getAssessment('CF-030')).recommendation).toBe('fail');
    const { publishedIds } = await resultService.publishRecorded();
    expect(publishedIds.sort()).toEqual(['CF-027', 'CF-030']);

    await demoSessionService.signIn('ap-quocbao');
    const [notification] = getState().notifications.filter((item) => item.accountId === 'ap-quocbao');
    expect(notification.message).toContain('CF-030');
  });

  it('publishes each result and creates its in-app notification only once (Q-05)', async () => {
    demoSessionService.setScenario('confirmed');
    await asExecutive();

    expect(await resultService.publishRecorded()).toEqual({ publishedIds: ['CF-027'] });
    await expect(resultService.publishRecorded()).rejects.toMatchObject({ kind: 'conflict' });

    await demoSessionService.signIn('ap-minhanh');
    const notifications = getState().notifications.filter((item) => item.accountId === 'ap-minhanh');
    expect(notifications.filter((notification) => notification.applicationId === 'CF-027')).toHaveLength(1);
  });
});
