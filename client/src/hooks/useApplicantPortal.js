import { useCallback } from 'react';
import * as portalService from '../services/portalService.js';
import useServiceData from './useServiceData.js';

export default function useApplicantPortal(isApplicant) {
  const resource = useServiceData(async ({ signal }) => {
    if (!isApplicant) return { publicCampaign: await portalService.getPublicCampaign({ signal }), applications: [], notifications: [] };
    const [publicCampaign, applications, notifications] = await Promise.all([
      portalService.getPublicCampaign({ signal }),
      portalService.listMyApplications(undefined, { signal }),
      portalService.listNotifications({ signal }),
    ]);
    return { publicCampaign, applications, notifications };
  }, [isApplicant]);

  return {
    ...resource,
    submitApplication: useCallback((formData, options) => portalService.submitApplication(formData, undefined, options), []),
    markNotificationsRead: useCallback((options) => portalService.markNotificationsRead(options), []),
  };
}
