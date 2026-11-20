import { pathToFileURL } from 'node:url';
import { createMockServer } from '../mock/server.mjs';

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function call(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const type = response.headers.get('content-type') ?? '';
  let body = null;
  if (response.status !== 204) {
    if (type.includes('application/json')) body = await response.json();
    else if (type.includes('application/pdf')) body = Buffer.from(await response.arrayBuffer());
    else body = await response.text();
  }
  return { response, body };
}

const auth = (token, extra = {}) => ({ authorization: `Bearer ${token}`, ...extra });

async function login(baseUrl, username) {
  const result = await call(baseUrl, '/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: 'ClubFlowDemo!' }),
  });
  check(result.response.status === 200, `Login failed for ${username}.`);
  check(result.body.token === `mock-token-${username}`, `Token alias changed for ${username}.`);
  return result.body.token;
}

function applicationForm(positionId, student) {
  const form = new FormData();
  form.append('campaignId', 'cmp-2026-hk1');
  form.append('positionId', positionId);
  form.append('email', student === 'studentA' ? 'minh.anh@demo.example' : 'quoc.bao@demo.example');
  form.append('faculty', student === 'studentA' ? 'Information Technology' : 'Design');
  form.append('sop', student === 'studentA'
    ? 'I want to contribute clear and useful recruitment content for the club.'
    : 'I want to support visual and written communications for recruitment.');
  if (student === 'studentA') form.append('slotIds', 'slot-0900');
  form.append('slotIds', 'slot-1000');
  form.append('cv', new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), 'cv.pdf');
  return form;
}

async function createFutureCampaign(baseUrl, execToken) {
  const body = {
    name: 'ClubFlow 2027 Recruitment',
    hostClub: 'Technology and Innovation Club',
    description: 'Recruit the next club cohort.',
    instructions: 'Choose a position and submit one PDF CV.',
    opensOn: '2027-01-10',
    closesOn: '2027-01-25',
    interviewDate: '2027-02-01',
    interviewWindow: { start: '09:00', end: '12:00' },
    slotMinutes: 30,
    positions: [{ departmentName: 'Communications', name: 'Content', quota: 2, description: 'Create useful club content.', requirements: 'Clear writing.' }],
  };
  const draft = await call(baseUrl, '/api/campaigns', {
    method: 'POST',
    headers: auth(execToken, { 'content-type': 'application/json' }),
    body: JSON.stringify(body),
  });
  check(draft.response.status === 201 && draft.body.campaign.id === 'cmp-2027-hk1', 'Draft campaign creation failed.');
  const positionId = draft.body.positions[0].id;
  const setup = await call(baseUrl, '/api/campaigns/cmp-2027-hk1/interview-setup', {
    method: 'PATCH',
    headers: auth(execToken, { 'content-type': 'application/json' }),
    body: JSON.stringify({
      interviewDate: '2027-02-01',
      interviewWindow: { start: '09:00', end: '12:00' },
      slotMinutes: 30,
      roomIds: ['room-a201'],
      assignments: [{
        interviewerId: 'iv-giahuy',
        positionIds: [positionId],
        availability: [{ start: '2027-02-01T09:00:00+07:00', end: '2027-02-01T12:00:00+07:00' }],
      }],
    }),
  });
  check(setup.response.status === 200 && setup.body.interviewSetup.assignments.length === 1, 'Interview setup failed.');
  const published = await call(baseUrl, '/api/campaigns/cmp-2027-hk1/publish', { method: 'POST', headers: auth(execToken) });
  check(published.body.campaign.status === 'published', 'Future campaign publication failed.');
}

