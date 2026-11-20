import { readFileSync } from 'node:fs';
import { authenticate, fail, requireRole, validateEmail, wordCount, overlaps, addMinutes } from './domain.mjs';
import { csv, json, matchPath, parseRequestBody, pdf } from './http.mjs';
import {
  campaignPhase,
  clone,
  findApplication,
  findCampaign,
  nextApplicationId,
  nextTime,
  positionFor,
  publicPosition,
} from './state.mjs';

const samplePdf = readFileSync(new URL('../data/sample-cv.pdf', import.meta.url));

function findRoom(state, roomId) {
  return state.resources.rooms.find((room) => room.id === roomId) ?? null;
}

function findUser(state, userId) {
  return state.users.find((user) => user.id === userId) ?? null;
}

function interviewerName(state, interviewerId) {
  return findUser(state, interviewerId)?.displayName ?? null;
}

function expandedAssignment(state, campaign, assignment) {
  return {
    interviewerId: assignment.interviewerId,
    interviewerName: interviewerName(state, assignment.interviewerId),
    positionIds: clone(assignment.positionIds),
    positionNames: assignment.positionIds.map((id) => positionFor(campaign, id)?.name).filter(Boolean),
    availability: clone(assignment.availability),
    availabilityText: assignment.availability
      .map(({ start, end }) => `${start.slice(11, 16)}-${end.slice(11, 16)}`)
      .join(', '),
  };
}

function campaignView(state, campaign) {
  const applications = state.applications.filter((application) => application.campaignId === campaign.id);
  const schedule = state.schedules[campaign.id];
  const confirmed = schedule?.status === 'confirmed';
  const setupLocked = confirmed || applications.length > 0;
  return {
    campaign: campaignFields(campaign),
    phase: campaignPhase(campaign),
    positions: campaign.positions.map((position) => ({
      ...clone(position),
      applicationCount: applications.filter((application) => application.positionId === position.id).length,
    })),
    slots: clone(campaign.slots),
    interviewSetup: {
      interviewers: state.users
        .filter((user) => user.role === 'interviewer')
        .map((user) => ({ id: user.id, name: user.displayName })),
      rooms: clone(state.resources.rooms),
      assignments: campaign.assignments.map((assignment) => expandedAssignment(state, campaign, assignment)),
      roomIds: clone(campaign.roomIds),
      locked: setupLocked,
      lockReason: confirmed ? 'scheduleConfirmed' : applications.length > 0 ? 'applicationExists' : null,
    },
    locked: confirmed,
    lockReason: confirmed ? 'scheduleConfirmed' : null,
  };
}

function campaignFields(campaign) {
  const {
    positions: _positions,
    slots: _slots,
    roomIds: _roomIds,
    assignments: _assignments,
    ...fields
  } = campaign;
  return clone(fields);
}

function applicantApplication(state, application) {
  const campaign = findCampaign(state, application.campaignId);
  const position = positionFor(campaign, application.positionId);
  const schedule = state.schedules[application.campaignId];
  const interview = schedule?.status === 'confirmed'
    ? schedule.rows.find((row) => row.applicationId === application.id)
    : null;
  const result = state.results.find((item) => item.applicationId === application.id && item.publishedAt);
  return {
    id: application.id,
    campaignId: application.campaignId,
    campaignName: campaign.name,
    positionId: application.positionId,
    positionName: position.name,
    submittedAt: application.submittedAt,
    screeningStatus: application.screeningStatus,
    confirmedInterview: interview
      ? {
          interviewId: interview.interviewId,
          start: interview.start,
          end: interview.end,
          roomName: interview.roomName,
        }
      : null,
    result: result ? { decision: result.decision, publishedAt: result.publishedAt } : null,
  };
}

function reviewSummary(state, application) {
  const campaign = findCampaign(state, application.campaignId);
  return {
    id: application.id,
    applicantId: application.applicantId,
    applicantName: application.studentInfo.name,
    positionId: application.positionId,
    positionName: positionFor(campaign, application.positionId).name,
    submittedAt: application.submittedAt,
    screeningStatus: application.screeningStatus,
  };
}

function availabilityText(campaign, slotIds) {
  return slotIds
    .map((slotId) => campaign.slots.find((slot) => slot.id === slotId))
    .filter(Boolean)
    .map((slot) => `${slot.start.slice(11, 16)}-${slot.end.slice(11, 16)}`)
    .join(', ');
}

function reviewDetail(state, application) {
  const campaign = findCampaign(state, application.campaignId);
  const position = positionFor(campaign, application.positionId);
  const schedule = state.schedules[campaign.id];
  return {
    ...reviewSummary(state, application),
    student: clone(application.studentInfo),
    availabilityText: availabilityText(campaign, application.slotIds),
    sop: application.sop,
    cv: {
      fileName: application.cv.fileName,
      sizeBytes: application.cv.sizeBytes,
      downloadPath: `/api/applications/${application.id}/cv`,
    },
    reviewedAt: application.reviewedAt,
    privateNote: application.privateNote,
    siblingIds: state.applications
      .filter((candidate) => candidate.applicantId === application.applicantId && candidate.id !== application.id)
      .map((candidate) => candidate.id),
    locked: schedule?.status === 'confirmed',
    positionName: position.name,
  };
}

function statsFor(applications) {
  return {
    applications: applications.length,
    applicants: new Set(applications.map((application) => application.applicantId)).size,
    pendingReview: applications.filter((application) => application.screeningStatus === 'pendingReview').length,
    shortlisted: applications.filter((application) => application.screeningStatus === 'shortlisted').length,
    rejected: applications.filter((application) => application.screeningStatus === 'rejected').length,
  };
}

