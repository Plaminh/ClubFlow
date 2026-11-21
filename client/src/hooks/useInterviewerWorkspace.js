import * as interviewerService from '../services/interviewerService.js';
import useServiceData from './useServiceData.js';

/** The signed-in interviewer's confirmed, assigned interviews (GET /api/me/interviews). */
export function useAssignedInterviews() {
  return useServiceData((options) => interviewerService.listAssignedInterviews(options), []);
}

/** Detail of one assigned interview (no Executive-only screening notes). */
export function useInterviewDetail(interviewId) {
  return useServiceData(
    (options) => interviewerService.getInterview(interviewId, options),
    [interviewId],
    {
      enabled: Boolean(interviewId),
    },
  );
}

export const interviewerActions = {
  submitAssessment: (interviewId, values) =>
    interviewerService.submitAssessment(interviewId, values),
  downloadCv: (applicationId) => interviewerService.downloadCv(applicationId),
};
