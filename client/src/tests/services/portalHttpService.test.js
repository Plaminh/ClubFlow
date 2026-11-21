import { beforeEach, describe, expect, it } from 'vitest';
import { setAuthTokenProvider } from '../../services/apiClient.js';
import * as portalService from '../../services/portalService.js';
import { setMockApiScenario } from '../helpers/mockApi.js';

function validForm(positionId = 'pos-ux') {
  const form = new FormData();
  form.set('positionId', positionId);
  form.set('email', 'hai.dang@demo.example');
  form.set('faculty', 'Design');
  form.set('sop', 'I want to contribute to the club.');
  form.append('slotIds', 'slot-0900');
  form.set('cv', new File(['%PDF-1.4 safe demo'], 'cv.pdf', { type: 'application/pdf' }));
  return form;
}

describe('public and Applicant HTTP adapters', () => {
  beforeEach(() => {
    setAuthTokenProvider(() => 'mock-test-token-ap-haidang');
    setMockApiScenario('accepting');
  });

  it('loads the public campaign and maps a missing publication to an empty state', async () => {
    await expect(portalService.getPublicCampaign()).resolves.toMatchObject({
      phase: 'open',
      acceptingApplications: true,
    });
    setMockApiScenario('draft');
    await expect(portalService.getPublicCampaign()).resolves.toEqual(
      expect.objectContaining({ campaign: null, positions: [] }),
    );
  });

  it('adds campaignId to multipart submissions and lists only the token owner records', async () => {
    const first = await portalService.submitApplication(validForm('pos-ux'));
    const second = await portalService.submitApplication(validForm('pos-content'));
    expect([first.positionId, second.positionId]).toEqual(['pos-ux', 'pos-content']);
    const own = await portalService.listMyApplications();
    expect(own.map((item) => item.id)).toEqual([first.id, second.id]);
    expect(own.every((item) => item.interview === null && item.result === null)).toBe(true);
  });

  it('preserves duplicate and closed contract details', async () => {
    await portalService.submitApplication(validForm());
    await expect(portalService.submitApplication(validForm())).rejects.toMatchObject({
      kind: 'conflict',
      code: 'DUPLICATE_APPLICATION',
      details: { existingApplicationId: expect.any(String) },
    });
    setMockApiScenario('screening');
    await expect(portalService.submitApplication(validForm())).rejects.toMatchObject({
      kind: 'conflict',
      code: 'APPLICATIONS_CLOSED',
    });
  });

  it('maps confirmed interviews, published-only results, and owned notifications', async () => {
    setAuthTokenProvider(() => 'mock-token-studentA');
    setMockApiScenario('confirmed');
    const applications = await portalService.listMyApplications();
    expect(applications.find((item) => item.id === 'CF-026')).toMatchObject({
      interview: expect.any(Object),
      result: { decision: 'pass' },
    });
    expect(applications.find((item) => item.id === 'CF-027').result).toBeNull();
    expect(await portalService.listNotifications()).toHaveLength(1);
    await expect(portalService.markNotificationsRead()).resolves.toBeNull();
    expect((await portalService.listNotifications())[0].readAt).not.toBeNull();
  });
});
