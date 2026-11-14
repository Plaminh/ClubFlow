/*
 * Final results service (Executive, Final Results tab). Demo implementation.
 * Pass/Fail is per application and separate from screening and scheduling (BR-08).
 */
import { accountName, isScheduleConfirmed, positionById, roomName, toMs } from '../mocks/derive.js';
import { requireRole } from '../mocks/guards.js';
import { clone, getState, mockRequest } from '../mocks/store.js';
import { createUiError } from './uiError.js';

function assessmentFor(state, interviewId) {
  return state.assessments.find((assessment) => assessment.interviewId === interviewId) ?? null;
}

function resultFor(state, applicationId) {
  return state.results.find((result) => result.applicationId === applicationId) ?? null;
}

/** Only shortlisted applications with a confirmed interview; CV-rejected ones never appear. */
function rowsOf(state) {
  if (!isScheduleConfirmed(state)) {
    return [];
  }
  return state.applications
    .filter((application) => application.screeningStatus === 'shortlisted')
    .map((application) => {
      const interview = state.interviews.find((item) => item.applicationId === application.id);
      if (!interview) {
        return null;
      }
      const result = resultFor(state, application.id);
      return {
        applicationId: application.id,
        applicantName: accountName(application.applicantId),
        positionName: positionById(state, application.positionId)?.name ?? '—',
        interviewId: interview.id,
        start: interview.start,
        end: interview.end,
        roomName: roomName(state, interview.roomId),
        interviewerName: accountName(interview.interviewerId),
        interviewEnded: toMs(state.now) >= toMs(interview.end),
        assessmentStatus: assessmentFor(state, interview.id) ? 'submitted' : 'awaiting',
        decision: result?.decision ?? null,
        recordedAt: result?.recordedAt ?? null,
        publishedAt: result?.publishedAt ?? null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.applicationId.localeCompare(b.applicationId));
}

export async function list() {
  await mockRequest();
  requireRole('executive');
  const state = getState();
  return clone({ scheduleConfirmed: isScheduleConfirmed(state), rows: rowsOf(state) });
}

export async function getAssessment(applicationId) {
  await mockRequest();
  requireRole('executive');
  const state = getState();
  const interview = state.interviews.find((item) => item.applicationId === applicationId);
  const assessment = interview ? assessmentFor(state, interview.id) : null;
  return assessment ? clone({ ...assessment, interviewerName: accountName(assessment.interviewerId) }) : null;
}

export async function record(applicationId, decision) {
  await mockRequest();
  requireRole('executive');
  if (!['pass', 'fail'].includes(decision)) {
    throw createUiError('validation', 'Quyết định không hợp lệ.');
  }
  const state = getState();
  const row = rowsOf(state).find((item) => item.applicationId === applicationId);
  if (!row) {
    throw createUiError('conflict', `Hồ sơ ${applicationId} chưa có buổi phỏng vấn đã xác nhận.`);
  }
  if (row.assessmentStatus !== 'submitted') {
    throw createUiError('conflict', 'Cần có đánh giá phỏng vấn trước khi ghi nhận quyết định.');
  }
  if (row.publishedAt) {
    throw createUiError('conflict', 'Kết quả đã công bố, không thể thay đổi.');
  }
  const existing = resultFor(state, applicationId);
  if (existing) {
    Object.assign(existing, { decision, recordedAt: state.now });
  } else {
    state.results.push({ applicationId, decision, recordedAt: state.now, publishedAt: null });
  }
  return clone(rowsOf(state).find((item) => item.applicationId === applicationId));
}

/** Publishes every recorded, unpublished decision and creates one in-app notification each. */
export async function publishRecorded() {
  await mockRequest();
  requireRole('executive');
  const state = getState();
  const toPublish = state.results.filter((result) => result.decision && !result.publishedAt);
  if (toPublish.length === 0) {
    throw createUiError('conflict', 'Không có kết quả nào đang chờ công bố.');
  }
  for (const result of toPublish) {
    result.publishedAt = state.now;
    const application = state.applications.find((item) => item.id === result.applicationId);
    const position = positionById(state, application.positionId);
    state.notifications.push({
      id: `nt-${result.applicationId.toLowerCase()}-${state.notifications.length + 1}`,
      accountId: application.applicantId,
      applicationId: application.id,
      message: `Kết quả hồ sơ ${application.id} (${position?.name ?? '—'}) đã được công bố: ${result.decision === 'pass' ? 'Pass' : 'Fail'}.`,
      createdAt: state.now,
      readAt: null,
    });
  }
  return clone({ publishedIds: toPublish.map((result) => result.applicationId) });
}
