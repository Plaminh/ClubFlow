/*
 * Interview scheduling service (Executive). Demo implementation.
 *
 * "Generate draft" returns the verified reference draft (no first-fit
 * algorithm in the frontend). Statuses are re-evaluated by the mock layer so
 * the demo stays consistent; the backend must enforce BR-10…BR-14.
 */
import { accountName, evaluateSchedule, isScheduleConfirmed, positionById, sessionStarts, toMs } from '../mocks/derive.js';
import { BASE } from '../mocks/fixtures.js';
import { assertNotLockedBySchedule, requireRole } from '../mocks/guards.js';
import { addMinutes } from '../mocks/scenarios.js';
import { clone, getState, mockRequest } from '../mocks/store.js';
import { formatTimeRange } from '../utils/format.js';
import { getLabel, SCHEDULE_STATUS_LABELS } from '../constants/labels.js';
import { toCsv } from '../utils/csv.js';
import { createUiError } from './uiError.js';

function scheduleView(state) {
  const evaluation = evaluateSchedule(state);
  return {
    status: state.schedule.status,
    confirmedAt: state.schedule.confirmedAt,
    savedAt: state.schedule.savedAt,
    hasUnsavedChanges: Boolean(state.schedule.dirty),
    settings: {
      interviewDate: state.campaign.interviewDate,
      interviewWindow: state.campaign.interviewWindow,
      slotMinutes: state.campaign.slotMinutes,
      roomIds: state.schedule.roomIds,
    },
    rooms: state.rooms,
    assignments: state.assignments.map((assignment) => ({
      interviewerId: assignment.interviewerId,
      interviewerName: accountName(assignment.interviewerId),
      positionIds: assignment.positionIds,
      positionNames: assignment.positionIds.map((id) => positionById(state, id)?.name ?? '—'),
      availabilityText: assignment.availability.map((range) => formatTimeRange(range.start, range.end)).join(', '),
    })),
    sessionStarts: sessionStarts(state),
    ...evaluation,
  };
}

function markEdited(state) {
  state.schedule.dirty = true;
  if (state.schedule.status === 'none') {
    state.schedule.status = 'draft';
  }
}

export async function getSchedule() {
  await mockRequest();
  requireRole('executive');
  return clone(scheduleView(getState()));
}

/** Replaces the draft with the verified demo draft for the currently shortlisted applications. */
export async function generateDraft() {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('lịch phỏng vấn');
  const state = getState();
  const shortlisted = state.applications.filter((application) => application.screeningStatus === 'shortlisted');
  state.interviews = shortlisted.map((application) => {
    const template = BASE.draftInterviews.find((item) => item.applicationId === application.id);
    if (template) {
      return { note: '', ...structuredClone(template), end: addMinutes(template.start, state.campaign.slotMinutes) };
    }
    return {
      id: `iv-${application.id.toLowerCase()}`,
      applicationId: application.id,
      interviewerId: null,
      roomId: null,
      start: null,
      end: null,
      note: 'Bản nháp mẫu không có tổ hợp giờ, người phỏng vấn và phòng cho hồ sơ này; cần gán thủ công.',
    };
  });
  state.schedule.status = 'draft';
  state.schedule.dirty = true;
  return clone(scheduleView(state));
}

/** Common duration and available rooms (BR-10: one duration for the whole campaign). */
export async function updateSettings({ slotMinutes, roomIds }) {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('lịch phỏng vấn');
  const state = getState();
  if (slotMinutes) {
    if (![15, 20, 30].includes(Number(slotMinutes))) {
      throw createUiError('validation', 'Thời lượng mỗi ca phải là 15, 20 hoặc 30 phút.');
    }
    state.campaign.slotMinutes = Number(slotMinutes);
    state.interviews = state.interviews.map((interview) => ({
      ...interview,
      end: addMinutes(interview.start, state.campaign.slotMinutes),
    }));
  }
  if (roomIds) {
    if (roomIds.length === 0) {
      throw createUiError('validation', 'Chọn ít nhất một phòng.');
    }
    state.schedule.roomIds = roomIds;
  }
  markEdited(state);
  return clone(scheduleView(state));
}

