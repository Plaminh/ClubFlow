import { describe, expect, it } from 'vitest';
import { validateApiDocs } from '../../../../tools/validate-api-docs.mjs';

describe('PA#3 API contract documentation', () => {
  it('keeps inventory, endpoint headings, paired examples, links, and placeholders consistent', () => {
    const result = validateApiDocs();

    expect(result.errors).toEqual([]);
    expect(result.stats.files).toBe(9);
    expect(result.stats.endpoints).toBeGreaterThanOrEqual(35);
    expect(result.stats.examples).toBeGreaterThanOrEqual(result.stats.endpoints);
  });
});