export async function verifyHttpWorkflow(baseUrl) {
  const health = await call(baseUrl, '/api/health');
  check(health.response.status === 200 && health.body.status === 'ok', 'Health endpoint failed.');
  const current = await call(baseUrl, '/api/campaigns/current');
  check(current.body.phase === 'open' && current.body.positions.length === 2, 'Public campaign is not the expected fresh fixture.');

  const tokens = {};
  for (const username of ['exec', 'studentA', 'studentB', 'int-content', 'int-comms']) tokens[username] = await login(baseUrl, username);
  const me = await call(baseUrl, '/api/auth/me', { headers: auth(tokens.studentA) });
  check(me.body.id === 'ap-minhanh' && me.body.role === 'applicant', 'Current-user projection is incorrect.');
  await createFutureCampaign(baseUrl, tokens.exec);

  for (const [student, positionId, expectedId] of [
    ['studentA', 'pos-content', 'A01'],
    ['studentA', 'pos-comms', 'A02'],
    ['studentB', 'pos-comms', 'A03'],
  ]) {
    const submitted = await call(baseUrl, '/api/applications', {
      method: 'POST',
      headers: auth(tokens[student]),
      body: applicationForm(positionId, student),
    });
    check(submitted.response.status === 201 && submitted.body.id === expectedId, `Expected ${expectedId} submission.`);
  }
  const duplicate = await call(baseUrl, '/api/applications', {
    method: 'POST',
    headers: auth(tokens.studentA),
    body: applicationForm('pos-content', 'studentA'),
  });
  check(duplicate.response.status === 409 && duplicate.body.details.existingApplicationId === 'A01', 'Duplicate protection failed.');
  const own = await call(baseUrl, '/api/me/applications', { headers: auth(tokens.studentA) });
  check(own.body.items.length === 2 && own.body.items.every((item) => item.result === null), 'Applicant ownership projection failed.');

  const closed = await call(baseUrl, '/api/campaigns/cmp-2026-hk1/close-applications', { method: 'POST', headers: auth(tokens.exec) });
  check(closed.response.status === 200, 'Early close failed.');
  for (const id of ['A01', 'A02', 'A03']) {
    const decision = await call(baseUrl, `/api/campaigns/cmp-2026-hk1/applications/${id}/screening-decision`, {
      method: 'POST',
      headers: auth(tokens.exec, { 'content-type': 'application/json' }),
      body: JSON.stringify({ decision: 'shortlisted' }),
    });
    check(decision.body.screeningStatus === 'shortlisted', `Screening ${id} failed.`);
  }
  const review = await call(baseUrl, '/api/campaigns/cmp-2026-hk1/applications?sort=oldest&page=1&pageSize=5', { headers: auth(tokens.exec) });
  check(review.body.total === 3 && review.body.stats.campaign.applicants === 2, 'Review statistics failed.');
  const cv = await call(baseUrl, '/api/applications/A01/cv', { headers: auth(tokens.exec) });
  check(cv.response.status === 200 && cv.response.headers.get('content-type') === 'application/pdf', 'Protected CV failed.');

  const generated = await call(baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/draft/generate', {
    method: 'POST',
    headers: auth(tokens.exec, { 'content-type': 'application/json' }),
    body: JSON.stringify({ interviewDate: '2026-12-02', interviewWindow: { start: '09:00', end: '12:00' }, slotMinutes: 30 }),
  });
  check(generated.body.summary.conflict === 2 && generated.body.summary.unassigned === 1, 'Deterministic draft shape changed.');
  for (const [id, start] of [['A02', '2026-12-02T09:30:00+07:00'], ['A03', '2026-12-02T10:00:00+07:00']]) {
    const edited = await call(baseUrl, `/api/campaigns/cmp-2026-hk1/schedule/draft/rows/${id}`, {
      method: 'PATCH',
      headers: auth(tokens.exec, { 'content-type': 'application/json' }),
      body: JSON.stringify({ start, interviewerId: 'iv-comms', roomId: 'room-b105' }),
    });
    check(edited.response.status === 200, `Schedule edit ${id} failed.`);
  }
  const saved = await call(baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/draft/save', { method: 'POST', headers: auth(tokens.exec) });
  check(saved.body.canConfirm === true && saved.body.dirty === false, 'Meaningful save failed.');
  const confirmed = await call(baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/confirm', { method: 'POST', headers: auth(tokens.exec) });
  check(confirmed.body.status === 'confirmed' && confirmed.body.rows.every((row) => row.status === 'confirmed'), 'Schedule confirmation failed.');

  const assigned = await call(baseUrl, '/api/me/interviews', { headers: auth(tokens['int-content']) });
  check(assigned.body.interviews.length === 1 && assigned.body.interviews[0].applicationId === 'A01', 'Interviewer assignment privacy failed.');
  for (const [tokenName, id, recommendation] of [['int-content', 'A01', 'pass'], ['int-comms', 'A02', 'fail']]) {
    const assessment = await call(baseUrl, `/api/interviews/int-${id}/assessment`, {
      method: 'POST',
      headers: auth(tokens[tokenName], { 'content-type': 'application/json' }),
      body: JSON.stringify({ notes: `Verified assessment for ${id}.`, recommendation }),
    });
    check(assessment.response.status === 201, `Assessment ${id} failed.`);
  }
  for (const [id, decision] of [['A01', 'pass'], ['A02', 'fail']]) {
    const result = await call(baseUrl, `/api/campaigns/cmp-2026-hk1/applications/${id}/final-result`, {
      method: 'PUT',
      headers: auth(tokens.exec, { 'content-type': 'application/json' }),
      body: JSON.stringify({ decision }),
    });
    check(result.body.decision === decision && result.body.publishedAt === null, `Final result ${id} failed.`);
  }
  const publication = await call(baseUrl, '/api/campaigns/cmp-2026-hk1/results/publish', { method: 'POST', headers: auth(tokens.exec) });
  check(publication.body.publishedIds.join(',') === 'A01,A02', 'Result publication failed.');
  const repeated = await call(baseUrl, '/api/campaigns/cmp-2026-hk1/results/publish', { method: 'POST', headers: auth(tokens.exec) });
  check(repeated.body.publishedIds.length === 0, 'Result publication is not idempotent.');
  const notifications = await call(baseUrl, '/api/me/notifications', { headers: auth(tokens.studentA) });
  check(notifications.body.items.length === 2 && notifications.body.unreadCount === 2, 'Notification uniqueness/ownership failed.');
  const publishedOwn = await call(baseUrl, '/api/me/applications', { headers: auth(tokens.studentA) });
  check(publishedOwn.body.items.every((item) => item.result?.publishedAt), 'Published results are not visible to their owner.');

  return { endpointsExercised: 24, applications: 3, confirmedInterviews: 3, publishedResults: 2 };
}

async function main() {
  const baseIndex = process.argv.indexOf('--base');
  const providedBase = baseIndex >= 0 ? process.argv[baseIndex + 1] : null;
  let mock;
  try {
    let baseUrl = providedBase;
    if (!baseUrl) {
      mock = createMockServer({ mode: 'normal', logger: { info() {} } });
      baseUrl = await mock.listen();
    }
    const result = await verifyHttpWorkflow(baseUrl.replace(/\/$/u, ''));
    console.info(`Non-official PA#3 HTTP verification passed: ${JSON.stringify(result)}.`);
  } finally {
    await mock?.close();
  }
}

const entryPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (entryPath === import.meta.url) {
  main().catch((error) => {
    console.error(`Non-official PA#3 HTTP verification failed: ${error.message}`);
    process.exitCode = 1;
  });
}
