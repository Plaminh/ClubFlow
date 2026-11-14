import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatTime, formatTimeRange } from '../../utils/format.js';

// 05/11/2026 09:00 in Vietnam (UTC+7) is 02:00 UTC. Tests use explicit offsets
// so they pass regardless of the machine's time zone.
const INTERVIEW_START = '2026-11-05T09:00:00+07:00';
const INTERVIEW_END = '2026-11-05T09:15:00+07:00';

describe('format utilities', () => {
  it('formats dates as dd/MM/yyyy, not in the browser locale order', () => {
    expect(formatDate(INTERVIEW_START)).toBe('05/11/2026');
    expect(formatDate('2026-10-30')).toBe('30/10/2026');
    expect(formatDate(new Date('2026-11-05T02:00:00Z'))).toBe('05/11/2026');
  });

  it('formats times in 24-hour HH:mm', () => {
    expect(formatTime(INTERVIEW_START)).toBe('09:00');
    expect(formatTime('2026-10-16T15:30:00+07:00')).toBe('15:30');
    expect(formatTime('2026-10-16T00:05:00+07:00')).toBe('00:05');
  });

  it('formats date and time together like the reference submissions list', () => {
    expect(formatDateTime('2026-10-14T09:42:00+07:00')).toBe('14/10/2026, 09:42');
  });

  it('uses the display time zone, so a late UTC instant shows the next local day', () => {
    expect(formatDateTime('2026-10-30T17:30:00Z')).toBe('31/10/2026, 00:30');
  });

  it('formats a time range with an en dash', () => {
    expect(formatTimeRange(INTERVIEW_START, INTERVIEW_END)).toBe('09:00–09:15');
  });

  it.each([null, undefined, '', 'not-a-date', Number.NaN, {}])(
    'returns a safe fallback for %s',
    (value) => {
      expect(formatDate(value)).toBe('—');
      expect(formatTime(value)).toBe('—');
      expect(formatDateTime(value)).toBe('—');
    },
  );

  it('accepts a custom fallback', () => {
    expect(formatDate(null, 'Chưa có lịch')).toBe('Chưa có lịch');
  });

  it('returns the fallback when either end of a range is missing', () => {
    expect(formatTimeRange(INTERVIEW_START, null)).toBe('—');
    expect(formatTimeRange(undefined, INTERVIEW_END, 'Chưa xếp')).toBe('Chưa xếp');
  });
});
