/*
 * Interviewer Workspace service. Demo implementation.
 * An interviewer sees only their own CONFIRMED interviews and never the
 * Executive's private screening notes (ROLES_AND_PERMISSIONS §3).
 */
import { accountById, accountName, isScheduleConfirmed, positionById, roomName, toMs } from '../mocks/derive.js';
import { SAMPLE_CV_URL } from '../mocks/fixtures.js';
import { requireRole } from '../mocks/guards.js';
import { clone, getState, mockRequest } from '../mocks/store.js';
import { validateAssessmentInput } from '../utils/validation.js';
import { createUiError } from './uiError.js';

function timingOf(state, interview) {
  const now = toMs(state.now);
  if (now < toMs(interview.start)) {
    return 'upcoming';
  }
  return now < toMs(interview.end) ? 'inProgress' : 'completed';
}

function summaryOf(state, interview) {
  const application = state.applications.find((item) => item.id === interview.applicationId);
  const assessment = state.assessments.find((item) => item.interviewId === interview.id) ?? null;
  const timing = timingOf(state, interview);
  return {
    interviewId: interview.id,
    applicationId: application.id,
    applicantName: accountName(application.applicantId),
    positionName: positionById(state, application.positionId)?.name ?? '—',
    start: interview.start,
    end: interview.end,
    roomName: roomName(state, interview.roomId),
    timing,
    assessmentStatus: assessment ? 'submitted' : 'awaiting',
    canAssess: timing === 'completed' && !assessment,
  };
}

function myInterviews(state, account) {
  if (!isScheduleConfirmed(state)) {
    return [];
  }
  return state.interviews
    .filter((interview) => interview.interviewerId === account.id && interview.start)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export async function listAssignedInterviews() {
  await mockRequest();
  const account = requireRole('interviewer');
  const state = getState();
  return clone({
    scheduleConfirmed: isScheduleConfirmed(state),
    interviewDate: state.campaign.interviewDate,
    interviews: myInterviews(state, account).map((interview) => summaryOf(state, interview)),
  });
}

function findMine(state, account, interviewId) {
  const interview = myInterviews(state, account).find((item) => item.id === interviewId);
  if (!interview) {
    throw createUiError('forbidden', 'Buổi phỏng vấn này không được phân công cho bạn.');
  }
  return interview;
}

export async function getInterview(interviewId) {
  await mockRequest();
  const account = requireRole('interviewer');
  const state = getState();
  const interview = findMine(state, account, interviewId);
  const application = state.applications.find((item) => item.id === interview.applicationId);
  const applicant = accountById(application.applicantId);
  const assessment = state.assessments.find((item) => item.interviewId === interview.id) ?? null;
  // No privateNote here: screening notes are Executive-only.
  return clone({
    ...summaryOf(state, interview),
    faculty: applicant?.faculty ?? '—',
    year: applicant?.year ?? '—',
    sop: application.sop,
    cv: { ...application.cv, url: SAMPLE_CV_URL },
    assessment,
  });
}

/** One assessment per completed, assigned interview. Not a Pass/Fail decision. */
export async function submitAssessment(interviewId, { recommendation, notes }) {
  await mockRequest();
  const account = requireRole('interviewer');
  const state = getState();
  const interview = findMine(state, account, interviewId);
  if (timingOf(state, interview) !== 'completed') {
    throw createUiError('conflict', 'Buổi phỏng vấn chưa diễn ra xong nên chưa thể đánh giá.');
  }
  if (state.assessments.some((item) => item.interviewId === interviewId)) {
    throw createUiError('conflict', 'Buổi phỏng vấn này đã có đánh giá; không thể gửi lần hai.');
  }
  const fieldErrors = validateAssessmentInput({ recommendation, notes });
  if (Object.keys(fieldErrors).length > 0) {
    throw createUiError('validation', 'Chưa thể gửi đánh giá. Điền nhận xét và chọn đề xuất.', { fieldErrors });
  }
  const assessment = {
    id: `as-${interview.applicationId.toLowerCase()}`,
    interviewId,
    interviewerId: account.id,
    recommendation,
    notes: notes.trim(),
    submittedAt: state.now,
  };
  state.assessments.push(assessment);
  return clone(assessment);
}
