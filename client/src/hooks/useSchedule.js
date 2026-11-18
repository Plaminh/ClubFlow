import { useCallback } from 'react';
import * as campaignService from '../services/campaignService.js';
import * as scheduleService from '../services/scheduleService.js';
import useServiceData from './useServiceData.js';

export default function useSchedule() {
  const resource = useServiceData(async ({ signal }) => {
    const [schedule, campaignView] = await Promise.all([scheduleService.getSchedule({ signal }), campaignService.getCampaign(undefined, { signal })]);
    return { schedule, campaign: campaignView.campaign };
  }, []);
  return {
    ...resource,
    generateDraft: useCallback((options) => scheduleService.generateDraft(options), []),
    updateRow: useCallback((applicationId, change, options) => scheduleService.updateRow(applicationId, change, options), []),
    saveDraft: useCallback((options) => scheduleService.saveDraft(options), []),
    confirm: useCallback((options) => scheduleService.confirm(options), []),
    exportTimetable: useCallback((options) => scheduleService.exportTimetable(options), []),
  };
}
