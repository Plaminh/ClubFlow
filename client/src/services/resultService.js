/*
 * Final results service (C11) over the documented HTTP contract
 * (docs/api/06-results-notifications.md). Pass/Fail is recorded per
 * application, separate from screening and scheduling (BR-08).
 *
 * Result rows do not carry interview time/room/interviewer, so they are joined
 * with the Executive's confirmed schedule (docs/api/04-scheduling.md).
 */
import { apiClient } from './apiClient.js';
import { PRIMARY_CAMPAIGN_ID } from './campaignService.js';

const base = (campaignId) => `/campaigns/${encodeURIComponent(campaignId)}`;

export async function list(options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  const [view, schedule] = await Promise.all([
    apiClient(`${base(campaignId)}/results`, options),
    apiClient(`${base(campaignId)}/schedule`, options),
  ]);
  const scheduleRows = new Map((schedule?.rows ?? []).map((row) => [row.applicationId, row]));
  return {
    ...view,
    rejectedIds: [...(view.rejectedIds ?? [])].sort(),
    rows: (view.rows ?? [])
      .map((row) => {
        const slot = scheduleRows.get(row.applicationId) ?? {};
        return {
          ...row,
          start: slot.start ?? null,
          end: slot.end ?? null,
          roomName: slot.roomName ?? '—',
          interviewerName: slot.interviewerName ?? '—',
          interviewEnded: true,
          assessmentStatus: row.assessmentSubmitted ? 'submitted' : 'awaiting',
        };
      })
      .sort((a, b) => a.applicationId.localeCompare(b.applicationId)),
  };
}

export async function getAssessment(applicationId, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  const [assessment, schedule] = await Promise.all([
    apiClient(
      `${base(campaignId)}/applications/${encodeURIComponent(applicationId)}/assessment`,
      options,
    ),
    apiClient(`${base(campaignId)}/schedule`, options),
  ]);
  if (!assessment) return null;
  const row = (schedule?.rows ?? []).find(
    (item) => item.interviewerId === assessment.interviewerId,
  );
  return { ...assessment, interviewerName: row?.interviewerName ?? assessment.interviewerId };
}

export function record(applicationId, decision, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return apiClient(
    `${base(campaignId)}/applications/${encodeURIComponent(applicationId)}/final-result`,
    {
      ...options,
      method: 'PUT',
      body: { decision },
    },
  );
}

/** Publishes every recorded, unpublished decision; the server creates one notification each, idempotently. */
export function publishRecorded(options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return apiClient(`${base(campaignId)}/results/publish`, { ...options, method: 'POST' });
}
