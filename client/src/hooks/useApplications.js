import * as applicationService from '../services/applicationService.js';
import useServiceData from './useServiceData.js';

export function useApplications(query) {
  return useServiceData(async ({ signal }) => {
    const response = await applicationService.list(query, { signal });
    const { stats, positions, ...list } = response;
    return { list, stats, positions };
  }, [query]);
}

export function useApplicationDetail(applicationId) {
  return useServiceData(({ signal }) => applicationService.get(applicationId, { signal }), [applicationId], { enabled: Boolean(applicationId) });
}

export const applicationActions = {
  saveNote: applicationService.saveNote,
  setScreening: applicationService.setScreening,
  exportCsv: applicationService.exportCsv,
  downloadCv: applicationService.downloadCv,
};
