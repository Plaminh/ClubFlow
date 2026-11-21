import { apiClient, apiDownload } from './apiClient.js';
import { PRIMARY_CAMPAIGN_ID } from './campaignService.js';

export const DEFAULT_PAGE_SIZE = 5;

const base = (campaignId = PRIMARY_CAMPAIGN_ID) => `/campaigns/${campaignId}/applications`;

export function list(query = {}, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return apiClient(base(campaignId), {
    ...options,
    query: { ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE },
  });
}

export async function getStats(query = {}, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return (await list(query, options, campaignId)).stats;
}

export async function get(id, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  const detail = await apiClient(`${base(campaignId)}/${id}`, options);
  return { ...detail, cv: { ...detail.cv, url: detail.cv.downloadPath } };
}

export function saveNote(id, note, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return apiClient(`${base(campaignId)}/${id}/private-note`, {
    ...options,
    method: 'PATCH',
    body: { note },
  });
}

export function setScreening(id, decision, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return apiClient(`${base(campaignId)}/${id}/screening-decision`, {
    ...options,
    method: 'POST',
    body: { decision },
  });
}

export async function exportCsv(query = {}, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  const content = await apiClient(`${base(campaignId)}.csv`, {
    ...options,
    query,
    responseType: 'text',
  });
  const rowCount = Math.max(0, content.trim().split(/\r?\n/u).length - 1);
  return { fileName: 'clubflow-applications.csv', content, rowCount };
}

export function downloadCv(applicationId, options = {}) {
  return apiDownload(`/applications/${applicationId}/cv`, options);
}