function errorForCampaign(state, campaignId) {
  const campaign = findCampaign(state, campaignId);
  if (!campaign) fail(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found.');
  return campaign;
}

function executive(state, headers) {
  const user = authenticate(state, headers);
  requireRole(user, 'executive');
  return user;
}

function applicant(state, headers) {
  const user = authenticate(state, headers);
  requireRole(user, 'applicant');
  return user;
}

function interviewer(state, headers) {
  const user = authenticate(state, headers);
  requireRole(user, 'interviewer');
  return user;
}

function validateCampaignBody(body, { publish = false } = {}) {
  const fieldErrors = {};
  const stringRules = { name: 120, hostClub: 120, description: 4000, instructions: 2000 };
  for (const [field, maximum] of Object.entries(stringRules)) {
    if ((publish || Object.hasOwn(body, field)) && (typeof body[field] !== 'string' || !body[field].trim() || body[field].length > maximum)) {
      fieldErrors[field] = `Must be a non-blank string of at most ${maximum} characters.`;
    }
  }
  if (body.slotMinutes !== undefined && ![15, 20, 30].includes(body.slotMinutes)) fieldErrors.slotMinutes = 'Must be 15, 20, or 30.';
  if (body.interviewWindow && (!(body.interviewWindow.start < body.interviewWindow.end))) fieldErrors.interviewWindow = 'Start must be before end.';
  if (body.opensOn && body.closesOn && body.opensOn > body.closesOn) fieldErrors.closesOn = 'Closing date must not precede opening date.';
  if (body.closesOn && body.interviewDate && body.closesOn >= body.interviewDate) fieldErrors.interviewDate = 'Interview date must follow closing date.';
  if (body.positions !== undefined && !Array.isArray(body.positions)) fieldErrors.positions = 'Must be an array.';
  if (Array.isArray(body.positions)) {
    body.positions.forEach((position, index) => {
      if (!position.name?.trim()) fieldErrors[`positions.${index}.name`] = 'Name is required.';
      if (!Number.isInteger(position.quota) || position.quota < 1) fieldErrors[`positions.${index}.quota`] = 'Quota must be a positive integer.';
    });
  }
  if (Object.keys(fieldErrors).length) fail(400, 'VALIDATION_ERROR', 'Campaign fields are invalid.', { fieldErrors });
}

function slug(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/[^a-z0-9]+/gu, '-').replace(/(^-|-$)/gu, '');
}

function createSlots(campaign) {
  const slots = [];
  const startHour = Number(campaign.interviewWindow.start.slice(0, 2));
  const endHour = Number(campaign.interviewWindow.end.slice(0, 2));
  for (let hour = startHour; hour < endHour; hour += 1) {
    const time = String(hour).padStart(2, '0');
    const end = String(hour + 1).padStart(2, '0');
    slots.push({
      id: `slot-${time}00`,
      start: `${campaign.interviewDate}T${time}:00:00+07:00`,
      end: `${campaign.interviewDate}T${end}:00:00+07:00`,
    });
  }
  return slots;
}

function upsertPositions(campaign, incoming) {
  if (!incoming) return;
  const prefix = campaign.id.includes('2027') ? 'pos-2027' : `pos-${campaign.id.replace(/^cmp-/u, '')}`;
  const next = [];
  for (const item of incoming) {
    const existing = item.id ? campaign.positions.find((position) => position.id === item.id) : null;
    const departmentName = item.departmentName ?? existing?.departmentName ?? 'General';
    const position = {
      ...(existing ?? {}),
      ...clone(item),
      id: existing?.id ?? `${prefix}-${slug(item.name)}`,
      departmentId: existing?.departmentId ?? `dep-${slug(departmentName)}`,
      departmentName,
    };
    next.push(position);
  }
  campaign.positions = next;
}

function validateSetup(state, campaign, body) {
  const fieldErrors = {};
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(body.interviewDate ?? '') || body.interviewDate <= campaign.closesOn) fieldErrors.interviewDate = 'Must be a date after campaign closing.';
  if (!body.interviewWindow || !(body.interviewWindow.start < body.interviewWindow.end)) fieldErrors.interviewWindow = 'A valid start/end window is required.';
  if (![15, 20, 30].includes(body.slotMinutes)) fieldErrors.slotMinutes = 'Must be 15, 20, or 30.';
  if (!Array.isArray(body.roomIds) || body.roomIds.length === 0 || new Set(body.roomIds).size !== body.roomIds.length || body.roomIds.some((id) => !findRoom(state, id))) fieldErrors.roomIds = 'Select at least one unique existing room.';
  if (!Array.isArray(body.assignments) || body.assignments.length === 0) fieldErrors.assignments = 'At least one assignment is required.';
  else {
    const seen = new Set();
    body.assignments.forEach((assignment, index) => {
      if (seen.has(assignment.interviewerId) || !findUser(state, assignment.interviewerId) || findUser(state, assignment.interviewerId).role !== 'interviewer') fieldErrors[`assignments.${index}.interviewerId`] = 'Choose a unique interviewer.';
      seen.add(assignment.interviewerId);
      if (!Array.isArray(assignment.positionIds) || !assignment.positionIds.length || assignment.positionIds.some((id) => !positionFor(campaign, id))) fieldErrors[`assignments.${index}.positionIds`] = 'Choose campaign positions.';
      if (!Array.isArray(assignment.availability) || !assignment.availability.length || assignment.availability.some((slot) => !(slot.start < slot.end) || !slot.start.startsWith(`${body.interviewDate}T`) || !slot.end.startsWith(`${body.interviewDate}T`))) fieldErrors[`assignments.${index}.availability`] = 'Availability must be valid intervals on the interview date.';
    });
  }
  if (Object.keys(fieldErrors).length) fail(400, 'VALIDATION_ERROR', 'Interview setup is invalid.', { fieldErrors });
}

function scheduleSummary(rows, confirmed = false) {
  return {
    total: rows.length,
    proposed: confirmed ? 0 : rows.filter((row) => row.status === 'proposed').length,
    conflict: rows.filter((row) => row.status === 'conflict').length,
    unassigned: rows.filter((row) => row.status === 'unassigned').length,
  };
}

function recalculateRows(rows, unassignedReasons = {}) {
  for (const row of rows) {
    row.reasons = [];
    row.conflictWith = [];
    row.status = row.start && row.interviewerId && row.roomId ? 'proposed' : 'unassigned';
    if (row.status === 'unassigned') row.reasons.push(unassignedReasons[row.applicationId] ?? 'The deterministic draft left this application for manual assignment.');
  }
  for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
      const left = rows[leftIndex];
      const right = rows[rightIndex];
      if (!overlaps(left, right)) continue;
      const reasons = [];
      if (left.applicantId === right.applicantId) reasons.push(`Applicant ${left.applicantName} overlaps`);
      if (left.interviewerId && left.interviewerId === right.interviewerId) reasons.push(`Interviewer ${left.interviewerName} overlaps`);
      if (left.roomId && left.roomId === right.roomId) reasons.push(`Room ${left.roomName} overlaps`);
      if (!reasons.length) continue;
      left.status = 'conflict';
      right.status = 'conflict';
      left.conflictWith.push(right.applicationId);
      right.conflictWith.push(left.applicationId);
      left.reasons.push(...reasons.map((reason) => `${reason} with application ${right.applicationId}.`));
      right.reasons.push(...reasons.map((reason) => `${reason} with application ${left.applicationId}.`));
    }
  }
}

/** "A01", "A01 and A02", "A01, A02 and A03" for the rows' application ids. */
function namesOf(rows) {
  const ids = rows.map((row) => row.applicationId);
  return ids.length > 1 ? `${ids.slice(0, -1).join(', ')} and ${ids[ids.length - 1]}` : ids[0] ?? '';
}

