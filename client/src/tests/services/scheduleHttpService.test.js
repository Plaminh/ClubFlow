import { beforeEach, describe, expect, it } from 'vitest';
import { setAuthTokenProvider } from '../../services/apiClient.js';
import * as applicationService from '../../services/applicationService.js';
import * as scheduleService from '../../services/scheduleService.js';
import { setMockApiScenario } from '../helpers/mockApi.js';


const SETTINGS = { interviewDate: '2026-11-05', interviewWindow: { start: '09:00', end: '12:00' }, slotMinutes: 15 };

describe('schedule HTTP adapter', () => {
  beforeEach(() => {
    setAuthTokenProvider(() => 'mock-token-exec');
    setMockApiScenario('screening');
  });

  it('maps canonical schedule fields and derives aligned session starts', async () => {
    const schedule = await scheduleService.getSchedule();
    expect(schedule).toMatchObject({ status: 'draft', hasUnsavedChanges: false, summary: { shortlisted: 4, conflict: 2, unassigned: 1 } });
    expect(schedule.sessionStarts).toHaveLength(12);
    expect(schedule.sessionStarts[0]).toBe('2026-11-05T09:00:00+07:00');
  });

  it('keeps generate, edit, meaningful save, export, and confirm distinct', async () => {
    await applicationService.setScreening('CF-028', 'rejected');
    const generated = await scheduleService.generateDraft(SETTINGS);
    expect(generated.settings).toMatchObject(SETTINGS);
    await scheduleService.updateRow('CF-027', { start: '2026-11-05T09:15:00+07:00', interviewerId: 'iv-giahuy', roomId: 'room-b105' });
    let schedule = await scheduleService.updateRow('CF-031', { start: '2026-11-05T09:00:00+07:00', interviewerId: 'iv-giahuy', roomId: 'room-b105' });
    expect(schedule).toMatchObject({ hasUnsavedChanges: true, summary: { proposed: 4, conflict: 0, unassigned: 0 }, canConfirm: false });
    schedule = await scheduleService.saveDraft();
    expect(schedule).toMatchObject({ hasUnsavedChanges: false, canConfirm: true });
    await expect(scheduleService.exportTimetable()).resolves.toMatchObject({ rowCount: 4 });
    schedule = await scheduleService.confirm();
    expect(schedule).toMatchObject({ status: 'confirmed', summary: { confirmed: 4 } });
  });

  it('returns refusal conditions before the draft is ready and locks confirmed schedules', async () => {
    await expect(scheduleService.confirm()).rejects.toMatchObject({ kind: 'conflict', code: 'SCHEDULE_NOT_READY', details: { conditions: expect.any(Array) } });
    setMockApiScenario('confirmed');
    await expect(scheduleService.generateDraft(SETTINGS)).rejects.toMatchObject({ kind: 'conflict', code: 'SCHEDULE_CONFIRMED' });
  });

  it('sends the C8 settings as the generate body and returns the field errors of a 400', async () => {
    await expect(scheduleService.generateDraft({})).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      fieldErrors: { interviewDate: expect.any(String), interviewWindow: expect.any(String), slotMinutes: expect.any(String) },
    });
  });
});
