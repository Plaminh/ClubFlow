import { readFileSync } from 'node:fs';

const dataUrl = (name) => new URL(`../data/${name}`, import.meta.url);
const loadJson = (name) => JSON.parse(readFileSync(dataUrl(name), 'utf8'));

const clone = (value) => structuredClone(value);

export const FIXED_TIMES = [
  '2026-11-17T09:10:00+07:00',
  '2026-11-17T09:12:00+07:00',
  '2026-11-17T09:14:00+07:00',
  '2026-11-17T10:00:00+07:00',
  '2026-11-17T10:05:00+07:00',
  '2026-11-17T10:07:00+07:00',
  '2026-11-17T10:09:00+07:00',
  '2026-11-17T10:20:00+07:00',
  '2026-11-17T10:30:00+07:00',
  '2026-11-17T10:40:00+07:00',
  '2026-12-02T13:00:00+07:00',
  '2026-12-02T13:02:00+07:00',
  '2026-12-02T13:10:00+07:00',
  '2026-12-02T13:12:00+07:00',
  '2026-12-02T13:20:00+07:00',
  '2026-12-02T13:30:00+07:00'
];

export function createState() {
  const state = {
    users: loadJson('users.json'),
    campaigns: loadJson('campaigns.json'),
    resources: loadJson('resources.json'),
    applications: [],
    schedules: {},
    assessments: [],
    results: [],
    notifications: [],
    counters: { campaign: 2027, application: 1, clock: 0 },
  };
  return state;
}

export function resetState(state) {
  Object.assign(state, createState());
  return state;
}

export function nextTime(state, preferredIndex) {
  if (Number.isInteger(preferredIndex)) {
    state.counters.clock = Math.max(state.counters.clock, preferredIndex + 1);
    return FIXED_TIMES[preferredIndex];
  }
  const index = Math.min(state.counters.clock, FIXED_TIMES.length - 1);
  state.counters.clock += 1;
  return FIXED_TIMES[index];
}

export function nextApplicationId(state) {
  const id = `A${String(state.counters.application).padStart(2, '0')}`;
  state.counters.application += 1;
  return id;
}

export function tokenFor(user) {
  return `mock-token-${user.handle}`;
}

export function userForToken(state, token) {
  return state.users.find((user) => tokenFor(user) === token) ?? null;
}

export function campaignPhase(campaign) {
  if (campaign.status === 'draft') return 'draft';
  if (campaign.applicationsClosedAt) return 'closed';
  if (campaign.opensOn > '2026-11-18') return 'before-open';
  if (campaign.closesOn < '2026-11-18') return 'closed';
  return 'open';
}

export function findCampaign(state, campaignId) {
  return state.campaigns.find((campaign) => campaign.id === campaignId) ?? null;
}

export function findApplication(state, applicationId) {
  return state.applications.find((application) => application.id === applicationId) ?? null;
}

export function positionFor(campaign, positionId) {
  return campaign?.positions.find((position) => position.id === positionId) ?? null;
}

export function publicPosition(position) {
  const { applicationCount: _applicationCount, ...result } = position;
  return result;
}

export function emptyProjection(value, key = '') {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, emptyProjection(child, childKey)]));
  }
  if (typeof value === 'number' && /^(total|pageCount|unreadCount|applications|applicants|pendingReview|shortlisted|rejected|proposed|conflict|unassigned|applicationCount)$/u.test(key)) {
    return 0;
  }
  return value;
}

export { clone };
