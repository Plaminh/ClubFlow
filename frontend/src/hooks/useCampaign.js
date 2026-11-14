import * as campaignService from '../services/campaignService.js';
import useServiceData from './useServiceData.js';

/** Campaign Management data and actions (Executive). */
export default function useCampaign() {
  const resource = useServiceData(() => campaignService.getCampaign(), []);
  return {
    ...resource,
    saveDraft: campaignService.saveDraft,
    publish: campaignService.publish,
    removePosition: campaignService.removePosition,
  };
}
