import request from 'supertest';
import app from '../../../src/app.js';
import { resetDatabase } from '../../helpers/db.js';
import { tokenForSeedUser } from '../../helpers/tokens.js';

// docs/api/07-campaign-management.md. Every test starts from the fresh seed, so the first draft
// a test creates is cmp-2027-hk1, as in the contract's examples.

const exec = () => `Bearer ${tokenForSeedUser('exec')}`;

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

function createDraft(body) {
  return request(app).post('/api/campaigns').set('Authorization', exec()).send(body);
}

function publish(campaignId) {
  return request(app).post(`/api/campaigns/${campaignId}/publish`).set('Authorization', exec());
}

function getCampaign(campaignId) {
  return request(app).get(`/api/campaigns/${campaignId}`).set('Authorization', exec());
}

// Creates the draft (must succeed), publishes it (must be refused with a message for the field),
// and checks that it is still a draft.
async function expectPublishRefused(body, field) {
  const created = await createDraft(body);
  expect(created.status).toBe(201);
  const { id } = created.body.campaign;

  const refused = await publish(id);
  expect(refused.status).toBe(400);
  expect(refused.body.code).toBe('VALIDATION_ERROR');
  expect(typeof refused.body.fieldErrors[field]).toBe('string');

  const after = await getCampaign(id);
  expect(after.status).toBe(200);
  expect(after.body.campaign.status).toBe('draft');
  expect(after.body.campaign.publishedAt).toBeNull();
}

beforeEach(async () => {
  await resetDatabase();
});

