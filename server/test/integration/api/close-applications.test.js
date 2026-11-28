import request from 'supertest';
import app from '../../../src/app.js';
import { resetDatabase } from '../../helpers/db.js';
import { tokenForSeedUser } from '../../helpers/tokens.js';

// docs/api/02-public-applicant.md, POST /api/campaigns/{campaignId}/close-applications. Every test
// starts from the fresh seed, where cmp-2026-hk1 is published and open on APP_TODAY.

const SERVER_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/;

const DRAFT_2027 = {
  name: 'ClubFlow 2027 Recruitment',
  hostClub: 'Technology and Innovation Club',
  description: 'Recruit the next club cohort.',
  instructions: 'Choose a position and submit one PDF CV.',
  opensOn: '2027-01-10',
  closesOn: '2027-01-25',
  interviewDate: '2027-02-01',
  interviewWindow: { start: '09:00', end: '12:00' },
  slotMinutes: 30,
  positions: [
    {
      departmentName: 'Communications',
      name: 'Content',
      quota: 2,
      description: 'Create useful club content.',
      requirements: 'Clear writing.',
    },
  ],
};

const asExec = (req) => req.set('Authorization', `Bearer ${tokenForSeedUser('exec')}`);

function close(campaignId, who = 'exec') {
  return request(app)
    .post(`/api/campaigns/${campaignId}/close-applications`)
    .set('Authorization', `Bearer ${tokenForSeedUser(who)}`);
}

function getCampaign(campaignId) {
  return asExec(request(app).get(`/api/campaigns/${campaignId}`));
}

beforeEach(async () => {
  await resetDatabase();
});

describe('Close applications early (C3)', () => {
  it('Close the executive closes applications early and the campaign stops accepting', async () => {
    const response = await close('cmp-2026-hk1');

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual([
      'acceptingApplications',
      'campaign',
      'phase',
    ]);
    expect(Object.keys(response.body.campaign).sort()).toEqual([
      'applicationsClosedAt',
      'id',
      'name',
      'status',
    ]);
    expect(response.body.campaign).toMatchObject({
      id: 'cmp-2026-hk1',
      name: 'ClubFlow 2026 Recruitment',
      status: 'published',
    });
    expect(response.body.campaign.applicationsClosedAt).toMatch(SERVER_TIME);
    expect(response.body.phase).toBe('closed');
    expect(response.body.acceptingApplications).toBe(false);

    const after = await getCampaign('cmp-2026-hk1');
    expect(after.status).toBe(200);
    expect(after.body.phase).toBe('closed');
    expect(after.body.campaign.applicationsClosedAt).toBe(
      response.body.campaign.applicationsClosedAt,
    );
  });

  it('Close closing applications twice returns 409 CAMPAIGN_NOT_ACCEPTING and keeps the first closing time', async () => {
    const first = await close('cmp-2026-hk1');
    expect(first.status).toBe(200);

    const second = await close('cmp-2026-hk1');

    expect(second.status).toBe(409);
    expect(second.body.code).toBe('CAMPAIGN_NOT_ACCEPTING');
    expect(typeof second.body.error).toBe('string');
    const after = await getCampaign('cmp-2026-hk1');
    expect(after.body.campaign.applicationsClosedAt).toBe(first.body.campaign.applicationsClosedAt);
  });

  it('Close a draft campaign returns 409 CAMPAIGN_NOT_ACCEPTING and it stays a draft', async () => {
    const created = await asExec(request(app).post('/api/campaigns')).send(DRAFT_2027);
    expect(created.status).toBe(201);
    const { id } = created.body.campaign;

    const response = await close(id);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CAMPAIGN_NOT_ACCEPTING');
    const after = await getCampaign(id);
    expect(after.body.phase).toBe('draft');
    expect(after.body.campaign.applicationsClosedAt).toBeNull();
  });

  it('Close a campaign past its closing date returns 409 CAMPAIGN_NOT_ACCEPTING', async () => {
    const moved = await asExec(request(app).patch('/api/campaigns/cmp-2026-hk1')).send({
      closesOn: '2026-11-17',
    });
    expect(moved.status).toBe(200);
    expect(moved.body.phase).toBe('closed');

    const response = await close('cmp-2026-hk1');

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CAMPAIGN_NOT_ACCEPTING');
    const after = await getCampaign('cmp-2026-hk1');
    expect(after.body.campaign.applicationsClosedAt).toBeNull();
  });

  it('Access an applicant gets 403 ROLE_FORBIDDEN and nothing changes, the executive closes applications', async () => {
    const forbidden = await close('cmp-2026-hk1', 'studentA');
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.code).toBe('ROLE_FORBIDDEN');

    const unchanged = await getCampaign('cmp-2026-hk1');
    expect(unchanged.body.phase).toBe('open');
    expect(unchanged.body.campaign.applicationsClosedAt).toBeNull();

    const allowed = await close('cmp-2026-hk1');
    expect(allowed.status).toBe(200);
  });

  it('Close an unknown campaign returns 404 CAMPAIGN_NOT_FOUND', async () => {
    const missing = await close('cmp-2099-hk1');
    expect(missing.status).toBe(404);
    expect(missing.body.code).toBe('CAMPAIGN_NOT_FOUND');

    const existing = await close('cmp-2026-hk1');
    expect(existing.status).toBe(200);
  });
});
