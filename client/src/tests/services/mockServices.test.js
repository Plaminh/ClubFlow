import { describe, expect, it } from 'vitest';
import * as applicationService from '../../services/applicationService.js';
import * as demoSessionService from '../../services/demoSessionService.js';
import * as interviewerService from '../../services/interviewerService.js';
import * as portalService from '../../services/portalService.js';
import * as resultService from '../../services/resultService.js';
import * as scheduleService from '../../services/scheduleService.js';
import { getState, setSimulation } from '../../mocks/store.js';

const asExecutive = () => demoSessionService.signIn('exec-recruitment');

function pdf(name = 'cv.pdf', size = 1024) {
  return new File([new Uint8Array(size)], name, { type: 'application/pdf' });
}

function applicationForm(fields) {
  const form = new FormData();
  form.set('positionId', fields.positionId ?? 'pos-ux');
  form.set('email', fields.email ?? 'hai.dang@demo.example');
  form.set('faculty', fields.faculty ?? 'Thiết kế');
  form.set('sop', fields.sop ?? 'Em muốn tham gia câu lạc bộ.');
  for (const slot of fields.slotIds ?? ['slot-0900']) {
    form.append('slotIds', slot);
  }
  if (fields.cv !== null) {
    form.set('cv', fields.cv ?? pdf());
  }
  return form;
}

describe('demo session and scenarios', () => {
  it('reset restores the scenario fixtures after demo changes', async () => {
    await asExecutive();
    await applicationService.setScreening('CF-028', 'rejected');
    demoSessionService.resetDemoData();
    expect((await applicationService.get('CF-028')).screeningStatus).toBe('pendingReview');
  });

  it('simulated network errors reject with a network UiError', async () => {
    await asExecutive();
    setSimulation('error');
    await expect(applicationService.list()).rejects.toMatchObject({ name: 'UiError', kind: 'network' });
  });

  it('cancels a mutation when the scenario or account changes while it is in flight', async () => {
    await asExecutive();
    const pendingNote = applicationService.saveNote('CF-028', 'Ghi chú cũ');
    demoSessionService.resetDemoData();
    await expect(pendingNote).rejects.toMatchObject({ kind: 'conflict' });
    expect((await applicationService.get('CF-028')).privateNote).toBe('');

    const pendingDecision = applicationService.setScreening('CF-028', 'rejected');
    await demoSessionService.signOut();
    await expect(pendingDecision).rejects.toMatchObject({ kind: 'conflict' });
    await asExecutive();
    expect((await applicationService.get('CF-028')).screeningStatus).toBe('pendingReview');
  });

  it('rejects calls from the wrong demo role', async () => {
    await demoSessionService.signIn('ap-minhanh');
    await expect(applicationService.list()).rejects.toMatchObject({ kind: 'forbidden' });
  });
});

describe('application review', () => {
  it('counts applications and distinct applicants separately, campaign-wide and filtered (BR-06)', async () => {
    await asExecutive();
    const stats = await applicationService.getStats({ positionId: 'pos-ux' });
    expect(stats.campaign).toMatchObject({ applications: 6, applicants: 5, pendingReview: 1, shortlisted: 4, rejected: 1 });
    expect(stats.filtered).toMatchObject({ applications: 3, applicants: 3 });
    expect(stats.isFiltered).toBe(true);
  });

  it('searches without diacritics, filters, sorts, and paginates', async () => {
    await asExecutive();
    expect((await applicationService.list({ search: 'nguyen minh' })).items.map((item) => item.id)).toEqual([
      'CF-027',
      'CF-026',
    ]);
    const page1 = await applicationService.list({ sort: 'oldest', pageSize: 5 });
    expect(page1).toMatchObject({ total: 6, page: 1, pageCount: 2 });
    expect(page1.items[0].id).toBe('CF-026');
    expect((await applicationService.list({ sort: 'oldest', page: 2 })).items.map((item) => item.id)).toEqual(['CF-031']);
  });

  it('decides only the selected application and blocks re-deciding (BR-07)', async () => {
    await asExecutive();
    await applicationService.setScreening('CF-028', 'shortlisted');
    expect((await applicationService.get('CF-028')).screeningStatus).toBe('shortlisted');
    expect((await applicationService.get('CF-027')).screeningStatus).toBe('shortlisted');
    await expect(applicationService.setScreening('CF-028', 'rejected')).rejects.toMatchObject({ kind: 'conflict' });
  });

  it('exports the current filter without private notes (BR-09)', async () => {
    await asExecutive();
    const csv = await applicationService.exportCsv({ status: 'shortlisted' });
    expect(csv.rowCount).toBe(4);
    expect(csv.content).toContain('CF-026');
    expect(csv.content).not.toContain('CF-028');
    expect(csv.content).not.toContain('kinh nghiệm nghiên cứu');
  });
});