describe('Campaign management (C3)', () => {
  it('R1 publishing a campaign with a required field missing returns 400 and it stays a draft', async () => {
    const { instructions: _missing, ...withoutInstructions } = DRAFT_2027;
    await expectPublishRefused(withoutInstructions, 'instructions');
  });

  it('R1 publishing a campaign whose closing date is before its opening date returns 400 and it stays a draft', async () => {
    await expectPublishRefused(
      { ...DRAFT_2027, opensOn: '2027-01-25', closesOn: '2027-01-10' },
      'closesOn',
    );
  });

  it('R1 publishing a campaign with a position with no quota returns 400 and it stays a draft', async () => {
    const { quota: _missing, ...withoutQuota } = DRAFT_2027.positions[0];
    await expectPublishRefused({ ...DRAFT_2027, positions: [withoutQuota] }, 'positions.0.quota');
  });

  it('R1 publishing an already published campaign returns 409 CAMPAIGN_ALREADY_PUBLISHED', async () => {
    const before = await getCampaign('cmp-2026-hk1');
    expect(before.status).toBe(200);
    expect(before.body.campaign.status).toBe('published');

    const response = await publish('cmp-2026-hk1');

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CAMPAIGN_ALREADY_PUBLISHED');
  });

  it('R1 publishing a campaign whose dates overlap the active one returns 409 ACTIVE_CAMPAIGN_CONFLICT', async () => {
    const created = await createDraft({
      ...DRAFT_2027,
      opensOn: '2026-11-20',
      closesOn: '2026-11-25',
      interviewDate: '2026-11-28',
    });
    expect(created.status).toBe(201);
    const { id } = created.body.campaign;

    const response = await publish(id);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('ACTIVE_CAMPAIGN_CONFLICT');
    expect((await getCampaign(id)).body.campaign.status).toBe('draft');
  });

  it.todo(
    'R1 publishing a complete campaign returns 200 and status published (needs rooms and assignments, migration 040, T051)',
  );

  it('Access an applicant gets 403 ROLE_FORBIDDEN, the executive gets the seeded campaign', async () => {
    const forbidden = await request(app)
      .get('/api/campaigns/cmp-2026-hk1')
      .set('Authorization', `Bearer ${tokenForSeedUser('studentA')}`);
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.code).toBe('ROLE_FORBIDDEN');

    const allowed = await getCampaign('cmp-2026-hk1');
    expect(allowed.status).toBe(200);
    expect(allowed.body.campaign).toEqual({
      id: 'cmp-2026-hk1',
      name: 'ClubFlow 2026 Recruitment',
      hostClub: 'Technology and Innovation Club',
      description: "Recruitment for the club's 2026 team.",
      instructions: 'Submit one application per position.',
      opensOn: '2026-11-10',
      closesOn: '2026-11-30',
      applicationsClosedAt: null,
      interviewDate: '2026-12-02',
      interviewWindow: { start: '09:00', end: '12:00' },
      slotMinutes: 30,
      status: 'published',
      publishedAt: '2026-11-09T09:00:00+07:00',
    });
    expect(allowed.body.phase).toBe('open');
    expect(allowed.body.positions.map(({ id, name, quota }) => ({ id, name, quota }))).toEqual([
      { id: 'pos-content', name: 'Content', quota: 2 },
      { id: 'pos-comms', name: 'Communications', quota: 2 },
    ]);
    expect(allowed.body.slots.map((slot) => slot.id)).toEqual([
      'slot-0900',
      'slot-1000',
      'slot-1100',
    ]);
  });

  it('Contract create, add a position, remove it, and an unknown campaign returns 404', async () => {
    const created = await createDraft(DRAFT_2027);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      campaign: {
        id: 'cmp-2027-hk1',
        ...Object.fromEntries(Object.entries(DRAFT_2027).filter(([key]) => key !== 'positions')),
        applicationsClosedAt: null,
        status: 'draft',
        publishedAt: null,
      },
      phase: 'draft',
      positions: [
        {
          id: 'pos-2027-content',
          departmentId: 'dep-comms',
          departmentName: 'Communications',
          name: 'Content',
          quota: 2,
          description: 'Create useful club content.',
          requirements: 'Clear writing.',
          applicationCount: 0,
        },
      ],
      slots: [
        { id: 'slot-0900', start: '2027-02-01T09:00:00+07:00', end: '2027-02-01T10:00:00+07:00' },
        { id: 'slot-1000', start: '2027-02-01T10:00:00+07:00', end: '2027-02-01T11:00:00+07:00' },
        { id: 'slot-1100', start: '2027-02-01T11:00:00+07:00', end: '2027-02-01T12:00:00+07:00' },
      ],
      interviewSetup: { assignments: [], roomIds: [], locked: false, lockReason: null },
      locked: false,
      lockReason: null,
    });

    const patched = await request(app)
      .patch('/api/campaigns/cmp-2027-hk1')
      .set('Authorization', exec())
      .send({
        description: 'Recruit the next club cohort with practical project work.',
        positions: [
          {
            id: 'pos-2027-content',
            departmentName: 'Communications',
            name: 'Content',
            quota: 2,
            description: 'Create useful club content.',
            requirements: 'Clear writing and collaboration.',
          },
          {
            departmentName: 'Operations',
            name: 'Event Operations',
            quota: 1,
            description: 'Coordinate recruitment-day logistics.',
            requirements: 'Reliable planning.',
          },
        ],
      });
    expect(patched.status).toBe(200);
    expect(patched.body.campaign).toMatchObject({
      id: 'cmp-2027-hk1',
      description: 'Recruit the next club cohort with practical project work.',
      status: 'draft',
    });
    expect(patched.body.positions).toMatchObject([
      { id: 'pos-2027-content', requirements: 'Clear writing and collaboration.', quota: 2 },
      {
        id: 'pos-2027-event-operations',
        departmentId: 'dep-operations',
        name: 'Event Operations',
        quota: 1,
        applicationCount: 0,
      },
    ]);

    const deleted = await request(app)
      .delete('/api/campaigns/cmp-2027-hk1/positions/pos-2027-event-operations')
      .set('Authorization', exec());
    expect(deleted.status).toBe(200);
    expect(deleted.body.positions.map((position) => position.id)).toEqual(['pos-2027-content']);

    const missingPosition = await request(app)
      .delete('/api/campaigns/cmp-2027-hk1/positions/pos-2027-event-operations')
      .set('Authorization', exec());
    expect(missingPosition.status).toBe(404);
    expect(missingPosition.body.code).toBe('POSITION_NOT_FOUND');

    const missing = await getCampaign('cmp-2099-hk1');
    expect(missing.status).toBe(404);
    expect(missing.body.code).toBe('CAMPAIGN_NOT_FOUND');
  });

  it('Contract editing a published campaign keeps its dates in order and refuses interview settings', async () => {
    const edited = await request(app)
      .patch('/api/campaigns/cmp-2026-hk1')
      .set('Authorization', exec())
      .send({ closesOn: '2026-12-01' });
    expect(edited.status).toBe(200);
    expect(edited.body.campaign.closesOn).toBe('2026-12-01');

    const outOfOrder = await request(app)
      .patch('/api/campaigns/cmp-2026-hk1')
      .set('Authorization', exec())
      .send({ closesOn: '2026-11-01' });
    expect(outOfOrder.status).toBe(400);
    expect(outOfOrder.body.code).toBe('VALIDATION_ERROR');
    expect(typeof outOfOrder.body.fieldErrors.closesOn).toBe('string');

    const interview = await request(app)
      .patch('/api/campaigns/cmp-2026-hk1')
      .set('Authorization', exec())
      .send({ slotMinutes: 15 });
    expect(interview.status).toBe(400);
    expect(typeof interview.body.fieldErrors.slotMinutes).toBe('string');

    const after = await getCampaign('cmp-2026-hk1');
    expect(after.body.campaign).toMatchObject({ closesOn: '2026-12-01', slotMinutes: 30 });
  });
});
