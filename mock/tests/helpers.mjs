import { createMockServer } from '../server.mjs';

export const silentLogger = { info() {} };

export async function startMock(mode = 'normal', options = {}) {
  const mock = createMockServer({ mode, logger: silentLogger, ...options });
  const baseUrl = await mock.listen();
  return { ...mock, baseUrl };
}

export async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get('content-type') ?? '';
  let body = null;
  if (response.status !== 204) {
    if (contentType.includes('application/json')) body = await response.json();
    else if (contentType.includes('application/pdf')) body = Buffer.from(await response.arrayBuffer());
    else body = await response.text();
  }
  return { response, body };
}

export async function login(baseUrl, username) {
  const { response, body } = await request(baseUrl, '/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: 'ClubFlowDemo!' }),
  });
  if (response.status !== 200) throw new Error(`Login failed for ${username}: ${response.status}`);
  return body.token;
}

export function bearer(token, extra = {}) {
  return { authorization: `Bearer ${token}`, ...extra };
}

export function applicationForm({ positionId, student = 'A' }) {
  const form = new FormData();
  form.append('campaignId', 'cmp-2026-hk1');
  form.append('positionId', positionId);
  form.append('email', student === 'A' ? 'minh.anh@demo.example' : 'quoc.bao@demo.example');
  form.append('faculty', student === 'A' ? 'Information Technology' : 'Design');
  form.append('sop', student === 'A'
    ? 'I want to contribute clear and useful recruitment content for the club.'
    : 'I want to support visual and written communications for recruitment.');
  if (student === 'A') form.append('slotIds', 'slot-0900');
  form.append('slotIds', 'slot-1000');
  form.append('cv', new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), 'cv.pdf');
  return form;
}

export async function submitApplication(baseUrl, token, positionId, student = 'A') {
  return request(baseUrl, '/api/applications', {
    method: 'POST',
    headers: bearer(token),
    body: applicationForm({ positionId, student }),
  });
}

export async function seedApplications(baseUrl) {
  const studentA = await login(baseUrl, 'studentA');
  const studentB = await login(baseUrl, 'studentB');
  await submitApplication(baseUrl, studentA, 'pos-content');
  await submitApplication(baseUrl, studentA, 'pos-comms');
  await submitApplication(baseUrl, studentB, 'pos-comms', 'B');
  return { studentA, studentB };
}

export async function prepareConfirmedSchedule(baseUrl) {
  const exec = await login(baseUrl, 'exec');
  const students = await seedApplications(baseUrl);
  await request(baseUrl, '/api/campaigns/cmp-2026-hk1/close-applications', { method: 'POST', headers: bearer(exec) });
  for (const applicationId of ['A01', 'A02', 'A03']) {
    await request(baseUrl, `/api/campaigns/cmp-2026-hk1/applications/${applicationId}/screening-decision`, {
      method: 'POST',
      headers: bearer(exec, { 'content-type': 'application/json' }),
      body: JSON.stringify({ decision: 'shortlisted' }),
    });
  }
  await request(baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/draft/generate', { method: 'POST', headers: bearer(exec) });
  for (const [applicationId, start, interviewerId, roomId] of [
    ['A02', '2026-12-02T09:30:00+07:00', 'iv-comms', 'room-b105'],
    ['A03', '2026-12-02T10:00:00+07:00', 'iv-comms', 'room-b105'],
  ]) {
    await request(baseUrl, `/api/campaigns/cmp-2026-hk1/schedule/draft/rows/${applicationId}`, {
      method: 'PATCH',
      headers: bearer(exec, { 'content-type': 'application/json' }),
      body: JSON.stringify({ start, interviewerId, roomId }),
    });
  }
  await request(baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/draft/save', { method: 'POST', headers: bearer(exec) });
  await request(baseUrl, '/api/campaigns/cmp-2026-hk1/schedule/confirm', { method: 'POST', headers: bearer(exec) });
  return { exec, ...students };
}
