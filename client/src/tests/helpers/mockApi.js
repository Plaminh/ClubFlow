import { vi } from 'vitest';
import { ACCOUNTS } from '../../mocks/fixtures.js';
import { buildScenarioState } from '../../mocks/scenarios.js';

const BASE_USERS = [
  { id: 'exec-recruitment', handle: 'exec', role: 'executive', displayName: 'Recruitment Executive', email: 'executive@clubflow.demo.example', description: 'Technology and Innovation Club' },
  { id: 'ap-minhanh', handle: 'studentA', role: 'applicant', displayName: 'Nguyen Minh Anh', email: 'minh.anh@demo.example', studentId: '26DEMO0142', faculty: 'Information Technology', year: 'Year 2' },
  { id: 'ap-quocbao', handle: 'studentB', role: 'applicant', displayName: 'Pham Quoc Bao', email: 'quoc.bao@demo.example', studentId: '26DEMO0177', faculty: 'Design', year: 'Year 3' },
  { id: 'iv-giahuy', handle: 'int-content', role: 'interviewer', displayName: 'Gia Huy', email: 'gia.huy@clubflow.demo.example', description: 'Content' },
  { id: 'iv-comms', handle: 'int-comms', role: 'interviewer', displayName: 'Linh Tran', email: 'linh.tran@clubflow.demo.example', description: 'Communications' },
];

let users;
let legacyUsers;
let mode;
let delayMs;
let campaignState;

export function resetMockApi() {
  users = structuredClone(BASE_USERS);
  legacyUsers = structuredClone(ACCOUNTS);
  mode = 'normal';
  delayMs = 0;
  campaignState = buildScenarioState('screening');
}

export function setMockApiScenario(scenarioId) {
  campaignState = buildScenarioState(scenarioId);
}

export function setMockApiMode(nextMode) {
  mode = nextMode;
}

export function setMockApiDelay(milliseconds) {
  delayMs = milliseconds;
}

function response(status, body) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: status === 204 ? {} : { 'content-type': 'application/json' },
  });
}

function tokenFrom(init) {
  const headers = new Headers(init?.headers);
  return headers.get('authorization')?.replace(/^Bearer\s+/iu, '') ?? null;
}

function userForToken(token) {
  if (token?.startsWith('mock-test-token-')) {
    return legacyUsers.find((user) => user.id === token.slice('mock-test-token-'.length)) ?? null;
  }
  const handle = token?.replace(/^mock-token-/u, '');
  return users.find((user) => user.handle === handle) ?? null;
}

function campaignView() {
  const applications = campaignState.applications;
  const confirmed = campaignState.schedule.status === 'confirmed';
  const setupLocked = confirmed || applications.length > 0;
  const positions = campaignState.positions.map((position) => ({
    ...position,
    departmentName: campaignState.departments.find((item) => item.id === position.departmentId)?.name ?? '',
    applicationCount: applications.filter((item) => item.positionId === position.id).length,
  }));
  const assignments = campaignState.assignments.map((assignment) => ({
    ...assignment,
    interviewerName: legacyUsers.find((item) => item.id === assignment.interviewerId)?.displayName ?? assignment.interviewerId,
    positionNames: assignment.positionIds.map((id) => positions.find((item) => item.id === id)?.name).filter(Boolean),
    availabilityText: assignment.availability.map(({ start, end }) => `${start.slice(11, 16)}-${end.slice(11, 16)}`).join(', '),
  }));
  return {
    campaign: { ...campaignState.campaign, applicationsClosedAt: null },
    phase: campaignState.scenarioId,
    positions: mode === 'empty' ? [] : positions,
    slots: campaignState.slots,
    interviewSetup: {
      interviewers: legacyUsers.filter((item) => item.role === 'interviewer').slice(0, 2).map((item) => ({ id: item.id, name: item.displayName })),
      rooms: campaignState.rooms,
      assignments,
      roomIds: campaignState.schedule.roomIds,
      locked: setupLocked,
      lockReason: confirmed ? 'scheduleConfirmed' : applications.length ? 'applicationExists' : null,
    },
    locked: confirmed,
    lockReason: confirmed ? 'scheduleConfirmed' : null,
  };
}

function updatePositions(inputs = []) {
  campaignState.positions = inputs.map((input, index) => {
    const existing = input.id ? campaignState.positions.find((item) => item.id === input.id) : null;
    const department = campaignState.departments.find((item) => item.name === input.departmentName) ?? { id: `dep-test-${index}`, name: input.departmentName };
    if (!campaignState.departments.some((item) => item.id === department.id)) campaignState.departments.push(department);
    return { ...(existing ?? {}), ...input, id: existing?.id ?? `pos-test-${index + 1}`, departmentId: department.id };
  });
}

