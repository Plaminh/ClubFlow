import * as resultService from '../services/resultService.js';
import useServiceData from './useServiceData.js';

/** Final Results tab rows (shortlisted applications with a confirmed interview). */
export function useFinalResults() {
  return useServiceData(() => resultService.list(), []);
}

/** Submitted assessment for one application (`null` if none or nothing selected). */
export function useAssessment(applicationId, enabled) {
  return useServiceData(
    () => (applicationId && enabled ? resultService.getAssessment(applicationId) : Promise.resolve(null)),
    [applicationId, enabled],
  );
}

export const resultActions = {
  record: resultService.record,
  publishRecorded: resultService.publishRecorded,
};