describe('scheduling', () => {
  it('keeps the demo scheduling inputs in the deterministic Q-01 order without implementing a generator', async () => {
    await asExecutive();
    const state = getState();
    const cf030 = state.applications.find((application) => application.id === 'CF-030');
    const cf031 = state.applications.find((application) => application.id === 'CF-031');
    cf031.submittedAt = cf030.submittedAt;
    state.applications.reverse();
    state.assignments.reverse();
    state.rooms.reverse();

    const schedule = await scheduleService.generateDraft();

    // Submission time is primary; CF-030 wins the artificial tie by ID.
    expect(schedule.rows.map((row) => row.applicationId)).toEqual(['CF-026', 'CF-027', 'CF-030', 'CF-031']);
    expect(schedule.sessionStarts).toEqual([...schedule.sessionStarts].sort());
    expect(schedule.assignments.map((assignment) => assignment.interviewerId)).toEqual(['iv-giahuy', 'iv-hamy']);
    expect(schedule.rooms.map((room) => room.id)).toEqual(['room-a201', 'room-b105']);
  });

  it('blocks confirmation with the unmet conditions, then confirms once resolved (BR-13)', async () => {
    await asExecutive();
    await expect(scheduleService.confirm()).rejects.toMatchObject({ kind: 'conflict' });

    await applicationService.setScreening('CF-028', 'rejected');
    await scheduleService.updateRow('CF-027', { start: '2026-11-05T09:15:00+07:00', interviewerId: 'iv-giahuy', roomId: 'room-b105' });
    let schedule = await scheduleService.updateRow('CF-031', {
      start: '2026-11-05T09:00:00+07:00',
      interviewerId: 'iv-giahuy',
      roomId: 'room-b105',
    });
    expect(schedule.summary).toMatchObject({ proposed: 4, conflict: 0, unassigned: 0 });
    expect(schedule.canConfirm).toBe(true);

    schedule = await scheduleService.confirm();
    expect(schedule.status).toBe('confirmed');
    expect(schedule.rows.every((row) => row.status === 'confirmed')).toBe(true);
  });

  it('flags a manual edit that double-books a room as Conflict', async () => {
    await asExecutive();
    const schedule = await scheduleService.updateRow('CF-031', {
      start: '2026-11-05T09:15:00+07:00',
      interviewerId: 'iv-giahuy',
      roomId: 'room-a201',
    });
    const row = schedule.rows.find((item) => item.applicationId === 'CF-031');
    expect(row.status).toBe('conflict');
    expect(row.reasons.join(' ')).toContain('cùng phòng A-201');
  });

  it('matches an edited start by instant and stores it in UTC, whatever offset the client sent (Q-02)', async () => {
    await asExecutive();
    const viaOffset = await scheduleService.updateRow('CF-031', {
      start: '2026-11-05T09:30:00+07:00',
      interviewerId: 'iv-giahuy',
      roomId: 'room-b105',
    });
    expect(viaOffset.rows.find((item) => item.applicationId === 'CF-031')).toMatchObject({
      start: '2026-11-05T02:30:00.000Z',
      end: '2026-11-05T02:45:00.000Z',
      status: 'proposed',
    });

    // 12:00 in Vietnam is outside the 09:00–12:00 window (the last session starts at 11:45).
    await expect(
      scheduleService.updateRow('CF-031', { start: '2026-11-05T05:00:00.000Z', interviewerId: 'iv-giahuy', roomId: 'room-b105' }),
    ).rejects.toMatchObject({ kind: 'validation', fieldErrors: { start: expect.any(String) } });
  });

  it('keeps the campaign interview configuration out of the scheduling settings; rooms stay editable (Q-03)', async () => {
    await asExecutive();
    await expect(scheduleService.updateSettings({ slotMinutes: 30 })).rejects.toMatchObject({ kind: 'forbidden' });
    await expect(scheduleService.updateSettings({ roomIds: [] })).rejects.toMatchObject({ kind: 'validation' });
    const before = await scheduleService.getSchedule();
    expect(before.settings.slotMinutes).toBe(15);
    expect(before.rows.find((row) => row.applicationId === 'CF-026')).toMatchObject({ end: '2026-11-05T02:15:00.000Z' });

    const schedule = await scheduleService.updateSettings({ roomIds: ['room-a201'] });
    expect(schedule.settings.roomIds).toEqual(['room-a201']);
    expect(schedule.hasUnsavedChanges).toBe(true);
    expect(schedule.rows.find((row) => row.applicationId === 'CF-027').reasons).toContain(
      'Phòng không nằm trong danh sách phòng đã chọn.',
    );
  });

  it('locks screening, schedule, and campaign configuration after confirmation (BR-14)', async () => {
    demoSessionService.setScenario('confirmed');
    await asExecutive();
    await expect(scheduleService.generateDraft()).rejects.toMatchObject({ kind: 'forbidden' });
    await expect(applicationService.setScreening('CF-028', 'shortlisted')).rejects.toMatchObject({ kind: 'forbidden' });
    await expect(scheduleService.updateSettings({ roomIds: ['room-a201'] })).rejects.toMatchObject({ kind: 'forbidden' });
    await expect(
      scheduleService.updateRow('CF-026', { start: '2026-11-05T02:30:00.000Z', interviewerId: 'iv-hamy', roomId: 'room-a201' }),
    ).rejects.toMatchObject({ kind: 'forbidden' });
    await expect(scheduleService.confirm()).rejects.toMatchObject({ kind: 'forbidden' });
  });

  it('gives interviewers campaign context from their assignment list', async () => {
    await demoSessionService.signIn('iv-hamy');
    expect(await interviewerService.listAssignedInterviews()).toMatchObject({
      campaignName: expect.any(String),
      interviewDate: expect.any(String),
    });
  });
});

