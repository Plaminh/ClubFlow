import { useCallback } from 'react';
import * as campaignService from '../services/campaignService.js';
import useServiceData from './useServiceData.js';

export default function useCampaign(campaignId = campaignService.PRIMARY_CAMPAIGN_ID) {
  const resource = useServiceData(({ signal }) => campaignService.getCampaign(campaignId, { signal }), [campaignId]);
  return {
    ...resource,
    saveDraft: useCallback((draft, options) => campaignService.saveDraft(campaignId, draft, options), [campaignId]),
    publish: useCallback((draft, options) => campaignService.publish(campaignId, draft, options), [campaignId]),
    saveInterviewSetup: useCallback((draft, options) => campaignService.saveInterviewSetup(campaignId, draft, options), [campaignId]),
    closeApplications: useCallback((options) => campaignService.closeApplications(campaignId, options), [campaignId]),
    removePosition: useCallback((positionId, options) => campaignService.removePosition(campaignId, positionId, options), [campaignId]),
  };
}
