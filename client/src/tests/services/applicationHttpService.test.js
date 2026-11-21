import { beforeEach, describe, expect, it } from 'vitest';
import { setAuthTokenProvider } from '../../services/apiClient.js';
import * as applicationService from '../../services/applicationService.js';
import { setMockApiScenario } from '../helpers/mockApi.js';

describe('application review HTTP adapter', () => {
  beforeEach(() => {
    setAuthTokenProvider(() => 'mock-token-exec');
    setMockApiScenario('screening');
  });

  it('loads one paginated composite list with filter-aware statistics', async () => {
    const response = await applicationService.list({ status: 'shortlisted', sort: 'oldest' });
    expect(response.items).toHaveLength(4);
    expect(response.stats).toMatchObject({
      campaign: { applications: 6, applicants: 5 },
      filtered: { shortlisted: 4 },
      isFiltered: true,
    });
  });

  it('reads detail, saves a private note, and mutates only the chosen Application', async () => {
    const detail = await applicationService.get('CF-028');
    expect(detail).toMatchObject({
      id: 'CF-028',
      cv: { downloadPath: '/api/applications/CF-028/cv' },
    });
    await expect(applicationService.saveNote('CF-028', 'HTTP note')).resolves.toMatchObject({
      privateNote: 'HTTP note',
    });
    await expect(applicationService.setScreening('CF-028', 'shortlisted')).resolves.toMatchObject({
      id: 'CF-028',
      screeningStatus: 'shortlisted',
    });
    expect((await applicationService.get('CF-031')).screeningStatus).toBe('shortlisted');
  });

  it('downloads protected PDF and filtered CSV through bearer requests', async () => {
    const pdf = await applicationService.downloadCv('CF-026');
    expect(pdf).toBeInstanceOf(Blob);
    expect(pdf.type).toBe('application/pdf');
    const csv = await applicationService.exportCsv({ status: 'shortlisted' });
    expect(csv).toMatchObject({ fileName: 'clubflow-applications.csv', rowCount: 4 });
    expect(csv.content).not.toContain('privateNote');
  });

  it('surfaces immutable and confirmed lock conflicts', async () => {
    await expect(applicationService.setScreening('CF-026', 'rejected')).rejects.toMatchObject({
      kind: 'conflict',
      code: 'SCREENING_ALREADY_DECIDED',
    });
    setMockApiScenario('confirmed');
    await expect(applicationService.setScreening('CF-028', 'shortlisted')).rejects.toMatchObject({
      kind: 'conflict',
      code: 'SCHEDULE_CONFIRMED',
    });
  });
});
