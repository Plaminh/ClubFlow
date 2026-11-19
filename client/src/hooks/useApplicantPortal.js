import { useCallback } from 'react';
import * as portalService from '../services/portalService.js';
import useServiceData from './useServiceData.js';

/** `ready` is false while a saved session is being restored: who is asking is not known yet, so nothing is requested. */
export default function useApplicantPortal(isApplicant, ready = true) {
  const resource = useServiceData(async ({ signal }) => {
    if (!isApplicant) return { publicCampaign: await portalService.getPublicCampaign({ signal }), applications: [], notifications: [] };
    const [publicCampaign, applications, notifications] = await Promise.all([
      portalService.getPublicCampaign({ signal }),
      portalService.listMyApplications(undefined, { signal }),
      portalService.listNotifications({ signal }),
    ]);
    return { publicCampaign, applications, notifications };
  }, [isApplicant], { enabled: ready });

  return {
    ...resource,
    status: resource.status === 'idle' ? 'loading' : resource.status,
    submitApplication: useCallback((formData, options) => portalService.submitApplication(formData, undefined, options), []),
    markNotificationsRead: useCallback((options) => portalService.markNotificationsRead(options), []),
  };
}
