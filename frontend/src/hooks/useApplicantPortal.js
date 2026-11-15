import * as portalService from '../services/portalService.js';
import useServiceData from './useServiceData.js';

/**
 * Applicant Portal data. Visitors get the public campaign only; a signed-in
 * applicant also gets their own applications and notifications.
 */
export default function useApplicantPortal(isApplicant) {
  const resource = useServiceData(async () => {
    if (!isApplicant) {
      return { publicCampaign: await portalService.getPublicCampaign(), applications: [], notifications: [] };
    }
    // Independent requests: load them in parallel.
    const [publicCampaign, applications, notifications] = await Promise.all([
      portalService.getPublicCampaign(),
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