function publicCampaignView() {
  if (campaignState.campaign.status === 'draft') return null;
  const phase = campaignState.scenarioId === 'accepting' ? 'open' : campaignState.scenarioId === 'before-open' ? 'before-open' : 'closed';
  return {
    campaign: { ...campaignState.campaign, applicationsClosedAt: phase === 'closed' ? campaignState.now : null },
    phase,
    acceptingApplications: phase === 'open',
    positions: mode === 'empty' ? [] : campaignView().positions.map(({ applicationCount: _count, ...position }) => position),
    slots: mode === 'empty' ? [] : campaignState.slots,
  };
}

function applicantApplication(application) {
  const position = campaignState.positions.find((item) => item.id === application.positionId);
  const interview = campaignState.schedule.status === 'confirmed'
    ? campaignState.interviews.find((item) => item.applicationId === application.id)
    : null;
  const result = campaignState.results.find((item) => item.applicationId === application.id && item.publishedAt);
  const room = interview ? campaignState.rooms.find((item) => item.id === interview.roomId) : null;
  return {
    id: application.id,
    campaignId: campaignState.campaign.id,
    campaignName: campaignState.campaign.name,
    positionId: application.positionId,
    positionName: position?.name ?? '—',
    submittedAt: application.submittedAt,
    screeningStatus: application.screeningStatus,
    confirmedInterview: interview ? { interviewId: interview.id, start: interview.start, end: interview.end, roomName: room?.name ?? '—' } : null,
    result: result ? { decision: result.decision, publishedAt: result.publishedAt } : null,
  };
}