function scheduleConditions(state, campaign, schedule) {
  const applications = state.applications.filter((application) => application.campaignId === campaign.id);
  const shortlisted = applications.filter((application) => application.screeningStatus === 'shortlisted');
  const closed = campaignPhase(campaign) === 'closed';
  const reviewed = applications.every((application) => application.screeningStatus !== 'pendingReview');
  const saved = schedule.status !== 'none' && !schedule.dirty && Boolean(schedule.savedAt);
  const assigned = shortlisted.length > 0 && schedule.rows.length === shortlisted.length && schedule.rows.every((row) => row.status !== 'unassigned');
  const conflictFree = schedule.rows.length > 0 && schedule.rows.every((row) => row.status !== 'conflict');
  const unassignedRows = schedule.rows.filter((row) => row.status === 'unassigned');
  const conflictRows = schedule.rows.filter((row) => row.status === 'conflict');
  return [
    { code: 'APPLICATIONS_CLOSED', label: 'Applications are closed', met: closed, detail: closed ? 'Closed.' : 'Applications remain open.' },
    { code: 'ALL_REVIEWED', label: 'All applications are reviewed', met: reviewed, detail: `${applications.filter((item) => item.screeningStatus !== 'pendingReview').length} of ${applications.length} applications reviewed.` },
    { code: 'DRAFT_SAVED', label: 'Draft changes are saved', met: saved, detail: saved ? 'Saved.' : schedule.status === 'none' ? 'Generate and save a draft.' : 'Unsaved generated draft.' },
    { code: 'ALL_ASSIGNED', label: 'Every shortlisted application is assigned', met: assigned, detail: assigned ? `${shortlisted.length} of ${shortlisted.length} assigned.` : unassignedRows.length ? `${namesOf(unassignedRows)} ${unassignedRows.length > 1 ? 'are' : 'is'} unassigned.` : `${shortlisted.length} shortlisted applications need assignments.` },
    { code: 'NO_CONFLICTS', label: 'No conflicts remain', met: conflictFree, detail: conflictFree ? 'No conflicts.' : conflictRows.length ? `${namesOf(conflictRows)} ${conflictRows.length > 1 ? 'conflict' : 'conflicts'}.` : 'Generate and review a draft.' },
  ];
}

function canConfirm(state, campaign, schedule) {
  return schedule.status === 'draft' && scheduleConditions(state, campaign, schedule).every((condition) => condition.met);
}

