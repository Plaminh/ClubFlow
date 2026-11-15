import * as portalService from '../services/portalService.js';
import useServiceData from './useServiceData.js';

/**
 * Applicant Portal data. Visitors get the public campaign only; a signed-in
 * applicant also gets their own applications and notifications.
 */
export default function useApplicantPortal(isApplicant) {
  const resource = useServiceData(async () => {
    const publicCampaign = await portalService.getPublicCampaign();
    if (!isApplicant) {
      return { publicCampaign, applications: [], notifications: [] };
    }
    const [applications, notifications] = await Promise.all([
      portalService.listMyApplications(),
      portalService.listNotifications(),
    ]);
    return { publicCampaign, applications, notifications };
  }, [isApplicant]);

  return {
    ...resource,
    submitApplication: portalService.submitApplication,
    markNotificationsRead: portalService.markNotificationsRead,
  };
}