/** Manual edit / assign slot for one application. change: { start, interviewerId, roomId } */
export async function updateRow(applicationId, change) {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('lịch phỏng vấn');
  const state = getState();
  const application = state.applications.find((item) => item.id === applicationId);
  if (!application || application.screeningStatus !== 'shortlisted') {
    throw createUiError('conflict', `Hồ sơ ${applicationId} không còn ở trạng thái Qua vòng CV.`);
  }
  const fieldErrors = {};
  // Match by instant, so any ISO 8601 offset of the same moment is accepted (Q-02).
  const start = sessionStarts(state).find((session) => toMs(session) === toMs(change.start));
  if (!start) {
    fieldErrors.start = 'Chọn một ca trong khung giờ phỏng vấn.';
  }
  const assignment = state.assignments.find((item) => item.interviewerId === change.interviewerId);
  if (!assignment || !assignment.positionIds.includes(application.positionId)) {
    fieldErrors.interviewerId = 'Chọn người phỏng vấn được phân công cho vị trí này.';
  }
  if (!state.rooms.some((room) => room.id === change.roomId)) {
    fieldErrors.roomId = 'Chọn phòng có sẵn.';
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw createUiError('validation', 'Chưa thể cập nhật ca phỏng vấn.', { fieldErrors });
  }

  const values = {
    interviewerId: change.interviewerId,
    roomId: change.roomId,
    start,
    end: addMinutes(start, state.campaign.slotMinutes),
    note: '',
  };
  const existing = state.interviews.find((interview) => interview.applicationId === applicationId);
  if (existing) {
    Object.assign(existing, values);
  } else {
    state.interviews.push({ id: `iv-${applicationId.toLowerCase()}`, applicationId, ...values });
  }
  markEdited(state);
  return clone(scheduleView(state));
}

export async function saveDraft() {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('lịch phỏng vấn');
  const state = getState();
  state.schedule.dirty = false;
  state.schedule.savedAt = state.now;
  return clone(scheduleView(state));
}

/** BR-13: confirm only when every condition holds; otherwise reject with the unmet conditions. */
export async function confirm() {
  await mockRequest();
  requireRole('executive');
  assertNotLockedBySchedule('lịch phỏng vấn');
  const state = getState();
  const evaluation = evaluateSchedule(state);
  if (evaluation.zeroShortlisted) {
    throw createUiError('conflict', 'Không có hồ sơ qua vòng CV nên bỏ qua bước xác nhận lịch (BR-13).');
  }
  if (!evaluation.canConfirm) {
    throw createUiError('conflict', 'Chưa thể xác nhận lịch. Hãy xử lý các điều kiện chưa đạt.', {
      details: { conditions: evaluation.conditions.filter((condition) => !condition.met) },
    });
  }
  state.schedule.status = 'confirmed';
  state.schedule.confirmedAt = state.now;
  state.schedule.savedAt = state.now;
  state.schedule.dirty = false;
  return clone(scheduleView(state));
}


export async function exportTimetable() {
  await mockRequest();
  requireRole('executive');
  const state = getState();
  const { rows } = evaluateSchedule(state);
  const header = ['Hồ sơ', 'Ứng viên', 'Vị trí', 'Giờ phỏng vấn', 'Người phỏng vấn', 'Phòng', 'Trạng thái'];
  const lines = rows.map((row) =>
    [
      row.applicationId,
      row.applicantName,
      row.positionName,
      row.start ? formatTimeRange(row.start, row.end) : 'Chưa xếp',
      row.interviewerName ?? 'Chưa xếp',
      row.roomName ?? 'Chưa xếp',
      getLabel(SCHEDULE_STATUS_LABELS, row.status),
    ],
  );
  return {
    fileName: isScheduleConfirmed(state) ? 'clubflow-lich-phong-van.csv' : 'clubflow-lich-nhap.csv',
    content: toCsv(header, lines),
    rowCount: rows.length,
  };
}
