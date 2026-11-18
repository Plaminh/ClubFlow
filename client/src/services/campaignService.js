import { apiClient } from './apiClient.js';

export const PRIMARY_CAMPAIGN_ID = 'cmp-2026-hk1';

function positionInput(position) {
  return {
    ...(position.id ? { id: position.id } : {}),
    departmentName: position.departmentName?.trim() ?? '',
    name: position.name?.trim() ?? '',
    quota: Number(position.quota),
    description: position.description?.trim() ?? '',
    requirements: position.requirements?.trim() ?? '',
  };
}

export function campaignInput(draft) {
  return {
    name: draft.name,
    hostClub: draft.hostClub,
    description: draft.description,
    instructions: draft.instructions,
    opensOn: draft.opensOn,
    closesOn: draft.closesOn,
    positions: draft.positions?.map(positionInput) ?? [],
  };
}

export function setupInput(draft) {
  return {
    interviewDate: draft.interviewDate,
    interviewWindow: draft.interviewWindow,
    slotMinutes: Number(draft.slotMinutes),
    roomIds: draft.roomIds ?? [],
    assignments: (draft.assignments ?? [])
      .filter((assignment) => assignment.positionIds?.length)
      .map(({ interviewerId, positionIds, availability }) => ({ interviewerId, positionIds, availability })),
  };
}

export function getCampaign(campaignId = PRIMARY_CAMPAIGN_ID, options = {}) {
  return apiClient(`/campaigns/${campaignId}`, options);
}

export function createCampaign(draft, options = {}) {
  return apiClient('/campaigns', { ...options, method: 'POST', body: { ...campaignInput(draft), ...setupInput(draft) } });
}

export async function saveDraft(campaignId, draft, options = {}) {
  const view = await apiClient(`/campaigns/${campaignId}`, { ...options, method: 'PATCH', body: campaignInput(draft) });
  if (view.interviewSetup?.locked) return view;
  return saveInterviewSetup(campaignId, draft, options);
}

export function saveInterviewSetup(campaignId, draft, options = {}) {
  return apiClient(`/campaigns/${campaignId}/interview-setup`, { ...options, method: 'PATCH', body: setupInput(draft) });
}

export async function publish(campaignId, draft, options = {}) {
  await saveDraft(campaignId, draft, options);
  return apiClient(`/campaigns/${campaignId}/publish`, { ...options, method: 'POST' });
}

/** Q-03 early close: a real Executive action; returns the refreshed campaign view. */
export async function closeApplications(campaignId, options = {}) {
  await apiClient(`/campaigns/${campaignId}/close-applications`, { ...options, method: 'POST' });
  return getCampaign(campaignId, options);
}

export function removePosition(campaignId, positionId, options = {}) {
  return apiClient(`/campaigns/${campaignId}/positions/${positionId}`, { ...options, method: 'DELETE' });
}
