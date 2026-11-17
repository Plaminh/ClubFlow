/*
 * Demo scenarios: named workflow phases with a FIXED demo clock, because the
 * reference campaign dates (Oct–Nov 2026) must not depend on today's date.
 * Each scenario is derived from the base fixtures so records stay consistent.
 */
import { ACCOUNTS, BASE, at } from './fixtures.js';

export const SCENARIOS = Object.freeze([
  {
    id: 'draft',
    label: 'Chiến dịch còn là bản nháp',
    now: at('2026-10-05', '09:00'),
  },
  {
    id: 'before-open',
    label: 'Đã công bố, chưa mở đơn',
    now: at('2026-10-10', '09:00'),
  },
  {
    id: 'accepting',
    label: 'Đang nhận hồ sơ',
    now: at('2026-10-20', '09:00'),
  },
  {
    id: 'screening',
    label: 'Đã đóng đơn · duyệt hồ sơ và xếp lịch',
    now: at('2026-10-31', '09:00'),
  },
  {
    id: 'confirmed',
    label: 'Lịch đã xác nhận · sau phỏng vấn',
    now: at('2026-11-05', '13:00'),
  },
]);

export const DEFAULT_SCENARIO_ID = 'screening';

const MINUTE_MS = 60 * 1000;

/** End time of an interview that starts at `start` and lasts `minutes`. */
export function addMinutes(isoStart, minutes) {
  if (!isoStart) {
    return null;
  }
  return new Date(new Date(isoStart).getTime() + minutes * MINUTE_MS).toISOString();
}

function withEnd(interviews, minutes) {
  return interviews.map((item) => ({
    note: '',
    ...item,
    end: addMinutes(item.start, minutes),
  }));
}

/**
 * Student details as submitted with the application (data-model `studentInfo`).
 * Fixture applications were "submitted" with the account's profile values.
 */
export function studentInfoSnapshot(account, overrides = {}) {
  return {
    name: account?.displayName ?? '—',
    studentId: account?.studentId ?? '—',
    email: account?.email ?? '—',
    faculty: account?.faculty ?? '—',
    year: account?.year ?? '—',
    ...overrides,
  };
}

function withStudentInfo(application) {
  const account = ACCOUNTS.find((item) => item.id === application.applicantId);
  return { ...application, studentInfo: studentInfoSnapshot(account) };
}

function baseState(scenario) {
  const base = structuredClone(BASE);
  return {
    scenarioId: scenario.id,
    now: scenario.now,
    profiles: structuredClone(ACCOUNTS),
    campaign: base.campaign,
    departments: base.departments,
    positions: base.positions,
    slots: base.slots,
    rooms: base.rooms,
    assignments: base.assignments,
    applications: base.applications.map(withStudentInfo),
    interviews: [],
    schedule: {
      status: 'none',
      confirmedAt: null,
      savedAt: null,
      dirty: false,
      roomIds: base.rooms.map((room) => room.id),
    },
    assessments: [],
    results: [],
    notifications: [],
  };
}

/** Builds a fresh, independent state for the given scenario id. */
export function buildScenarioState(scenarioId) {
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS.find((item) => item.id === DEFAULT_SCENARIO_ID);
  const state = baseState(scenario);
  const minutes = state.campaign.slotMinutes;

  switch (scenario.id) {
    case 'draft':
      state.campaign.status = 'draft';
      state.campaign.publishedAt = null;
      state.applications = [];
      break;
    case 'before-open':
      state.applications = [];
      break;
    case 'accepting':
      state.applications = state.applications
        .filter((application) => new Date(application.submittedAt) <= new Date(scenario.now))
        .map((application) => ({ ...application, screeningStatus: 'pendingReview', reviewedAt: null, privateNote: '' }));
      break;
    case 'screening':
      state.interviews = withEnd(BASE.draftInterviews, minutes);
      state.schedule.status = 'draft';
      state.schedule.savedAt = at('2026-10-31', '08:50');
      break;
    case 'confirmed': {
      state.applications = state.applications.map((application) =>
        application.id === 'CF-028'
          ? { ...application, screeningStatus: 'rejected', reviewedAt: at('2026-10-31', '10:00') }
          : application,
      );
      state.interviews = withEnd(BASE.confirmedInterviews, minutes);
      state.schedule.status = 'confirmed';
      state.schedule.confirmedAt = at('2026-11-01', '10:00');
      state.schedule.savedAt = state.schedule.confirmedAt;
      state.assessments = structuredClone(BASE.confirmedAssessments);
      state.results = structuredClone(BASE.confirmedResults);
      state.notifications = structuredClone(BASE.confirmedNotifications);
      break;
    }
    default:
      break;
  }

  return state;
}