async function handleFetch(input, init = {}) {
  if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (mode === 'network-error') throw new TypeError('Failed to fetch');
  const url = new URL(String(input), 'http://clubflow.test');
  const method = init.method ?? 'GET';
  if (url.pathname === '/api/health') return response(200, { status: 'ok' });
  if (url.pathname === '/api/auth/login' && method === 'POST') {
    const body = JSON.parse(init.body ?? '{}');
    const user = users.find((candidate) => candidate.handle === body.username);
    if (!user || body.password !== 'ClubFlowDemo!') return response(401, { error: 'Username or password is incorrect.', code: 'INVALID_CREDENTIALS' });
    return response(200, { token: `mock-token-${user.handle}`, user });
  }
  if (url.pathname === '/api/campaigns/current' && method === 'GET') {
    if (mode === 'error') return response(503, { error: 'The mock service is unavailable.', code: 'MOCK_ERROR' });
    const view = publicCampaignView();
    return view ? response(200, view) : response(404, { error: 'No published campaign is available.', code: 'NO_PUBLIC_CAMPAIGN' });
  }
  const user = userForToken(tokenFrom(init));
  if (!user) return response(401, { error: 'A valid bearer token is required.', code: 'INVALID_TOKEN' });
  if (url.pathname === '/api/auth/me' && method === 'GET') return response(200, user);
  if (url.pathname === '/api/auth/logout' && method === 'POST') return response(204);
  if (url.pathname === '/api/me/profile' && method === 'GET') {
    const { handle: _handle, description: _description, ...profile } = user;
    return response(200, profile);
  }
  if (url.pathname === '/api/me/profile' && method === 'PATCH') {
    const body = JSON.parse(init.body ?? '{}');
    const fieldErrors = {};
    if (!body.displayName?.trim()) fieldErrors.displayName = 'Display name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(body.email ?? '')) fieldErrors.email = 'A valid email is required.';
    if (Object.keys(fieldErrors).length) return response(400, { error: 'Profile fields are invalid.', code: 'VALIDATION_ERROR', fieldErrors });
    if ([...users, ...legacyUsers].some((candidate) => candidate.id !== user.id && candidate.email.toLowerCase() === body.email.toLowerCase())) return response(409, { error: 'That email is already in use.', code: 'EMAIL_ALREADY_USED', fieldErrors: { email: 'That email is already in use.' } });
    user.displayName = body.displayName.trim();
    user.email = body.email.trim().toLowerCase();
    const { handle: _handle, description: _description, ...profile } = user;
    return response(200, profile);
  }
  if (mode === 'error') return response(503, { error: 'The mock service is unavailable.', code: 'MOCK_ERROR' });
  if (url.pathname === '/api/applications' && method === 'POST') {
    if (user.role !== 'applicant') return response(403, { error: 'Applicant role required.', code: 'ROLE_FORBIDDEN' });
    const form = init.body;
    const positionId = form.get('positionId');
    if (campaignState.scenarioId !== 'accepting') return response(409, { error: 'Applications are closed.', code: 'APPLICATIONS_CLOSED' });
    const duplicate = campaignState.applications.find((item) => item.applicantId === user.id && item.positionId === positionId);
    if (duplicate) return response(409, { error: 'An application for this position already exists.', code: 'DUPLICATE_APPLICATION', details: { existingApplicationId: duplicate.id }, fieldErrors: { positionId: `Application ${duplicate.id} already exists for this position.` } });
    const fieldErrors = {};
    if (!form.get('campaignId')) fieldErrors.campaignId = 'Campaign is required.';
    if (!campaignState.positions.some((item) => item.id === positionId)) fieldErrors.positionId = 'Choose a campaign position.';
    if (!form.get('slotIds')) fieldErrors.slotIds = 'Choose at least one slot.';
    if (!form.get('cv')) fieldErrors.cv = 'Upload one PDF.';
    if (Object.keys(fieldErrors).length) return response(400, { error: 'Application fields are invalid.', code: 'VALIDATION_ERROR', fieldErrors });
    const id = `CF-${String(Math.max(31, ...campaignState.applications.map((item) => Number(item.id.replace(/\D/gu, '')) || 0)) + 1).padStart(3, '0')}`;
    const application = {
      id,
      applicantId: user.id,
      positionId,
      submittedAt: campaignState.now,
      slotIds: form.getAll('slotIds'),
      sop: form.get('sop'),
      screeningStatus: 'pendingReview',
      reviewedAt: null,
      privateNote: '',
      cv: { fileName: form.get('cv').name, sizeBytes: form.get('cv').size },
    };
    campaignState.applications.push(application);
    return response(201, { ...applicantApplication(application), applicantId: user.id, slotIds: application.slotIds, sop: application.sop, cv: application.cv });
  }
  if (url.pathname === '/api/me/applications' && method === 'GET') {
    if (user.role !== 'applicant') return response(403, { error: 'Applicant role required.', code: 'ROLE_FORBIDDEN' });
    const items = mode === 'empty' ? [] : campaignState.applications.filter((item) => item.applicantId === user.id).map(applicantApplication);
    return response(200, { items });
  }
  if (url.pathname === '/api/me/notifications' && method === 'GET') {
    if (user.role !== 'applicant') return response(403, { error: 'Applicant role required.', code: 'ROLE_FORBIDDEN' });
    const items = mode === 'empty' ? [] : campaignState.notifications.filter((item) => item.accountId === user.id);
    return response(200, { items, unreadCount: items.filter((item) => !item.readAt).length });
  }
  if (url.pathname === '/api/me/notifications' && method === 'PATCH') {
    campaignState.notifications.filter((item) => item.accountId === user.id).forEach((item) => { item.readAt = campaignState.now; });
    return response(204);
  }
  const campaignMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)$/u);
  if (campaignMatch && method === 'GET') {
    if (user.role !== 'executive') return response(403, { error: 'Executive role required.', code: 'ROLE_FORBIDDEN' });
    return response(200, campaignView());
  }
  if (campaignMatch && method === 'PATCH') {
    const body = JSON.parse(init.body ?? '{}');
    const fieldErrors = {};
    if (!body.name?.trim()) fieldErrors.name = 'Name is required.';
    if (body.positions && !body.positions.length) fieldErrors.positions = 'At least one position is required.';
    if (Object.keys(fieldErrors).length) return response(400, { error: 'Campaign fields are invalid.', code: 'VALIDATION_ERROR', fieldErrors });
    Object.assign(campaignState.campaign, body);
    if (body.positions) updatePositions(body.positions);
    return response(200, campaignView());
  }
  const setupMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/interview-setup$/u);
  if (setupMatch && method === 'PATCH') {
    if (campaignState.applications.length || campaignState.schedule.status === 'confirmed') return response(409, { error: 'Interview setup is locked.', code: 'INTERVIEW_SETUP_LOCKED' });
    const body = JSON.parse(init.body ?? '{}');
    const fieldErrors = {};
    if (![15, 20, 30].includes(body.slotMinutes)) fieldErrors.slotMinutes = 'Must be 15, 20, or 30.';
    if (!body.roomIds?.length) fieldErrors.roomIds = 'Select at least one room.';
    if (!body.assignments?.length) fieldErrors.assignments = 'Assign at least one interviewer.';
    if (Object.keys(fieldErrors).length) return response(400, { error: 'Interview setup is invalid.', code: 'VALIDATION_ERROR', fieldErrors });
    Object.assign(campaignState.campaign, { interviewDate: body.interviewDate, interviewWindow: body.interviewWindow, slotMinutes: body.slotMinutes });
    campaignState.schedule.roomIds = body.roomIds;
    campaignState.assignments = body.assignments;
    return response(200, campaignView());
  }
  const publishMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/publish$/u);
  if (publishMatch && method === 'POST') {
    campaignState.campaign.status = 'published';
    campaignState.campaign.publishedAt = '2026-11-18T12:00:00+07:00';
    return response(200, campaignView());
  }
  const positionMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/positions\/([^/]+)$/u);
  if (positionMatch && method === 'DELETE') {
    const positionId = positionMatch[2];
    if (campaignState.applications.some((item) => item.positionId === positionId)) return response(409, { error: 'A linked position cannot be deleted.', code: 'POSITION_HAS_APPLICATIONS' });
    campaignState.positions = campaignState.positions.filter((item) => item.id !== positionId);
    return response(200, campaignView());
  }
  return response(404, { error: 'Endpoint not found.', code: 'NOT_FOUND' });
}

export function installMockApi() {
  vi.stubGlobal('fetch', vi.fn(handleFetch));
}

resetMockApi();
