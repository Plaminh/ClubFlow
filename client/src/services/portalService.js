import { apiClient } from './apiClient.js';
import { PRIMARY_CAMPAIGN_ID } from './campaignService.js';

function applicationView(application) {
  return {
    ...application,
    interview: application.confirmedInterview ?? null,
  };
}

export async function getPublicCampaign(options = {}) {
  try {
    return await apiClient('/campaigns/current', options);
  } catch (error) {
    if (error?.code === 'NO_PUBLIC_CAMPAIGN')
      return {
        campaign: null,
        phase: 'draft',
        acceptingApplications: false,
        positions: [],
        slots: [],
      };
    throw error;
  }
}

export async function listMyApplications(campaignId = PRIMARY_CAMPAIGN_ID, options = {}) {
  const response = await apiClient('/me/applications', { ...options, query: { campaignId } });
  return response.items.map(applicationView);
}

export async function submitApplication(formData, campaignId = PRIMARY_CAMPAIGN_ID, options = {}) {
  const payload = new FormData();
  payload.set('campaignId', campaignId);
  for (const [key, value] of formData.entries()) payload.append(key, value);
  return applicationView(
    await apiClient('/applications', { ...options, method: 'POST', body: payload }),
  );
}

export async function listNotifications(options = {}) {
  const response = await apiClient('/me/notifications', options);
  return response.items;
}

export function markNotificationsRead(options = {}) {
  return apiClient('/me/notifications', { ...options, method: 'PATCH' });
}
