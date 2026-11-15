import * as interviewerService from '../services/interviewerService.js';
import useServiceData from './useServiceData.js';

/** The signed-in interviewer's confirmed, assigned interviews. */
export function useAssignedInterviews() {
  return useServiceData(() => interviewerService.listAssignedInterviews(), []);
}

/** Detail of one assigned interview (no Executive-only screening notes). */
export function useInterviewDetail(interviewId) {
  return useServiceData(
    () => (interviewId ? interviewerService.getInterview(interviewId) : Promise.resolve(null)),
    [interviewId],
  );
}

export const interviewerActions = {
  submitAssessment: interviewerService.submitAssessment,
};
