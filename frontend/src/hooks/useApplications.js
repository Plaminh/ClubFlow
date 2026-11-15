import * as applicationService from '../services/applicationService.js';
import * as campaignService from '../services/campaignService.js';
import useServiceData from './useServiceData.js';

/**
 * Application Review (CV Screening tab): list page, statistics, and campaign
 * context for the given query { search, positionId, status, sort, page }.
 */
export function useApplications(query) {
  return useServiceData(async () => {
    const [list, stats, campaignView] = await Promise.all([
      applicationService.list(query),
      applicationService.getStats(query),
      campaignService.getCampaign(),
    ]);
    return { list, stats, campaign: campaignView.campaign, positions: campaignView.positions, locked: campaignView.locked };
  }, [query]);
}

/** One application's detail for the side panel; `null` when nothing is selected. */
export function useApplicationDetail(applicationId) {
  return useServiceData(() => applicationService.get(applicationId), [applicationId], { enabled: Boolean(applicationId) });
}

export const applicationActions = {
  saveNote: applicationService.saveNote,
  setScreening: applicationService.setScreening,
  exportCsv: applicationService.exportCsv,
};
