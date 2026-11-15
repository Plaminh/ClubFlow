import * as campaignService from '../services/campaignService.js';
import * as scheduleService from '../services/scheduleService.js';
import useServiceData from './useServiceData.js';

/** Interview Scheduling data: schedule view plus campaign context. */
export default function useSchedule() {
  const resource = useServiceData(async () => {
    const [schedule, campaignView] = await Promise.all([scheduleService.getSchedule(), campaignService.getCampaign()]);
    return { schedule, campaign: campaignView.campaign };
  }, []);
  return {
    ...resource,
    generateDraft: scheduleService.generateDraft,
    updateSettings: scheduleService.updateSettings,
    updateRow: scheduleService.updateRow,
    saveDraft: scheduleService.saveDraft,
    confirm: scheduleService.confirm,
    exportTimetable: scheduleService.exportTimetable,
  };
}
