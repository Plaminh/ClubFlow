import { beforeEach, describe, expect, it } from 'vitest';
import { setAuthTokenProvider } from '../../services/apiClient.js';
import * as campaignService from '../../services/campaignService.js';
import { setMockApiScenario } from '../helpers/mockApi.js';

function draftOf(view) {
  return {
    ...view.campaign,
    positions: view.positions,
    roomIds: view.interviewSetup.roomIds,
    assignments: view.interviewSetup.assignments,
  };
}

describe('campaign HTTP adapter', () => {
  beforeEach(() => {
    setAuthTokenProvider(() => 'mock-token-exec');
    setMockApiScenario('draft');
  });

  it('reads the composite campaign and setup model', async () => {
    await expect(campaignService.getCampaign()).resolves.toMatchObject({
      campaign: { id: campaignService.PRIMARY_CAMPAIGN_ID, status: 'draft' },
      interviewSetup: { rooms: expect.any(Array), interviewers: expect.any(Array), locked: false },
    });
  });

  it('maps UI quotas and saves campaign plus composite setup', async () => {
    const view = await campaignService.getCampaign();
    const saved = await campaignService.saveDraft(view.campaign.id, {
      ...draftOf(view),
      name: 'HTTP campaign',
      slotMinutes: 20,
      positions: view.positions.map((item) => ({ ...item, quota: String(item.quota) })),
    });
    expect(saved.campaign).toMatchObject({ name: 'HTTP campaign', slotMinutes: 20 });
    expect(saved.positions.every((item) => Number.isInteger(item.quota))).toBe(true);
  });

  it('surfaces setup field errors and linked-position conflicts', async () => {
    const view = await campaignService.getCampaign();
    await expect(campaignService.saveInterviewSetup(view.campaign.id, { ...draftOf(view), roomIds: [], assignments: [] })).rejects.toMatchObject({
      kind: 'validation', code: 'VALIDATION_ERROR', fieldErrors: { roomIds: expect.any(String), assignments: expect.any(String) },
    });
    setMockApiScenario('screening');
    await expect(campaignService.removePosition(view.campaign.id, 'pos-ux')).rejects.toMatchObject({ kind: 'conflict', code: 'POSITION_HAS_APPLICATIONS' });
  });

  it('publishes after saving and permits constrained published detail edits', async () => {
    const view = await campaignService.getCampaign();
    const published = await campaignService.publish(view.campaign.id, draftOf(view));
    expect(published.campaign.status).toBe('published');
    const edited = await campaignService.saveDraft(view.campaign.id, { ...draftOf(published), name: 'Published edit' });
    expect(edited.campaign.name).toBe('Published edit');
  });
});
