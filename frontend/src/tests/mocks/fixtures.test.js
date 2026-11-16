import { describe, expect, it } from 'vitest';
import { ACCOUNTS } from '../../mocks/fixtures.js';
import { campaignPhase, evaluateSchedule, submissionWindow } from '../../mocks/derive.js';
import { SCENARIOS, buildScenarioState } from '../../mocks/scenarios.js';
import { formatDateTime } from '../../utils/format.js';

const accountIds = new Set(ACCOUNTS.map((account) => account.id));
const overlaps = (a, b) => new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end);

// specs/001-frontend-ui/data-model.md — consistency invariants, checked for every scenario.
describe.each(SCENARIOS.map((scenario) => scenario.id))('fixtures in scenario "%s"', (scenarioId) => {
  const state = buildScenarioState(scenarioId);
  const applicationIds = new Set(state.applications.map((application) => application.id));

  it('1. every reference resolves to an existing record', () => {
    for (const application of state.applications) {
      expect(accountIds.has(application.applicantId)).toBe(true);
      expect(state.positions.some((position) => position.id === application.positionId)).toBe(true);
      for (const slotId of application.slotIds) {
        expect(state.slots.some((slot) => slot.id === slotId)).toBe(true);
      }
    }
    for (const position of state.positions) {
      expect(state.departments.some((department) => department.id === position.departmentId)).toBe(true);
    }
    for (const interview of state.interviews) {
      expect(applicationIds.has(interview.applicationId)).toBe(true);
      if (interview.interviewerId) {
        expect(accountIds.has(interview.interviewerId)).toBe(true);
      }
      if (interview.roomId) {
        expect(state.rooms.some((room) => room.id === interview.roomId)).toBe(true);
      }
    }
    for (const notification of state.notifications) {
      expect(accountIds.has(notification.accountId)).toBe(true);
      expect(applicationIds.has(notification.applicationId)).toBe(true);
    }
  });

  it('keeps at most one application per applicant and position, and one interview per application', () => {
    const keys = state.applications.map((application) => `${application.applicantId}|${application.positionId}`);
    expect(new Set(keys).size).toBe(keys.length);
    const interviewApps = state.interviews.map((interview) => interview.applicationId);
    expect(new Set(interviewApps).size).toBe(interviewApps.length);
  });

  it('3. never gives a rejected application an interview, assessment, or result', () => {
    const rejected = new Set(
      state.applications.filter((application) => application.screeningStatus === 'rejected').map((a) => a.id),
    );
    expect(state.interviews.filter((interview) => rejected.has(interview.applicationId))).toEqual([]);
    expect(state.results.filter((result) => rejected.has(result.applicationId))).toEqual([]);
  });

  it('4. only records a decision when a submitted assessment exists', () => {
    for (const result of state.results.filter((item) => item.decision)) {
      const interview = state.interviews.find((item) => item.applicationId === result.applicationId);
      expect(state.assessments.some((assessment) => assessment.interviewId === interview?.id)).toBe(true);
    }
  });

  it('5. only notifies about published results', () => {
    for (const notification of state.notifications) {
      const result = state.results.find((item) => item.applicationId === notification.applicationId);
      expect(result?.publishedAt).toBeTruthy();
    }
  });
});

// Team-selected Q-02: instants are UTC ISO 8601; date-only fields are Vietnam calendar days.
describe('date and time convention (Q-02)', () => {
  const UTC_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  it.each(SCENARIOS.map((scenario) => scenario.id))('serializes every instant of scenario "%s" in UTC', (scenarioId) => {
    const state = buildScenarioState(scenarioId);
    const instants = [
      state.now,
      state.campaign.publishedAt,
      state.schedule.savedAt,
      state.schedule.confirmedAt,
      ...state.slots.flatMap((slot) => [slot.start, slot.end]),
      ...state.assignments.flatMap((assignment) => assignment.availability.flatMap((range) => [range.start, range.end])),
      ...state.applications.flatMap((application) => [application.submittedAt, application.reviewedAt]),
      ...state.interviews.flatMap((interview) => [interview.start, interview.end]),
      ...state.assessments.map((assessment) => assessment.submittedAt),
      ...state.results.flatMap((result) => [result.recordedAt, result.publishedAt]),
      ...state.notifications.flatMap((notification) => [notification.createdAt, notification.readAt]),
    ].filter(Boolean);

    expect(instants.length).toBeGreaterThan(0);
    for (const instant of instants) {
      expect(instant).toMatch(UTC_ISO);
    }
  });

  it('keeps the campaign period and interview date as date-only calendar days', () => {
    const { campaign } = buildScenarioState('screening');
    expect([campaign.opensOn, campaign.closesOn, campaign.interviewDate]).toEqual(['2026-10-12', '2026-10-30', '2026-11-05']);
  });

  it('opens at 00:00 on the opening day and closes at 00:00 after the closing day, Vietnam time', () => {
    const window = submissionWindow(buildScenarioState('screening').campaign);
    expect(window).toEqual({ opensAt: '2026-10-11T17:00:00.000Z', closesAt: '2026-10-30T17:00:00.000Z' });
    expect(formatDateTime(window.opensAt)).toBe('12/10/2026, 00:00');
    expect(formatDateTime(window.closesAt)).toBe('31/10/2026, 00:00');
  });

  it('accepts applications while openAt <= now < closeAt (opening inclusive, closing exclusive)', () => {
    const state = buildScenarioState('accepting');
    const phaseAt = (now) => campaignPhase({ ...state, now });

    expect(phaseAt('2026-10-11T16:59:59.999Z')).toBe('before-open');
    expect(phaseAt('2026-10-11T17:00:00.000Z')).toBe('open');
    expect(phaseAt('2026-10-30T16:59:59.999Z')).toBe('open');
    expect(phaseAt('2026-10-30T17:00:00.000Z')).toBe('closed');
    // The same instants written with the Vietnam offset give the same answer.
    expect(phaseAt('2026-10-30T23:59:59+07:00')).toBe('open');
    expect(phaseAt('2026-10-31T00:00:00+07:00')).toBe('closed');
  });
});

