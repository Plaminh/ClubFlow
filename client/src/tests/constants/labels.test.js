import { describe, expect, it } from 'vitest';
import {
  EMPTY_LABEL,
  RESULT_DECISION_LABELS,
  SCHEDULE_STATUS_LABELS,
  SCREENING_STATUS_LABELS,
  getLabel,
} from '../../constants/labels.js';

describe('labels', () => {
  it('maps English screening identifiers to the reference Vietnamese labels', () => {
    expect(getLabel(SCREENING_STATUS_LABELS, 'pendingReview')).toBe('Chờ duyệt');
    expect(getLabel(SCREENING_STATUS_LABELS, 'shortlisted')).toBe('Qua vòng CV');
    expect(getLabel(SCREENING_STATUS_LABELS, 'rejected')).toBe('Loại ở vòng CV');
  });

  it('keeps the source workflow terms for schedule statuses', () => {
    expect(Object.values(SCHEDULE_STATUS_LABELS)).toEqual([
      'Proposed',
      'Conflict',
      'Unassigned',
      'Confirmed',
    ]);
  });

  it('never leaks unknown or missing identifiers into the UI', () => {
    expect(getLabel(SCREENING_STATUS_LABELS, 'approved')).toBe(EMPTY_LABEL);
    expect(getLabel(SCREENING_STATUS_LABELS, undefined)).toBe(EMPTY_LABEL);
    expect(getLabel(SCREENING_STATUS_LABELS, 'toString')).toBe(EMPTY_LABEL);
  });

  it('supports a custom fallback, e.g. for a decision that is not recorded yet', () => {
    expect(getLabel(RESULT_DECISION_LABELS, null, RESULT_DECISION_LABELS.none)).toBe('Chưa ghi nhận');
  });
});
