/*
 * Interviewer Workspace service (C10) over the documented HTTP contract
 * (docs/api/05-interviewer.md). The server scopes every response to the
 * signed-in interviewer's confirmed assignments and omits Executive-only
 * screening notes; this adapter only maps DTOs to the UI view model.
 */
import { apiClient, apiDownload } from './apiClient.js';
import { PRIMARY_CAMPAIGN_ID } from './campaignService.js';

function timingOf(interview) {
  return interview.completed ? 'completed' : 'upcoming';
}

function summaryOf(interview, submitted) {
  const timing = timingOf(interview);
  return {
    ...interview,
    timing,
    assessmentStatus: submitted ? 'submitted' : 'awaiting',
    canAssess: timing === 'completed' && !submitted,
  };
}

export async function listAssignedInterviews(options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  const view = await apiClient('/me/interviews', { ...options, query: { campaignId } });
  return {
    ...view,
    interviews: (view.interviews ?? []).map((item) => summaryOf(item, Boolean(item.assessmentSubmitted))),
  };
}

export async function getInterview(interviewId, options = {}) {
  const detail = await apiClient(`/interviews/${encodeURIComponent(interviewId)}`, options);
  return {
    ...summaryOf(detail, Boolean(detail.assessment)),
    faculty: detail.student?.faculty ?? '—',
    year: detail.student?.year ?? '—',
  };
}

/** Authorized CV download: the bearer token is sent, so a plain link cannot be used. */
export function downloadCv(applicationId, options = {}) {
  return apiDownload(`/applications/${encodeURIComponent(applicationId)}/cv`, options);
}

/**
 * One immutable assessment per completed, assigned interview (Q-04): required
 * notes plus an optional advisory recommendation. It never creates a final
 * result; the Executive records Pass/Fail separately.
 */
export function submitAssessment(interviewId, { recommendation, notes }, options = {}) {
  return apiClient(`/interviews/${encodeURIComponent(interviewId)}/assessment`, {
    ...options,
    method: 'POST',
    body: { notes, recommendation: recommendation || null },
  });
}
