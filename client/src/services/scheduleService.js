import { apiClient } from './apiClient.js';
import { PRIMARY_CAMPAIGN_ID } from './campaignService.js';

const base = (campaignId = PRIMARY_CAMPAIGN_ID) => `/campaigns/${campaignId}/schedule`;

function toMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function localTimestamp(date, minutes) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const remainder = String(minutes % 60).padStart(2, '0');
  return `${date}T${hours}:${remainder}:00+07:00`;
}

function sessionStarts(settings) {
  const starts = [];
  const end = toMinutes(settings.interviewWindow.end);
  let cursor = toMinutes(settings.interviewWindow.start);
  while (cursor + settings.slotMinutes <= end) {
    starts.push(localTimestamp(settings.interviewDate, cursor));
    cursor += settings.slotMinutes;
  }
  return starts;
}

function mapView(view) {
  const total = view.summary?.total ?? view.rows?.length ?? 0;
  return {
    ...view,
    hasUnsavedChanges: Boolean(view.dirty),
    sessionStarts: view.settings ? sessionStarts(view.settings) : [],
    summary: {
      ...view.summary,
      shortlisted: total,
      confirmed: view.status === 'confirmed' ? total : 0,
    },
    conditions: (view.conditions ?? []).map((condition) => ({
      ...condition,
      id: condition.id ?? condition.code,
      text: condition.text ?? condition.detail,
    })),
  };
}

export async function getSchedule(options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return mapView(await apiClient(base(campaignId), options));
}

async function mutate(path, method = 'POST', body, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  await apiClient(`${base(campaignId)}${path}`, { ...options, method, body });
  return getSchedule(options, campaignId);
}

/** `settings`: `{ interviewDate, interviewWindow: { start, end }, slotMinutes }` chosen for the draft (C8). */
export function generateDraft(settings, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return mutate('/draft/generate', 'POST', settings, options, campaignId);
}

export function updateRow(applicationId, change, options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return mutate(`/draft/rows/${applicationId}`, 'PATCH', change, options, campaignId);
}

export function saveDraft(options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return mutate('/draft/save', 'POST', undefined, options, campaignId);
}

export function confirm(options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  return mutate('/confirm', 'POST', undefined, options, campaignId);
}

export async function exportTimetable(options = {}, campaignId = PRIMARY_CAMPAIGN_ID) {
  const content = await apiClient(`${base(campaignId)}.csv`, { ...options, responseType: 'text' });
  return {
    fileName: 'clubflow-schedule.csv',
    content,
    rowCount: Math.max(0, content.trim().split(/\r?\n/u).length - 1),
  };
}