/** Date, window and duration of the draft: chosen at Generate, else the campaign's. */
function scheduleSettings(campaign, schedule) {
  return schedule?.settings ?? { interviewDate: campaign.interviewDate, interviewWindow: clone(campaign.interviewWindow), slotMinutes: campaign.slotMinutes };
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/u;
const minutesOf = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

function validateGenerateSettings(campaign, body) {
  const fieldErrors = {};
  const date = body?.interviewDate;
  const window = body?.interviewWindow;
  const slotMinutes = body?.slotMinutes;
  if (date === undefined || date === null || date === '') fieldErrors.interviewDate = 'Interview date is required.';
  else if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00+07:00`))) fieldErrors.interviewDate = 'Use a YYYY-MM-DD date.';
  else if (date <= campaign.closesOn) fieldErrors.interviewDate = 'Interview date must be after the campaign closes.';
  if (window === undefined || window === null) fieldErrors.interviewWindow = 'A start and an end time are required.';
  else if (typeof window !== 'object' || !TIME.test(window.start ?? '') || !TIME.test(window.end ?? '')) fieldErrors.interviewWindow = 'Use HH:MM start and end times.';
  else if (!(window.start < window.end)) fieldErrors.interviewWindow = 'Start must be before end.';
  if (slotMinutes === undefined || slotMinutes === null) fieldErrors.slotMinutes = 'Duration is required.';
  else if (![15, 20, 30].includes(slotMinutes)) fieldErrors.slotMinutes = 'Must be 15, 20, or 30.';
  if (!fieldErrors.interviewWindow && !fieldErrors.slotMinutes && minutesOf(window.end) - minutesOf(window.start) < slotMinutes) fieldErrors.interviewWindow = 'The window must fit at least one interview.';
  if (Object.keys(fieldErrors).length) fail(400, 'VALIDATION_ERROR', 'Schedule settings are invalid.', { fieldErrors });
  return { interviewDate: date, interviewWindow: { start: window.start, end: window.end }, slotMinutes };
}

function scheduleProjection(state, campaign, schedule) {
  const confirmed = schedule.status === 'confirmed';
  const settings = scheduleSettings(campaign, schedule);
  return {
    settings: {
      interviewDate: settings.interviewDate,
      interviewWindow: clone(settings.interviewWindow),
      slotMinutes: settings.slotMinutes,
      roomIds: clone(campaign.roomIds),
    },
    assignments: campaign.assignments.map((assignment) => expandedAssignment(state, campaign, assignment)),
    rooms: clone(state.resources.rooms),
    rows: clone(schedule.rows),
    summary: scheduleSummary(schedule.rows, confirmed),
    conditions: scheduleConditions(state, campaign, schedule),
    status: schedule.status,
    dirty: schedule.dirty,
    generatedAt: schedule.generatedAt,
    savedAt: schedule.savedAt,
    confirmedAt: schedule.confirmedAt,
    canConfirm: canConfirm(state, campaign, schedule),
    zeroShortlisted: !state.applications.some((application) => application.campaignId === campaign.id && application.screeningStatus === 'shortlisted'),
  };
}

function emptySchedule() {
  return { status: 'none', dirty: false, generatedAt: null, savedAt: null, confirmedAt: null, rows: [] };
}

function fullInterviewRow(state, campaign, application, values = {}, slotMinutes = campaign.slotMinutes) {
  const position = positionFor(campaign, application.positionId);
  const user = values.interviewerId ? findUser(state, values.interviewerId) : null;
  const room = values.roomId ? findRoom(state, values.roomId) : null;
  return {
    interviewId: `int-${application.id}`,
    applicationId: application.id,
    applicantId: application.applicantId,
    applicantName: application.studentInfo.name,
    positionId: application.positionId,
    positionName: position.name,
    availabilityText: availabilityText(campaign, application.slotIds),
    start: values.start ?? null,
    end: values.start ? addMinutes(values.start, slotMinutes) : null,
    interviewerId: values.interviewerId ?? null,
    interviewerName: user?.displayName ?? null,
    roomId: values.roomId ?? null,
    roomName: room?.name ?? null,
    status: values.start ? 'proposed' : 'unassigned',
    reasons: [],
    conflictWith: [],
  };
}

function interviewDetail(state, row) {
  const application = findApplication(state, row.applicationId);
  const campaign = findCampaign(state, application.campaignId);
  const assessment = state.assessments.find((item) => item.interviewId === row.interviewId) ?? null;
  return {
    interviewId: row.interviewId,
    applicationId: row.applicationId,
    applicantName: row.applicantName,
    positionId: row.positionId,
    positionName: row.positionName,
    start: row.start,
    end: row.end,
    roomId: row.roomId,
    roomName: row.roomName,
    completed: true,
    student: clone(application.studentInfo),
    availabilityText: availabilityText(campaign, application.slotIds),
    sop: application.sop,
    cv: { fileName: application.cv.fileName, sizeBytes: application.cv.sizeBytes, downloadPath: `/api/applications/${application.id}/cv` },
    assessment: assessment ? clone(assessment) : null,
  };
}

function findInterview(state, interviewId) {
  for (const schedule of Object.values(state.schedules)) {
    const row = schedule.rows.find((candidate) => candidate.interviewId === interviewId);
    if (row) return { row, schedule };
  }
  return null;
}

export async function routeRequest({ request, state }) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;
  const method = request.method;

  if (method === 'GET' && pathname === '/api/health') return json(200, { status: 'ok' });

  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseRequestBody(request);
    if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') fail(400, 'INVALID_REQUEST', 'Username and password are required.');
    const user = state.users.find((candidate) => candidate.handle === body.username);
    if (!user || body.password !== state.resources.password) fail(401, 'INVALID_CREDENTIALS', 'Username or password is incorrect.');
    return json(200, { token: `mock-token-${user.handle}`, user: clone(user) });
  }

  if (method === 'GET' && pathname === '/api/auth/me') return json(200, clone(authenticate(state, request.headers)));
  if (method === 'POST' && pathname === '/api/auth/logout') {
    authenticate(state, request.headers);
    return new Response(null, { status: 204 });
  }
  if (method === 'GET' && pathname === '/api/me/profile') {
    const { handle: _handle, description: _description, ...profile } = authenticate(state, request.headers);
    return json(200, clone(profile));
  }
  if (method === 'PATCH' && pathname === '/api/me/profile') {
    const user = authenticate(state, request.headers);
    const body = await parseRequestBody(request);
    const fieldErrors = {};
    if (!body?.displayName?.trim()) fieldErrors.displayName = 'Display name is required.';
    if (!validateEmail(body?.email)) fieldErrors.email = 'A valid email is required.';
    if (Object.keys(fieldErrors).length) fail(400, 'VALIDATION_ERROR', 'Profile fields are invalid.', { fieldErrors });
    if (state.users.some((candidate) => candidate.id !== user.id && candidate.email.toLowerCase() === body.email.toLowerCase())) fail(409, 'EMAIL_ALREADY_USED', 'That email is already in use.');
    user.displayName = body.displayName.trim();
    user.email = body.email.trim();
    const { handle: _handle, description: _description, ...profile } = user;
    return json(200, clone(profile));
  }

  if (method === 'GET' && pathname === '/api/campaigns/current') {
    const campaign = state.campaigns.find((candidate) => candidate.status === 'published' && campaignPhase(candidate) !== 'before-open')
      ?? state.campaigns.find((candidate) => candidate.status === 'published');
    if (!campaign) fail(404, 'NO_PUBLIC_CAMPAIGN', 'No published campaign is available.');
    return json(200, {
      campaign: campaignFields(campaign),
      phase: campaignPhase(campaign),
      acceptingApplications: campaignPhase(campaign) === 'open',
      positions: campaign.positions.map(publicPosition),
      slots: clone(campaign.slots),
    });
  }

  if (method === 'POST' && pathname === '/api/applications') {
    const user = applicant(state, request.headers);
    const form = await parseRequestBody(request);
    if (!(form instanceof FormData)) fail(400, 'INVALID_REQUEST', 'Multipart form data is required.');
    const campaignId = form.get('campaignId');
    const positionId = form.get('positionId');
    const campaign = findCampaign(state, campaignId);
    if (!campaign) fail(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found.');
    const position = positionFor(campaign, positionId);
    if (!position) fail(404, 'POSITION_NOT_FOUND', 'Position not found.');
    if (campaignPhase(campaign) !== 'open') fail(409, 'APPLICATIONS_CLOSED', 'Applications are closed.');
    const duplicate = state.applications.find((item) => item.campaignId === campaignId && item.applicantId === user.id && item.positionId === positionId);
    if (duplicate) fail(409, 'DUPLICATE_APPLICATION', 'An application for this position already exists.', { details: { existingApplicationId: duplicate.id } });
    const email = form.get('email');
    const faculty = form.get('faculty');
    const sop = form.get('sop');
    const slotIds = form.getAll('slotIds').map(String);
    const cv = form.get('cv');
    const fieldErrors = {};
    if (!validateEmail(email)) fieldErrors.email = 'A valid email is required.';
    if (typeof faculty !== 'string' || !faculty.trim() || faculty.length > 120) fieldErrors.faculty = 'Faculty is required and limited to 120 characters.';
    if (wordCount(sop) < 1 || wordCount(sop) > 300) fieldErrors.sop = 'Statement must contain 1-300 words.';
    if (!slotIds.length || new Set(slotIds).size !== slotIds.length || slotIds.some((id) => !campaign.slots.some((slot) => slot.id === id))) fieldErrors.slotIds = 'Choose at least one unique campaign slot.';
    if (!cv || typeof cv.arrayBuffer !== 'function' || cv.type !== 'application/pdf' || cv.size > 5 * 1024 * 1024) fieldErrors.cv = 'Upload one PDF no larger than 5 MB.';
    let cvBytes = samplePdf;
    if (!fieldErrors.cv) {
      cvBytes = Buffer.from(await cv.arrayBuffer());
      if (!cvBytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) fieldErrors.cv = 'The uploaded file must contain PDF data.';
    }
    if (Object.keys(fieldErrors).length) fail(400, 'VALIDATION_ERROR', 'Application fields are invalid.', { fieldErrors });
    const id = nextApplicationId(state);
    const application = {
      id,
      campaignId,
      applicantId: user.id,
      positionId,
      submittedAt: nextTime(state, Math.min(state.applications.length, 2)),
      slotIds,
      sop: sop.trim(),
      cv: { fileName: cv.name || 'cv.pdf', sizeBytes: cvBytes.byteLength, content: cvBytes.toString('base64') },
      screeningStatus: 'pendingReview',
      reviewedAt: null,
      privateNote: '',
      studentInfo: { name: user.displayName, studentId: user.studentId, email, faculty: faculty.trim(), year: user.year },
    };
    state.applications.push(application);
    return json(201, {
      id,
      campaignId,
      applicantId: user.id,
      positionId,
      positionName: position.name,
      submittedAt: application.submittedAt,
      slotIds,
      sop: application.sop,
      cv: { fileName: application.cv.fileName, sizeBytes: application.cv.sizeBytes },
      screeningStatus: application.screeningStatus,
      confirmedInterview: null,
      result: null,
    });
  }

  if (method === 'GET' && pathname === '/api/me/applications') {
    const user = applicant(state, request.headers);
    const campaignId = searchParams.get('campaignId');
    if (campaignId && !findCampaign(state, campaignId)) fail(400, 'INVALID_QUERY', 'Unknown campaignId.');
    const items = state.applications
      .filter((item) => item.applicantId === user.id && (!campaignId || item.campaignId === campaignId))
      .map((item) => applicantApplication(state, item));
    return json(200, { items });
  }

  let params = matchPath(pathname, '/api/campaigns/:campaignId/close-applications');
  if (method === 'POST' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    if (state.schedules[campaign.id]?.status === 'confirmed') fail(409, 'CAMPAIGN_LOCKED', 'The confirmed campaign is locked.');
    if (campaignPhase(campaign) !== 'open') fail(409, 'CAMPAIGN_NOT_ACCEPTING', 'Campaign is not accepting applications.');
    campaign.applicationsClosedAt = nextTime(state, 3);
    return json(200, { campaign: { id: campaign.id, name: campaign.name, status: campaign.status, applicationsClosedAt: campaign.applicationsClosedAt }, phase: 'closed', acceptingApplications: false });
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/applications.csv');
  if (method === 'GET' && params) {
    executive(state, request.headers);
    errorForCampaign(state, params.campaignId);
    let items = filterApplications(state, params.campaignId, searchParams);
    const lines = ['Application ID,Applicant,Student ID,Email,Position,Submitted At,Status'];
    lines.push(...items.map((item) => {
      const campaign = findCampaign(state, item.campaignId);
      return [item.id, item.studentInfo.name, item.studentInfo.studentId, item.studentInfo.email, positionFor(campaign, item.positionId).name, item.submittedAt, item.screeningStatus].join(',');
    }));
    return csv(`${lines.join('\n')}\n`, 'clubflow-applications.csv');
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/applications');
  if (method === 'GET' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    const all = state.applications.filter((item) => item.campaignId === campaign.id);
    const filtered = filterApplications(state, campaign.id, searchParams);
    const page = parsePositive(searchParams.get('page'), 1, 'page');
    const pageSize = parsePositive(searchParams.get('pageSize'), 5, 'pageSize', 50);
    const offset = (page - 1) * pageSize;
    return json(200, {
      items: filtered.slice(offset, offset + pageSize).map((item) => reviewSummary(state, item)),
      total: filtered.length,
      page,
      pageSize,
      pageCount: filtered.length ? Math.ceil(filtered.length / pageSize) : 0,
      stats: { campaign: statsFor(all), filtered: statsFor(filtered), isFiltered: ['search', 'positionId', 'status'].some((key) => searchParams.has(key)) },
      positions: campaign.positions.map((position) => ({ id: position.id, name: position.name })),
    });
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/applications/:applicationId/private-note');
  if (method === 'PATCH' && params) {
    executive(state, request.headers);
    const application = applicationInCampaign(state, params);
    if (state.schedules[params.campaignId]?.status === 'confirmed') fail(409, 'SCHEDULE_CONFIRMED', 'The confirmed schedule locks review records.');
    const body = await parseRequestBody(request);
    if (typeof body?.note !== 'string' || body.note.length > 2000) fail(400, 'VALIDATION_ERROR', 'Private note is invalid.', { fieldErrors: { note: 'Must be a string of at most 2000 characters.' } });
    application.privateNote = body.note;
    return json(200, { id: application.id, privateNote: application.privateNote, screeningStatus: application.screeningStatus, locked: false });
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/applications/:applicationId/screening-decision');
  if (method === 'POST' && params) {
    executive(state, request.headers);
    const application = applicationInCampaign(state, params);
    if (state.schedules[params.campaignId]?.status === 'confirmed') fail(409, 'SCHEDULE_CONFIRMED', 'The confirmed schedule locks review records.');
    if (application.screeningStatus !== 'pendingReview') fail(409, 'SCREENING_ALREADY_DECIDED', 'Screening has already been decided.');
    const body = await parseRequestBody(request);
    if (!['shortlisted', 'rejected'].includes(body?.decision)) fail(400, 'VALIDATION_ERROR', 'Decision is invalid.', { fieldErrors: { decision: 'Must be shortlisted or rejected.' } });
    application.screeningStatus = body.decision;
    application.reviewedAt = nextTime(state);
    return json(200, { id: application.id, screeningStatus: application.screeningStatus, reviewedAt: application.reviewedAt });
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/applications/:applicationId/assessment');
  if (method === 'GET' && params) {
    executive(state, request.headers);
    const application = applicationInCampaign(state, params);
    const assessment = state.assessments.find((item) => item.interviewId === `int-${application.id}`) ?? null;
    return json(200, assessment ? clone(assessment) : null);
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/applications/:applicationId/final-result');
  if (method === 'PUT' && params) {
    executive(state, request.headers);
    const application = applicationInCampaign(state, params);
    if (state.schedules[params.campaignId]?.status !== 'confirmed') fail(409, 'SCHEDULE_NOT_CONFIRMED', 'Confirm the schedule first.');
    if (!state.assessments.some((item) => item.interviewId === `int-${application.id}`)) fail(409, 'ASSESSMENT_REQUIRED', 'An assessment is required.');
    const body = await parseRequestBody(request);
    if (!['pass', 'fail'].includes(body?.decision)) fail(400, 'VALIDATION_ERROR', 'Decision is invalid.', { fieldErrors: { decision: 'Must be pass or fail.' } });
    let result = state.results.find((item) => item.applicationId === application.id);
    if (result?.publishedAt) fail(409, 'RESULT_ALREADY_PUBLISHED', 'Published results are immutable.');
    if (!result) {
      result = { applicationId: application.id, decision: body.decision, recordedAt: nextTime(state), publishedAt: null };
      state.results.push(result);
    } else {
      result.decision = body.decision;
      result.recordedAt = nextTime(state);
    }
    return json(200, clone(result));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/applications/:applicationId');
  if (method === 'GET' && params) {
    executive(state, request.headers);
    return json(200, reviewDetail(state, applicationInCampaign(state, params)));
  }

  params = matchPath(pathname, '/api/applications/:applicationId/cv');
  if (method === 'GET' && params) {
    const user = authenticate(state, request.headers);
    const application = findApplication(state, params.applicationId);
    if (!application) fail(404, 'APPLICATION_NOT_FOUND', 'Application not found.');
    const schedule = state.schedules[application.campaignId];
    const assigned = schedule?.status === 'confirmed' && schedule.rows.some((row) => row.applicationId === application.id && row.interviewerId === user.id);
    if (!(user.role === 'executive' || application.applicantId === user.id || assigned)) fail(403, 'CV_FORBIDDEN', 'You cannot access this CV.');
    const bytes = application.cv.content ? Buffer.from(application.cv.content, 'base64') : samplePdf;
    return pdf(bytes, application.cv.fileName);
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/schedule/draft/generate');
  if (method === 'POST' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    if (state.schedules[campaign.id]?.status === 'confirmed') fail(409, 'SCHEDULE_CONFIRMED', 'Schedule is already confirmed.');
    if (campaignPhase(campaign) !== 'closed') fail(409, 'APPLICATIONS_STILL_OPEN', 'Applications must close first.');
    const applications = state.applications.filter((item) => item.campaignId === campaign.id);
    if (applications.some((item) => item.screeningStatus === 'pendingReview')) fail(409, 'UNREVIEWED_APPLICATIONS', 'Review every application first.');
    const shortlisted = applications.filter((item) => item.screeningStatus === 'shortlisted');
    if (!shortlisted.length) fail(409, 'NO_SHORTLISTED_APPLICATIONS', 'There are no shortlisted applications.');
    const settings = validateGenerateSettings(campaign, await parseRequestBody(request));
    // Fixed PA#3 draft: the first two shortlisted applications start at the
    // window's start (a real Conflict for Student A); the rest stay Unassigned.
    // A placed row whose applicant or interviewer is not free then is left
    // Unassigned with that reason instead.
    const start = `${settings.interviewDate}T${settings.interviewWindow.start}:00+07:00`;
    const end = addMinutes(start, settings.slotMinutes);
    const unassignedReasons = {};
    const rows = shortlisted.map((application, index) => {
      if (index > 1) return fullInterviewRow(state, campaign, application, {}, settings.slotMinutes);
      const assignment = campaign.assignments.find((item) => item.positionIds.includes(application.positionId));
      const applicantFree = application.slotIds.some((slotId) => {
        const slot = campaign.slots.find((item) => item.id === slotId);
        return slot && start >= slot.start && end <= slot.end;
      });
      const interviewerFree = assignment?.availability.some((slot) => start >= slot.start && end <= slot.end);
      if (!applicantFree || !interviewerFree) {
        unassignedReasons[application.id] = applicantFree
          ? 'No assigned interviewer is available at the start of the chosen window.'
          : 'The applicant is not available at the start of the chosen window.';
        return fullInterviewRow(state, campaign, application, {}, settings.slotMinutes);
      }
      return fullInterviewRow(state, campaign, application, { start, interviewerId: assignment.interviewerId, roomId: campaign.roomIds[index] ?? campaign.roomIds[0] }, settings.slotMinutes);
    });
    recalculateRows(rows, unassignedReasons);
    const schedule = { status: 'draft', dirty: true, generatedAt: nextTime(state, 7), savedAt: null, confirmedAt: null, settings, unassignedReasons, rows };
    state.schedules[campaign.id] = schedule;
    return json(200, scheduleProjection(state, campaign, schedule));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/schedule/draft/rows/:applicationId');
  if (method === 'PATCH' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    const schedule = state.schedules[campaign.id];
    if (!schedule || schedule.status === 'none') fail(409, 'NO_DRAFT', 'Generate a draft first.');
    if (schedule.status === 'confirmed') fail(409, 'SCHEDULE_CONFIRMED', 'Schedule is already confirmed.');
    const row = schedule.rows.find((item) => item.applicationId === params.applicationId);
    if (!row) fail(409, 'APPLICATION_NOT_SHORTLISTED', 'Application is not shortlisted in this draft.');
    const body = await parseRequestBody(request);
    const settings = scheduleSettings(campaign, schedule);
    const assignment = campaign.assignments.find((item) => item.interviewerId === body?.interviewerId && item.positionIds.includes(row.positionId));
    const room = body?.roomId && campaign.roomIds.includes(body.roomId) ? findRoom(state, body.roomId) : null;
    const end = typeof body?.start === 'string' ? addMinutes(body.start, settings.slotMinutes) : null;
    const fieldErrors = {};
    if (!body?.start || !end || !body.start.startsWith(`${settings.interviewDate}T`) || body.start.slice(11, 16) < settings.interviewWindow.start || end.slice(11, 16) > settings.interviewWindow.end) fieldErrors.start = 'Start must align within the draft window.';
    if (!assignment || !assignment.availability.some((slot) => body.start >= slot.start && end <= slot.end)) fieldErrors.interviewerId = 'Choose an eligible and available interviewer.';
    if (!room) fieldErrors.roomId = 'Choose a selected campaign room.';
    const application = findApplication(state, row.applicationId);
    const available = application.slotIds.some((slotId) => {
      const slot = campaign.slots.find((item) => item.id === slotId);
      return slot && body.start >= slot.start && end <= slot.end;
    });
    if (!available) fieldErrors.start = 'Start must be inside applicant availability.';
    if (Object.keys(fieldErrors).length) fail(400, 'VALIDATION_ERROR', 'Schedule row is invalid.', { fieldErrors });
    Object.assign(row, { start: body.start, end, interviewerId: assignment.interviewerId, interviewerName: interviewerName(state, assignment.interviewerId), roomId: room.id, roomName: room.name });
    schedule.dirty = true;
    recalculateRows(schedule.rows, schedule.unassignedReasons);
    return json(200, scheduleProjection(state, campaign, schedule));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/schedule/draft/save');
  if (method === 'POST' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    const schedule = state.schedules[campaign.id];
    if (!schedule || schedule.status === 'none') fail(409, 'NO_DRAFT', 'Generate a draft first.');
    if (schedule.status === 'confirmed') fail(409, 'SCHEDULE_CONFIRMED', 'Schedule is already confirmed.');
    schedule.dirty = false;
    schedule.savedAt = nextTime(state, 8);
    return json(200, scheduleProjection(state, campaign, schedule));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/schedule/confirm');
  if (method === 'POST' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    const schedule = state.schedules[campaign.id];
    if (schedule?.status === 'confirmed') fail(409, 'SCHEDULE_ALREADY_CONFIRMED', 'Schedule is already confirmed.');
    if (!schedule || !canConfirm(state, campaign, schedule)) fail(409, 'SCHEDULE_NOT_READY', 'Schedule cannot be confirmed.', { details: { conditions: scheduleConditions(state, campaign, schedule ?? emptySchedule()) } });
    schedule.status = 'confirmed';
    schedule.confirmedAt = nextTime(state, 9);
    schedule.rows.forEach((row) => { row.status = 'confirmed'; });
    return json(200, scheduleProjection(state, campaign, schedule));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/schedule.csv');
  if (method === 'GET' && params) {
    executive(state, request.headers);
    errorForCampaign(state, params.campaignId);
    const schedule = state.schedules[params.campaignId];
    if (!schedule || schedule.status === 'none') fail(409, 'NO_SCHEDULE', 'No schedule exists.');
    const lines = ['Application ID,Applicant,Position,Start,End,Interviewer,Room,Status'];
    lines.push(...schedule.rows.map((row) => [row.applicationId, row.applicantName, row.positionName, row.start ?? '', row.end ?? '', row.interviewerName ?? '', row.roomName ?? '', row.status].join(',')));
    return csv(`${lines.join('\n')}\n`, 'clubflow-schedule.csv');
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/schedule');
  if (method === 'GET' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    return json(200, scheduleProjection(state, campaign, state.schedules[campaign.id] ?? emptySchedule()));
  }

  if (method === 'GET' && pathname === '/api/me/interviews') {
    const user = interviewer(state, request.headers);
    const campaignId = searchParams.get('campaignId') ?? 'cmp-2026-hk1';
    const campaign = findCampaign(state, campaignId);
    if (!campaign) fail(400, 'INVALID_QUERY', 'Unknown campaignId.');
    const schedule = state.schedules[campaign.id];
    const rows = schedule?.status === 'confirmed' ? schedule.rows.filter((row) => row.interviewerId === user.id) : [];
    return json(200, {
      scheduleConfirmed: schedule?.status === 'confirmed',
      campaignId: campaign.id,
      campaignName: campaign.name,
      interviewDate: scheduleSettings(campaign, schedule).interviewDate,
      interviews: rows.map((row) => ({
        interviewId: row.interviewId,
        applicationId: row.applicationId,
        applicantName: row.applicantName,
        positionId: row.positionId,
        positionName: row.positionName,
        start: row.start,
        end: row.end,
        roomId: row.roomId,
        roomName: row.roomName,
        completed: true,
        assessmentSubmitted: state.assessments.some((item) => item.interviewId === row.interviewId),
      })),
    });
  }

  params = matchPath(pathname, '/api/interviews/:interviewId/assessment');
  if (method === 'POST' && params) {
    const user = interviewer(state, request.headers);
    const found = findInterview(state, params.interviewId);
    if (!found) fail(404, 'INTERVIEW_NOT_FOUND', 'Interview not found.');
    if (found.row.interviewerId !== user.id) fail(403, 'INTERVIEW_NOT_ASSIGNED', 'Interview is not assigned to you.');
    if (found.schedule.status !== 'confirmed') fail(409, 'SCHEDULE_NOT_CONFIRMED', 'Schedule is not confirmed.');
    if (state.assessments.some((item) => item.interviewId === params.interviewId)) fail(409, 'ASSESSMENT_ALREADY_SUBMITTED', 'Assessment already exists.');
    const body = await parseRequestBody(request);
    const fieldErrors = {};
    if (typeof body?.notes !== 'string' || !body.notes.trim() || body.notes.trim().length > 2000) fieldErrors.notes = 'Notes are required and limited to 2000 characters.';
    if (body?.recommendation !== undefined && body.recommendation !== null && !['pass', 'fail'].includes(body.recommendation)) fieldErrors.recommendation = 'Must be pass, fail, or null.';
    if (Object.keys(fieldErrors).length) fail(400, 'VALIDATION_ERROR', 'Assessment fields are invalid.', { fieldErrors });
    const assessment = { id: `as-${found.row.applicationId}`, interviewId: params.interviewId, interviewerId: user.id, notes: body.notes.trim(), recommendation: body.recommendation ?? null, submittedAt: nextTime(state) };
    state.assessments.push(assessment);
    return json(201, clone(assessment));
  }

  params = matchPath(pathname, '/api/interviews/:interviewId');
  if (method === 'GET' && params) {
    const user = interviewer(state, request.headers);
    const found = findInterview(state, params.interviewId);
    if (!found) fail(404, 'INTERVIEW_NOT_FOUND', 'Interview not found.');
    if (found.row.interviewerId !== user.id) fail(403, 'INTERVIEW_NOT_ASSIGNED', 'Interview is not assigned to you.');
    return json(200, interviewDetail(state, found.row));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/results/publish');
  if (method === 'POST' && params) {
    executive(state, request.headers);
    errorForCampaign(state, params.campaignId);
    const campaignApplicationIds = new Set(state.applications.filter((item) => item.campaignId === params.campaignId).map((item) => item.id));
    const recorded = state.results.filter((result) => campaignApplicationIds.has(result.applicationId));
    if (!recorded.length) fail(409, 'NO_RECORDED_RESULTS', 'No final results have been recorded.');
    const publishTime = nextTime(state, 14);
    const publishedIds = [];
    for (const result of recorded) {
      if (result.publishedAt) continue;
      result.publishedAt = publishTime;
      publishedIds.push(result.applicationId);
      const application = findApplication(state, result.applicationId);
      if (!state.notifications.some((item) => item.applicationId === result.applicationId)) {
        state.notifications.push({
          id: `nt-${result.applicationId}`,
          accountId: application.applicantId,
          applicationId: result.applicationId,
          message: `The result for application ${result.applicationId} has been published: ${result.decision === 'pass' ? 'Pass' : 'Fail'}.`,
          createdAt: publishTime,
          readAt: null,
        });
      }
    }
    return json(200, { publishedIds });
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/results');
  if (method === 'GET' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    const schedule = state.schedules[campaign.id];
    const rejectedIds = state.applications.filter((item) => item.campaignId === campaign.id && item.screeningStatus === 'rejected').map((item) => item.id);
    const rows = (schedule?.rows ?? []).map((row) => {
      const result = state.results.find((item) => item.applicationId === row.applicationId);
      return {
        applicationId: row.applicationId,
        applicantName: row.applicantName,
        positionId: row.positionId,
        positionName: row.positionName,
        interviewId: row.interviewId,
        assessmentSubmitted: state.assessments.some((item) => item.interviewId === row.interviewId),
        decision: result?.decision ?? null,
        recordedAt: result?.recordedAt ?? null,
        publishedAt: result?.publishedAt ?? null,
      };
    });
    return json(200, { scheduleConfirmed: schedule?.status === 'confirmed', interviewDate: scheduleSettings(campaign, schedule).interviewDate, rejectedIds, rows });
  }

  if (method === 'GET' && pathname === '/api/me/notifications') {
    const user = applicant(state, request.headers);
    const unreadOnly = searchParams.get('unreadOnly');
    if (unreadOnly !== null && !['true', 'false'].includes(unreadOnly)) fail(400, 'INVALID_QUERY', 'unreadOnly must be true or false.');
    const own = state.notifications.filter((item) => item.accountId === user.id);
    const items = own.filter((item) => unreadOnly !== 'true' || !item.readAt).toReversed();
    return json(200, { items: clone(items), unreadCount: own.filter((item) => !item.readAt).length });
  }
  if (method === 'PATCH' && pathname === '/api/me/notifications') {
    const user = applicant(state, request.headers);
    const time = nextTime(state);
    state.notifications.filter((item) => item.accountId === user.id && !item.readAt).forEach((item) => { item.readAt = time; });
    return new Response(null, { status: 204 });
  }

  if (method === 'POST' && pathname === '/api/campaigns') {
    executive(state, request.headers);
    const body = await parseRequestBody(request);
    validateCampaignBody(body, { publish: true });
    const year = state.counters.campaign;
    state.counters.campaign += 1;
    const id = `cmp-${year}-hk1`;
    if (state.campaigns.some((item) => item.id === id)) fail(409, 'ACTIVE_CAMPAIGN_CONFLICT', 'A campaign with these dates already exists.');
    const campaign = {
      id,
      name: body.name.trim(),
      hostClub: body.hostClub.trim(),
      description: body.description.trim(),
      instructions: body.instructions.trim(),
      opensOn: body.opensOn,
      closesOn: body.closesOn,
      applicationsClosedAt: null,
      interviewDate: body.interviewDate,
      interviewWindow: clone(body.interviewWindow),
      slotMinutes: body.slotMinutes,
      status: 'draft',
      publishedAt: null,
      positions: [],
      slots: [],
      roomIds: [],
      assignments: [],
    };
    upsertPositions(campaign, body.positions);
    campaign.slots = createSlots(campaign);
    state.campaigns.push(campaign);
    return json(201, campaignView(state, campaign));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/positions/:positionId');
  if (method === 'DELETE' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    if (state.schedules[campaign.id]?.status === 'confirmed') fail(409, 'CAMPAIGN_CONFIRMED', 'Campaign is confirmed.');
    if (state.applications.some((item) => item.campaignId === campaign.id && item.positionId === params.positionId)) fail(409, 'POSITION_HAS_APPLICATIONS', 'A linked position cannot be deleted.');
    const index = campaign.positions.findIndex((position) => position.id === params.positionId);
    if (index < 0) fail(404, 'POSITION_NOT_FOUND', 'Position not found.');
    campaign.positions.splice(index, 1);
    campaign.assignments.forEach((assignment) => { assignment.positionIds = assignment.positionIds.filter((id) => id !== params.positionId); });
    return json(200, campaignView(state, campaign));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/interview-setup');
  if (method === 'PATCH' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    if (state.schedules[campaign.id]?.status === 'confirmed') fail(409, 'CAMPAIGN_CONFIRMED', 'Campaign is confirmed.');
    if (state.applications.some((item) => item.campaignId === campaign.id)) fail(409, 'INTERVIEW_SETUP_LOCKED', 'Interview setup locks after the first application.');
    const body = await parseRequestBody(request);
    validateSetup(state, campaign, body);
    campaign.interviewDate = body.interviewDate;
    campaign.interviewWindow = clone(body.interviewWindow);
    campaign.slotMinutes = body.slotMinutes;
    campaign.roomIds = clone(body.roomIds);
    campaign.assignments = clone(body.assignments);
    campaign.slots = createSlots(campaign);
    return json(200, campaignView(state, campaign));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId/publish');
  if (method === 'POST' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    if (campaign.status === 'published') fail(409, 'CAMPAIGN_ALREADY_PUBLISHED', 'Campaign is already published.');
    validateCampaignBody(campaign, { publish: true });
    validateSetup(state, campaign, campaign);
    const uncovered = campaign.positions.filter((position) => !campaign.assignments.some((assignment) => assignment.positionIds.includes(position.id)));
    if (uncovered.length) fail(400, 'VALIDATION_ERROR', 'Every position needs an interviewer.', { fieldErrors: { assignments: 'Every position needs an eligible interviewer.' } });
    campaign.status = 'published';
    campaign.publishedAt = nextTime(state, 15);
    return json(200, campaignView(state, campaign));
  }

  params = matchPath(pathname, '/api/campaigns/:campaignId');
  if (method === 'PATCH' && params) {
    executive(state, request.headers);
    const campaign = errorForCampaign(state, params.campaignId);
    if (state.schedules[campaign.id]?.status === 'confirmed') fail(409, 'CAMPAIGN_CONFIRMED', 'Campaign is confirmed.');
    const body = await parseRequestBody(request);
    if (campaign.status === 'published' && ['interviewDate', 'interviewWindow', 'slotMinutes'].some((field) => Object.hasOwn(body, field))) fail(400, 'VALIDATION_ERROR', 'Published interview settings use the setup endpoint.', { fieldErrors: { interviewSetup: 'Use the interview setup endpoint before applications exist.' } });
    validateCampaignBody({ ...campaign, ...body });
    const writable = ['name', 'hostClub', 'description', 'instructions', 'opensOn', 'closesOn'];
    if (campaign.status === 'draft') writable.push('interviewDate', 'interviewWindow', 'slotMinutes');
    writable.forEach((field) => { if (Object.hasOwn(body, field)) campaign[field] = clone(body[field]); });
    upsertPositions(campaign, body.positions);
    if (campaign.status === 'draft' && ['interviewDate', 'interviewWindow'].some((field) => Object.hasOwn(body, field))) campaign.slots = createSlots(campaign);
    return json(200, campaignView(state, campaign));
  }
  if (method === 'GET' && params) {
    executive(state, request.headers);
    return json(200, campaignView(state, errorForCampaign(state, params.campaignId)));
  }

  fail(404, 'NOT_FOUND', 'Endpoint not found.');
}

function parsePositive(raw, fallback, field, maximum = Number.POSITIVE_INFINITY) {
  if (raw === null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > maximum) fail(400, 'INVALID_QUERY', `${field} is invalid.`);
  return value;
}

function filterApplications(state, campaignId, searchParams) {
  const allowedStatus = ['pendingReview', 'shortlisted', 'rejected'];
  const sort = searchParams.get('sort') ?? 'newest';
  const status = searchParams.get('status');
  const search = searchParams.get('search') ?? '';
  const positionId = searchParams.get('positionId');
  if (!['newest', 'oldest'].includes(sort) || (status && !allowedStatus.includes(status)) || search.length > 100) fail(400, 'INVALID_QUERY', 'Application filters are invalid.');
  const campaign = findCampaign(state, campaignId);
  if (positionId && !positionFor(campaign, positionId)) fail(400, 'INVALID_QUERY', 'Unknown positionId.');
  const normalized = search.toLowerCase();
  return state.applications
    .filter((item) => item.campaignId === campaignId)
    .filter((item) => !status || item.screeningStatus === status)
    .filter((item) => !positionId || item.positionId === positionId)
    .filter((item) => !normalized || item.id.toLowerCase().includes(normalized) || item.studentInfo.name.toLowerCase().includes(normalized))
    .toSorted((left, right) => sort === 'oldest' ? left.submittedAt.localeCompare(right.submittedAt) : right.submittedAt.localeCompare(left.submittedAt));
}

function applicationInCampaign(state, { campaignId, applicationId }) {
  errorForCampaign(state, campaignId);
  const application = findApplication(state, applicationId);
  if (!application || application.campaignId !== campaignId) fail(404, 'APPLICATION_NOT_FOUND', 'Application not found.');
  return application;
}
