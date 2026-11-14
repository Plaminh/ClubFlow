/*
 * User-facing (Vietnamese) labels for internal (English) identifiers.
 *
 * Wording follows the UI references in docs/reference/ui/. Workflow terms that
 * the requirements and reference screens keep in English (Proposed, Conflict,
 * Unassigned, Confirmed, Pass, Fail) are kept as-is.
 *
 * This file only maps identifiers to text. It must not decide business rules
 * (for example, which status may change to which).
 */

export const EMPTY_LABEL = '—';

// Page titles (<h1>) exactly as in the reference screens, which keep the
// screen names in English inside an otherwise Vietnamese UI.
export const SCREEN_LABELS = Object.freeze({
  applicantPortal: 'Applicant Portal',
  campaignManagement: 'Create Recruitment Campaign',
  applicationReview: 'Application Review',
  interviewScheduling: 'Interview Scheduling',
  interviewerWorkspace: 'Interviewer Workspace',
  notFound: 'Không tìm thấy trang',
});

// Header navigation labels (reference headers).
export const NAV_LABELS = Object.freeze({
  campaign: 'Chiến dịch',
  review: 'Duyệt hồ sơ',
  scheduling: 'Xếp lịch',
  applicantPortal: 'Applicant Portal',
  interviewerWorkspace: 'Interviewer Workspace',
  publicPortal: 'Trang công khai',
});

export const ROLE_LABELS = Object.freeze({
  visitor: 'Khách',
  executive: 'Ban tuyển dụng',
  applicant: 'Ứng viên',
  interviewer: 'Người phỏng vấn',
});

export const CAMPAIGN_STATUS_LABELS = Object.freeze({
  draft: 'Bản nháp',
  published: 'Đã công bố',
});

export const SCREENING_STATUS_LABELS = Object.freeze({
  pendingReview: 'Chờ duyệt',
  shortlisted: 'Qua vòng CV',
  rejected: 'Loại ở vòng CV',
});

export const SCHEDULE_STATUS_LABELS = Object.freeze({
  proposed: 'Proposed',
  conflict: 'Conflict',
  unassigned: 'Unassigned',
  confirmed: 'Confirmed',
});

export const ASSESSMENT_STATUS_LABELS = Object.freeze({
  awaiting: 'Chờ đánh giá',
  submitted: 'Đã gửi',
});

// A missing decision is stored as null (see specs/001-frontend-ui/data-model.md);
// show it with getLabel(RESULT_DECISION_LABELS, decision, RESULT_DECISION_LABELS.none).
export const RESULT_DECISION_LABELS = Object.freeze({
  none: 'Chưa ghi nhận',
  pass: 'Pass',
  fail: 'Fail',
});

export const PUBLICATION_STATUS_LABELS = Object.freeze({
  unpublished: 'Chưa công bố',
  published: 'Đã công bố',
});

export const RECOMMENDATION_LABELS = Object.freeze({
  recommend: 'Đề xuất tiếp nhận',
  consider: 'Cần cân nhắc',
  notRecommend: 'Không đề xuất',
});

/**
 * Returns the label for `id` in `labels`, or `fallback` when the id is
 * missing or unknown. Unknown ids never fall back to the raw English id, so
 * internal identifiers do not leak into the Vietnamese UI.
 */
export function getLabel(labels, id, fallback = EMPTY_LABEL) {
  if (id === null || id === undefined) {
    return fallback;
  }

  return Object.hasOwn(labels, id) ? labels[id] : fallback;
}
