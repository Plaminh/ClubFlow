import { vi } from 'vitest';
import { ACCOUNTS } from '../../mocks/fixtures.js';
import { evaluateSchedule } from '../../mocks/derive.js';
import { addMinutes, buildScenarioState } from '../../mocks/scenarios.js';

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

/** The user a real sign-in would have saved for this demo account id. */
export function sessionUserFor(accountId) {
  return users.find((user) => user.id === accountId) ?? legacyUsers.find((user) => user.id === accountId) ?? null;
}

/** Creates an application server-side, as if submitted from another tab. */
export function addMockApiApplication({ id, applicantId, positionId }) {
  campaignState.applications.push({
    id, applicantId, positionId, submittedAt: campaignState.now, slotIds: [], sop: '', screeningStatus: 'pendingReview',
    reviewedAt: null, privateNote: '', cv: { fileName: 'cv.pdf', sizeBytes: 1 }, studentInfo: {},
  });
}

export function setMockApiMode(nextMode) {
  mode = nextMode;
}

/** Moves the mock clock (e.g. before an interview ends). */
export function setMockApiClock(now) {
  campaignState.now = now;
}

/** Read-only snapshot of server-side state, to assert real HTTP mutations. */
export function getMockApiState() {
  return structuredClone(campaignState);
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

function reviewSummary(application) {
  const applicant = legacyUsers.find((item) => item.id === application.applicantId);
  const position = campaignState.positions.find((item) => item.id === application.positionId);
  return {
    id: application.id,
    applicantId: application.applicantId,
    applicantName: applicant?.displayName ?? application.applicantId,
    positionId: application.positionId,
    positionName: position?.name ?? '—',
    submittedAt: application.submittedAt,
    screeningStatus: application.screeningStatus,
  };
}

function reviewDetail(application) {
  const summary = reviewSummary(application);
  const slots = application.slotIds.map((id) => campaignState.slots.find((item) => item.id === id)).filter(Boolean);
  return {
    ...summary,
    student: application.studentInfo,
    availabilityText: slots.map((slot) => `${slot.start.slice(11, 16)}–${slot.end.slice(11, 16)}`).join(', '),
    sop: application.sop,
    cv: { fileName: application.cv.fileName, sizeBytes: application.cv.sizeBytes, downloadPath: `/api/applications/${application.id}/cv` },
    reviewedAt: application.reviewedAt,
    privateNote: application.privateNote,
    siblingIds: campaignState.applications.filter((item) => item.applicantId === application.applicantId && item.id !== application.id).map((item) => item.id),
    locked: campaignState.schedule.status === 'confirmed',
  };
}

function counts(items) {
  return {
    applications: items.length,
    applicants: new Set(items.map((item) => item.applicantId)).size,
    pendingReview: items.filter((item) => item.screeningStatus === 'pendingReview').length,
    shortlisted: items.filter((item) => item.screeningStatus === 'shortlisted').length,
    rejected: items.filter((item) => item.screeningStatus === 'rejected').length,
  };
}

function filteredApplications(url) {
  const search = (url.searchParams.get('search') ?? '').toLowerCase();
  const positionId = url.searchParams.get('positionId') ?? '';
  const status = url.searchParams.get('status') ?? '';
  const sort = url.searchParams.get('sort') ?? 'newest';
  return campaignState.applications.map(reviewSummary)
    .filter((item) => !search || `${item.id} ${item.applicantName}`.toLowerCase().includes(search))
    .filter((item) => !positionId || item.positionId === positionId)
    .filter((item) => !status || item.screeningStatus === status)
    .sort((left, right) => sort === 'oldest' ? left.submittedAt.localeCompare(right.submittedAt) : right.submittedAt.localeCompare(left.submittedAt));
}

function scheduleView() {
  const evaluated = evaluateSchedule(campaignState);
  const saved = campaignState.schedule.status !== 'none' && !campaignState.schedule.dirty && Boolean(campaignState.schedule.savedAt);
  const conditions = [
    ...evaluated.conditions,
    { id: 'saved', code: 'DRAFT_SAVED', met: saved, text: saved ? 'Đã lưu các thay đổi của lịch nháp.' : 'Hãy lưu các thay đổi của lịch nháp.' },
  ];
  return {
    settings: { interviewDate: campaignState.campaign.interviewDate, interviewWindow: campaignState.campaign.interviewWindow, slotMinutes: campaignState.campaign.slotMinutes, roomIds: campaignState.schedule.roomIds },
    assignments: campaignView().interviewSetup.assignments,
    rooms: campaignState.rooms,
    rows: mode === 'empty' ? [] : evaluated.rows,
    summary: mode === 'empty' ? { total: 0, proposed: 0, conflict: 0, unassigned: 0 } : { total: evaluated.summary.shortlisted, proposed: evaluated.summary.proposed, conflict: evaluated.summary.conflict, unassigned: evaluated.summary.unassigned },
    conditions,
    status: campaignState.schedule.status,
    dirty: Boolean(campaignState.schedule.dirty),
    generatedAt: campaignState.schedule.generatedAt ?? null,
    savedAt: campaignState.schedule.savedAt,
    confirmedAt: campaignState.schedule.confirmedAt,
    canConfirm: evaluated.canConfirm && saved,
    zeroShortlisted: mode === 'empty' || evaluated.zeroShortlisted,
  };
}

async function handleFetch(input, init = {}) {
  if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (mode === 'network-error') throw new TypeError('Failed to fetch');
  const url = new URL(String(input), 'http://clubflow.test');
  const method = init.method ?? 'GET';
  // Brief: error mode returns 500 for every request except sign-in.
  if (mode === 'error' && !(url.pathname === '/api/auth/login' && method === 'POST')) {
    return response(500, { error: 'The mock is running in deterministic error mode.', code: 'MOCK_ERROR_MODE' });
  }
  if (url.pathname === '/api/health') return response(200, { status: 'ok' });
  if (url.pathname === '/api/auth/login' && method === 'POST') {
    const body = JSON.parse(init.body ?? '{}');
    const user = users.find((candidate) => candidate.handle === body.username);
    if (!user || body.password !== 'ClubFlowDemo!') return response(401, { error: 'Username or password is incorrect.', code: 'INVALID_CREDENTIALS' });
    return response(200, { token: `mock-token-${user.handle}`, user });
  }
  if (url.pathname === '/api/campaigns/current' && method === 'GET') {
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
  const reviewListMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/applications$/u);
  if (reviewListMatch && method === 'GET') {
    const all = campaignState.applications.map(reviewSummary);
    const filtered = mode === 'empty' ? [] : filteredApplications(url);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 5);
    const page = Number(url.searchParams.get('page') ?? 1);
    return response(200, {
      items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize,
      pageCount: filtered.length ? Math.ceil(filtered.length / pageSize) : 0,
      stats: { campaign: mode === 'empty' ? counts([]) : counts(all), filtered: counts(filtered), isFiltered: ['search', 'positionId', 'status'].some((key) => url.searchParams.has(key) && url.searchParams.get(key)) },
      positions: campaignState.positions.map(({ id, name }) => ({ id, name })),
    });
  }
  const reviewCsvMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/applications\.csv$/u);
  if (reviewCsvMatch && method === 'GET') {
    const rows = filteredApplications(url);
    const csv = ['Application ID,Applicant,Student ID,Email,Position,Submitted At,Status', ...rows.map((item) => {
      const source = campaignState.applications.find((application) => application.id === item.id);
      return [item.id, item.applicantName, source.studentInfo.studentId, source.studentInfo.email, item.positionName, item.submittedAt, item.screeningStatus].join(',');
    })].join('\r\n');
    return new Response(csv, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8' } });
  }
  const noteMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/applications\/([^/]+)\/private-note$/u);
  if (noteMatch && method === 'PATCH') {
    const application = campaignState.applications.find((item) => item.id === noteMatch[2]);
    application.privateNote = JSON.parse(init.body).note;
    return response(200, reviewDetail(application));
  }
  const decisionMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/applications\/([^/]+)\/screening-decision$/u);
  if (decisionMatch && method === 'POST') {
    if (campaignState.schedule.status === 'confirmed') return response(409, { error: 'Schedule confirmation locks screening.', code: 'SCHEDULE_CONFIRMED' });
    const application = campaignState.applications.find((item) => item.id === decisionMatch[2]);
    if (application.screeningStatus !== 'pendingReview') return response(409, { error: 'A screening decision already exists.', code: 'SCREENING_ALREADY_DECIDED' });
    application.screeningStatus = JSON.parse(init.body).decision;
    application.reviewedAt = campaignState.now;
    campaignState.schedule.dirty = campaignState.schedule.status === 'draft';
    return response(200, reviewSummary(application));
  }
  const reviewDetailMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/applications\/([^/]+)$/u);
  if (reviewDetailMatch && method === 'GET') {
    const application = campaignState.applications.find((item) => item.id === reviewDetailMatch[2]);
    return application ? response(200, reviewDetail(application)) : response(404, { error: 'Application not found.', code: 'APPLICATION_NOT_FOUND' });
  }
  const cvMatch = url.pathname.match(/^\/api\/applications\/([^/]+)\/cv$/u);
  if (cvMatch && method === 'GET') return new Response('%PDF-1.4 protected fixture', { status: 200, headers: { 'content-type': 'application/pdf' } });

  const scheduleBase = `/api/campaigns/${campaignState.campaign.id}/schedule`;
  if (url.pathname === scheduleBase && method === 'GET') return response(200, scheduleView());
  if (url.pathname === `${scheduleBase}/draft/generate` && method === 'POST') {
    if (campaignState.schedule.status === 'confirmed') return response(409, { error: 'Schedule is confirmed.', code: 'SCHEDULE_CONFIRMED' });
    campaignState.schedule.status = 'draft';
    campaignState.schedule.dirty = true;
    campaignState.schedule.generatedAt = campaignState.now;
    return response(200, scheduleView());
  }
  const rowMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/schedule\/draft\/rows\/([^/]+)$/u);
  if (rowMatch && method === 'PATCH') {
    const body = JSON.parse(init.body);
    const applicationId = rowMatch[2];
    let interview = campaignState.interviews.find((item) => item.applicationId === applicationId);
    if (!interview) {
      interview = { id: `iv-${applicationId.toLowerCase()}`, applicationId };
      campaignState.interviews.push(interview);
    }
    Object.assign(interview, body, { end: addMinutes(body.start, campaignState.campaign.slotMinutes), note: '' });
    campaignState.schedule.status = 'draft';
    campaignState.schedule.dirty = true;
    return response(200, scheduleView());
  }
  if (url.pathname === `${scheduleBase}/draft/save` && method === 'POST') {
    campaignState.schedule.dirty = false;
    campaignState.schedule.savedAt = campaignState.now;
    return response(200, scheduleView());
  }
  if (url.pathname === `${scheduleBase}/confirm` && method === 'POST') {
    const view = scheduleView();
    if (!view.canConfirm) return response(409, { error: 'Schedule cannot be confirmed.', code: 'SCHEDULE_NOT_READY', details: { conditions: view.conditions.filter((item) => !item.met) } });
    campaignState.schedule.status = 'confirmed';
    campaignState.schedule.confirmedAt = campaignState.now;
    campaignState.schedule.dirty = false;
    return response(200, scheduleView());
  }
  if (url.pathname === `${scheduleBase}.csv` && method === 'GET') {
    const rows = scheduleView().rows;
    const csv = ['Application ID,Applicant,Position,Start,End,Interviewer,Room,Status', ...rows.map((row) => [row.applicationId, row.applicantName, row.positionName, row.start ?? '', row.end ?? '', row.interviewerName ?? '', row.roomName ?? '', row.status].join(','))].join('\r\n');
    return new Response(csv, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8' } });
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
  const outcome = outcomeRoutes(url, method, init, user);
  if (outcome) return outcome;
  return response(404, { error: 'Endpoint not found.', code: 'NOT_FOUND' });
}

/* C10/C11 routes, shaped like docs/api/05-interviewer.md and 06-results-notifications.md. */
const confirmedInterviews = () => (campaignState.schedule.status === 'confirmed' ? campaignState.interviews.filter((item) => item.start) : []);
const assessmentOf = (interviewId) => campaignState.assessments.find((item) => item.interviewId === interviewId) ?? null;

function interviewSummary(interview) {
  const summary = reviewSummary(campaignState.applications.find((item) => item.id === interview.applicationId));
  return {
    interviewId: interview.id,
    applicationId: summary.id,
    applicantName: summary.applicantName,
    positionId: summary.positionId,
    positionName: summary.positionName,
    start: interview.start,
    end: interview.end,
    roomId: interview.roomId,
    roomName: campaignState.rooms.find((item) => item.id === interview.roomId)?.name ?? '—',
    completed: Date.parse(campaignState.now) >= Date.parse(interview.end),
  };
}

function outcomeRoutes(url, method, init, user) {
  const role = (expected) => (user.role === expected ? null : response(403, { error: `${expected} role required.`, code: 'ROLE_FORBIDDEN' }));
  if (url.pathname === '/api/me/interviews' && method === 'GET') {
    const denied = role('interviewer');
    if (denied) return denied;
    const own = mode === 'empty' ? [] : confirmedInterviews().filter((item) => item.interviewerId === user.id);
    return response(200, {
      scheduleConfirmed: campaignState.schedule.status === 'confirmed',
      campaignId: campaignState.campaign.id,
      campaignName: campaignState.campaign.name,
      interviewDate: campaignState.campaign.interviewDate,
      interviews: own.sort((a, b) => a.start.localeCompare(b.start)).map((item) => ({ ...interviewSummary(item), assessmentSubmitted: Boolean(assessmentOf(item.id)) })),
    });
  }
  const assessmentMatch = url.pathname.match(/^\/api\/interviews\/([^/]+)(\/assessment)?$/u);
  if (assessmentMatch) {
    const denied = role('interviewer');
    if (denied) return denied;
    const interview = campaignState.interviews.find((item) => item.id === assessmentMatch[1] && item.start);
    if (!interview) return response(404, { error: 'Interview not found.', code: 'INTERVIEW_NOT_FOUND' });
    if (interview.interviewerId !== user.id || campaignState.schedule.status !== 'confirmed') return response(403, { error: 'Interview is not assigned to you.', code: 'INTERVIEW_NOT_ASSIGNED' });
    const application = campaignState.applications.find((item) => item.id === interview.applicationId);
    if (!assessmentMatch[2] && method === 'GET') {
      return response(200, {
        ...interviewSummary(interview),
        student: application.studentInfo,
        sop: application.sop,
        cv: { fileName: application.cv.fileName, sizeBytes: application.cv.sizeBytes, downloadPath: `/api/applications/${application.id}/cv` },
        assessment: assessmentOf(interview.id),
      });
    }
    if (assessmentMatch[2] && method === 'POST') {
      if (!interviewSummary(interview).completed) return response(409, { error: 'The interview has not finished yet.', code: 'INTERVIEW_NOT_COMPLETED' });
      if (assessmentOf(interview.id)) return response(409, { error: 'An assessment was already submitted.', code: 'ASSESSMENT_ALREADY_SUBMITTED' });
      const body = JSON.parse(init.body ?? '{}');
      const fieldErrors = {};
      if (typeof body.notes !== 'string' || !body.notes.trim() || body.notes.trim().length > 2000) fieldErrors.notes = 'Vui lòng nhập nhận xét phỏng vấn.';
      if (body.recommendation != null && !['pass', 'fail'].includes(body.recommendation)) fieldErrors.recommendation = 'Must be pass, fail, or null.';
      if (Object.keys(fieldErrors).length) return response(400, { error: 'Assessment fields are invalid.', code: 'VALIDATION_ERROR', fieldErrors });
      const assessment = { id: `as-${application.id}`, interviewId: interview.id, interviewerId: user.id, notes: body.notes.trim(), recommendation: body.recommendation ?? null, submittedAt: campaignState.now };
      campaignState.assessments.push(assessment);
      return response(201, assessment);
    }
  }
  const resultsMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/results(\/publish)?$/u);
  const finalMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/applications\/([^/]+)\/(assessment|final-result)$/u);
  if (resultsMatch || finalMatch) {
    const denied = role('executive');
    if (denied) return denied;
  }
  if (resultsMatch && !resultsMatch[2] && method === 'GET') {
    const confirmed = campaignState.schedule.status === 'confirmed';
    const rows = mode === 'empty' ? [] : confirmedInterviews().map((interview) => {
      const result = campaignState.results.find((item) => item.applicationId === interview.applicationId);
      const { start: _start, end: _end, roomId: _roomId, roomName: _roomName, completed: _completed, ...row } = interviewSummary(interview);
      return { ...row, assessmentSubmitted: Boolean(assessmentOf(interview.id)), decision: result?.decision ?? null, recordedAt: result?.recordedAt ?? null, publishedAt: result?.publishedAt ?? null };
    });
    const rejectedIds = mode === 'empty' ? [] : campaignState.applications.filter((item) => item.screeningStatus === 'rejected').map((item) => item.id);
    return response(200, { scheduleConfirmed: confirmed, interviewDate: campaignState.campaign.interviewDate, rejectedIds, rows });
  }
  if (resultsMatch?.[2] && method === 'POST') {
    if (!campaignState.results.length) return response(409, { error: 'No final results have been recorded.', code: 'NO_RECORDED_RESULTS' });
    const publishedIds = [];
    for (const result of campaignState.results.filter((item) => item.decision && !item.publishedAt)) {
      result.publishedAt = campaignState.now;
      publishedIds.push(result.applicationId);
      const application = campaignState.applications.find((item) => item.id === result.applicationId);
      if (!campaignState.notifications.some((item) => item.applicationId === result.applicationId && item.createdAt === result.publishedAt)) {
        campaignState.notifications.push({ id: `nt-${result.applicationId}`, accountId: application.applicantId, applicationId: result.applicationId, message: `Kết quả hồ sơ ${result.applicationId} đã được công bố: ${result.decision === 'pass' ? 'Pass' : 'Fail'}.`, createdAt: campaignState.now, readAt: null });
      }
    }
    return response(200, { publishedIds });
  }
  if (finalMatch) {
    const application = campaignState.applications.find((item) => item.id === finalMatch[2]);
    if (!application) return response(404, { error: 'Application not found.', code: 'APPLICATION_NOT_FOUND' });
    const interview = confirmedInterviews().find((item) => item.applicationId === application.id);
    if (finalMatch[3] === 'assessment' && method === 'GET') return response(200, interview ? assessmentOf(interview.id) : null);
    if (finalMatch[3] === 'final-result' && method === 'PUT') {
      if (!interview) return response(409, { error: 'Confirm the schedule first.', code: 'SCHEDULE_NOT_CONFIRMED' });
      if (!assessmentOf(interview.id)) return response(409, { error: 'Cần có đánh giá phỏng vấn trước khi ghi nhận quyết định.', code: 'ASSESSMENT_REQUIRED' });
      const { decision } = JSON.parse(init.body ?? '{}');
      if (!['pass', 'fail'].includes(decision)) return response(400, { error: 'Decision is invalid.', code: 'VALIDATION_ERROR', fieldErrors: { decision: 'Must be pass or fail.' } });
      let result = campaignState.results.find((item) => item.applicationId === application.id);
      if (result?.publishedAt) return response(409, { error: 'Kết quả đã công bố, không thể thay đổi.', code: 'RESULT_ALREADY_PUBLISHED' });
      if (!result) {
        result = { applicationId: application.id, publishedAt: null };
        campaignState.results.push(result);
      }
      Object.assign(result, { decision, recordedAt: campaignState.now });
      return response(200, result);
    }
  }
  return null;
}

export function installMockApi() {
  vi.stubGlobal('fetch', vi.fn(handleFetch));
}

resetMockApi();
