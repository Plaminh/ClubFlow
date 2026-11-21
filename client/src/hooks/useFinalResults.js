import * as resultService from '../services/resultService.js';
import useServiceData from './useServiceData.js';

/** Final Results tab rows (GET /api/campaigns/{id}/results joined with the confirmed schedule). */
export function useFinalResults() {
  return useServiceData((options) => resultService.list(options), []);
}

/** Submitted assessment for one application (`null` if none or nothing selected). */
export function useAssessment(applicationId, enabled) {
  return useServiceData(
    (options) => resultService.getAssessment(applicationId, options),
    [applicationId],
    {
      enabled: Boolean(applicationId && enabled),
    },
  );
}

export const resultActions = {
  record: (applicationId, decision) => resultService.record(applicationId, decision),
  publishRecorded: () => resultService.publishRecorded(),
};
