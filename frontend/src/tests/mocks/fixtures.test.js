import { describe, expect, it } from 'vitest';
import { ACCOUNTS } from '../../mocks/fixtures.js';
import { evaluateSchedule } from '../../mocks/derive.js';
import { SCENARIOS, buildScenarioState } from '../../mocks/scenarios.js';

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
    expect(buildScenarioState('accepting').now).toBe('2026-10-20T09:00:00+07:00');
    expect(buildScenarioState('confirmed').now).toBe('2026-11-05T13:00:00+07:00');
  });

  it('builds independent copies, so demo mutations never leak into fixtures', () => {
    const first = buildScenarioState('screening');
    first.applications[0].screeningStatus = 'rejected';
    expect(buildScenarioState('screening').applications[0].screeningStatus).toBe('shortlisted');
  });
});
