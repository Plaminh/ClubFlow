import { describe, expect, it } from 'vitest';
import { campaignPhase } from '../lib/state.mjs';

// The mock clock is the deterministic demo date 2026-11-18 (Vietnam time).
const published = (opensOn, closesOn, extra = {}) => ({ status: 'published', opensOn, closesOn, applicationsClosedAt: null, ...extra });

describe('application window (Q-02, Q-03)', () => {
  it('opens on the opening date itself', () => {
    expect(campaignPhase(published('2026-11-18', '2026-11-30'))).toBe('open');
    expect(campaignPhase(published('2026-11-19', '2026-11-30'))).toBe('before-open');
  });

  it('accepts through the whole date-only closing day and closes the next day', () => {
    expect(campaignPhase(published('2026-11-01', '2026-11-18'))).toBe('open');
    expect(campaignPhase(published('2026-11-01', '2026-11-17'))).toBe('closed');
  });

  it('closes early once the Executive closes applications, and drafts are never public', () => {
    expect(campaignPhase(published('2026-11-01', '2026-11-30', { applicationsClosedAt: '2026-11-18T10:00:00+07:00' }))).toBe('closed');
    expect(campaignPhase({ ...published('2026-11-01', '2026-11-30'), status: 'draft' })).toBe('draft');
  });
});
