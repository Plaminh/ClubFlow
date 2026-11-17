import * as applicationService from '../services/applicationService.js';
import useServiceData from './useServiceData.js';

/**
 * Application Review (CV Screening tab): list page and statistics for the
 * given query { search, positionId, status, sort, page }. The campaign context
 * (positions for the filter) is loaded once by the page, not per query.
 */
export function useApplications(query) {
  return useServiceData(async () => {
    const [list, stats] = await Promise.all([applicationService.list(query), applicationService.getStats(query)]);
    return { list, stats };
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