describe('applicant portal', () => {
  it('hides draft campaigns from the public (BR-02)', async () => {
    demoSessionService.setScenario('draft');
    expect((await portalService.getPublicCampaign()).campaign).toBeNull();
  });

  it('accepts a valid submission, rejects duplicates and invalid files (BR-03, BR-05)', async () => {
    demoSessionService.setScenario('accepting');
    await demoSessionService.signIn('ap-haidang');

    const created = await portalService.submitApplication(applicationForm({}));
    expect(created).toMatchObject({ id: 'CF-032', screeningStatus: 'pendingReview' });

    await expect(portalService.submitApplication(applicationForm({}))).rejects.toMatchObject({
      kind: 'conflict',
      details: { existingApplicationId: 'CF-032' },
    });
    const boundary = await portalService.submitApplication(
      applicationForm({ positionId: 'pos-content', cv: pdf('cv.pdf', 5 * 1024 * 1024) }),
    );
    expect(boundary).toMatchObject({ id: 'CF-033', screeningStatus: 'pendingReview' });
    await expect(
      portalService.submitApplication(applicationForm({ positionId: 'pos-content', cv: pdf('another.pdf', 6 * 1024 * 1024) })),
    ).rejects.toMatchObject({ kind: 'validation', fieldErrors: { cv: 'CV tối đa 5 MB; tệp hiện tại 6,0 MB.' } });
    expect(await portalService.listMyApplications()).toHaveLength(2);
  });

  it('shows reviewers and interviewers the email and faculty submitted with the application', async () => {
    demoSessionService.setScenario('accepting');
    await demoSessionService.signIn('ap-haidang');
    const created = await portalService.submitApplication(
      applicationForm({ email: 'dang.moi@demo.example', faculty: 'Truyền thông' }),
    );

    await asExecutive();
    const detail = await applicationService.get(created.id);
    expect(detail.student).toMatchObject({ email: 'dang.moi@demo.example', faculty: 'Truyền thông' });
    const csv = await applicationService.exportCsv({});
    expect(csv.content).toContain('dang.moi@demo.example');
  });

  it('requires a faculty on submission', async () => {
    demoSessionService.setScenario('accepting');
    await demoSessionService.signIn('ap-haidang');
    await expect(portalService.submitApplication(applicationForm({ faculty: ' ' }))).rejects.toMatchObject({
      kind: 'validation',
      fieldErrors: { faculty: 'Vui lòng chọn khoa.' },
    });
  });

  it('rejects submissions outside the window (BR-02)', async () => {
    await demoSessionService.signIn('ap-haidang');
    await expect(portalService.submitApplication(applicationForm({}))).rejects.toMatchObject({ kind: 'validation' });
  });

  it('accepts at the opening instant and until just before 00:00 after the closing day, Vietnam time (Q-02)', async () => {
    demoSessionService.setScenario('accepting');
    await demoSessionService.signIn('ap-haidang');
    const submitAt = (now, positionId) => {
      getState().now = now;
      return portalService.submitApplication(applicationForm({ positionId }));
    };

    // 12/10/2026 00:00 and 30/10/2026 23:59:59.999 in Vietnam.
    await expect(submitAt('2026-10-11T17:00:00.000Z', 'pos-ux')).resolves.toMatchObject({
      submittedAt: '2026-10-11T17:00:00.000Z',
    });
    await expect(submitAt('2026-10-30T16:59:59.999Z', 'pos-content')).resolves.toMatchObject({ id: 'CF-033' });

    await demoSessionService.signIn('ap-khanhlinh');
    // 31/10/2026 00:00 in Vietnam: the closing instant itself is already too late.
    await expect(submitAt('2026-10-30T17:00:00.000Z', 'pos-ux')).rejects.toMatchObject({ kind: 'validation' });
    // 11/10/2026 23:59:59.999 in Vietnam: one millisecond before opening.
    await expect(submitAt('2026-10-11T16:59:59.999Z', 'pos-ux')).rejects.toMatchObject({ kind: 'validation' });
  });

  it('never shows unconfirmed interviews or unpublished results to the applicant (BR-08)', async () => {
    await demoSessionService.signIn('ap-minhanh');
    let mine = await portalService.listMyApplications();
    expect(mine.every((application) => application.interview === null && application.result === null)).toBe(true);

    demoSessionService.setScenario('confirmed');
    await demoSessionService.signIn('ap-minhanh');
    mine = await portalService.listMyApplications();
    expect(mine.find((application) => application.id === 'CF-026').result).toMatchObject({ decision: 'pass' });
    expect(mine.find((application) => application.id === 'CF-027').result).toBeNull();
    expect(mine.find((application) => application.id === 'CF-027').interview).toMatchObject({ roomName: 'B-105' });
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
    const [notification] = await portalService.listNotifications();
    expect(notification.message).toContain('CF-030');
  });

  it('publishes each result and creates its in-app notification only once (Q-05)', async () => {
    demoSessionService.setScenario('confirmed');
    await asExecutive();

    expect(await resultService.publishRecorded()).toEqual({ publishedIds: ['CF-027'] });
    await expect(resultService.publishRecorded()).rejects.toMatchObject({ kind: 'conflict' });

    await demoSessionService.signIn('ap-minhanh');
    const notifications = await portalService.listNotifications();
    expect(notifications.filter((notification) => notification.applicationId === 'CF-027')).toHaveLength(1);
  });
});