describe('scenario specifics', () => {
  it('6. screening: 6 applications from 5 distinct applicants; CF-026 and CF-027 belong to Nguyễn Minh Anh', () => {
    const state = buildScenarioState('screening');
    expect(state.applications).toHaveLength(6);
    expect(new Set(state.applications.map((application) => application.applicantId)).size).toBe(5);
    const minhAnh = state.applications.filter((application) => application.applicantId === 'ap-minhanh');
    expect(minhAnh.map((application) => application.id)).toEqual(['CF-026', 'CF-027']);
    expect(new Set(minhAnh.map((application) => application.positionId)).size).toBe(2);
  });

  it('screening: the draft shows the reference statuses (2 Conflict, 1 Proposed, 1 Unassigned)', () => {
    const { summary, rows } = evaluateSchedule(buildScenarioState('screening'));
    expect(summary).toMatchObject({ shortlisted: 4, proposed: 1, conflict: 2, unassigned: 1 });
    expect(rows.find((row) => row.applicationId === 'CF-026').reasons).toContain('Chồng giờ với CF-027 của cùng ứng viên.');
  });

  it('2. confirmed: no applicant, interviewer, or room has overlapping interviews', () => {
    const state = buildScenarioState('confirmed');
    const placed = state.interviews.map((interview) => ({
      ...interview,
      applicantId: state.applications.find((application) => application.id === interview.applicationId).applicantId,
    }));
    for (const a of placed) {
      for (const b of placed) {
        if (a.id >= b.id || !overlaps(a, b)) {
          continue;
        }
        expect(a.applicantId).not.toBe(b.applicantId);
        expect(a.interviewerId).not.toBe(b.interviewerId);
        expect(a.roomId).not.toBe(b.roomId);
      }
    }
    expect(evaluateSchedule(state).summary).toMatchObject({ shortlisted: 4, confirmed: 4 });
  });

  it('confirmed: CF-026 Pass is published, CF-027 Fail is not, CF-030/CF-031 have no decision', () => {
    const state = buildScenarioState('confirmed');
    const result = (id) => state.results.find((item) => item.applicationId === id);
    expect(result('CF-026')).toMatchObject({ decision: 'pass' });
    expect(result('CF-026').publishedAt).toBeTruthy();
    expect(result('CF-027')).toMatchObject({ decision: 'fail', publishedAt: null });
    expect(result('CF-030')).toBeUndefined();
    expect(result('CF-031')).toBeUndefined();
  });

  it('uses a fixed demo clock per scenario, independent of the real date', () => {
    // 09:00 and 13:00 in Vietnam (UTC+7), serialized in UTC.
    expect(buildScenarioState('accepting').now).toBe('2026-10-20T02:00:00.000Z');
    expect(buildScenarioState('confirmed').now).toBe('2026-11-05T06:00:00.000Z');
    expect(formatDateTime(buildScenarioState('accepting').now)).toBe('20/10/2026, 09:00');
    expect(formatDateTime(buildScenarioState('confirmed').now)).toBe('05/11/2026, 13:00');
  });

  it('builds independent copies, so demo mutations never leak into fixtures', () => {
    const first = buildScenarioState('screening');
    first.applications[0].screeningStatus = 'rejected';
    expect(buildScenarioState('screening').applications[0].screeningStatus).toBe('shortlisted');
  });
});
