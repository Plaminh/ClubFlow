import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, apiDownload, setAuthTokenProvider } from '../../services/apiClient.js';

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('apiClient', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    setAuthTokenProvider(null);
    vi.unstubAllGlobals();
  });

  it('always builds a relative /api URL with repeated query fields', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, { status: 'ok' })));
    await expect(
      apiClient('/health', { query: { page: 2, search: '', status: ['a', 'b'] } }),
    ).resolves.toEqual({ status: 'ok' });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/health?page=2&status=a&status=b');
    await apiClient('/api/health');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/health');
    await expect(apiClient('https://example.test/api/health')).rejects.toThrow(/relative API path/);
  });

  it('serializes JSON and attaches the bearer token', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
    setAuthTokenProvider(() => 'token-123');
    await apiClient('/example', { method: 'POST', body: { name: 'A' } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init).toMatchObject({ method: 'POST', body: '{"name":"A"}' });
    expect(init.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-123',
    });
  });

  it('sends FormData without overriding the multipart boundary', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: 'A01' }));
    const form = new FormData();
    form.set('cv', new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' }));
    await apiClient('/applications', { method: 'POST', body: form });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers['Content-Type']).toBeUndefined();
  });

  it('supports PDF blobs, CSV text, and 204 responses', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response('%PDF', { headers: { 'content-type': 'application/pdf' } }),
      )
      .mockResolvedValueOnce(
        new Response('A,B\n1,2\n', { headers: { 'content-type': 'text/csv' } }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const pdf = await apiDownload('/applications/A01/cv');
    expect(pdf).toBeInstanceOf(Blob);
    await expect(apiClient('/campaigns/cmp/schedule.csv', { responseType: 'text' })).resolves.toBe(
      'A,B\n1,2\n',
    );
    await expect(apiClient('/auth/logout', { method: 'POST' })).resolves.toBeNull();
  });

  it('reads JSON error bodies for blob downloads (e.g. a forbidden CV)', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(403, { error: 'You cannot access this CV.', code: 'CV_FORBIDDEN' }),
    );
    await expect(apiDownload('/applications/A02/cv')).rejects.toMatchObject({
      kind: 'forbidden',
      code: 'CV_FORBIDDEN',
      message: 'You cannot access this CV.',
    });
  });

  it('preserves structured error code, fields, details, and status', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, {
        error: 'Duplicate.',
        code: 'DUPLICATE_APPLICATION',
        fieldErrors: { positionId: 'Already used.' },
        details: { existingApplicationId: 'A01' },
      }),
    );
    await expect(apiClient('/applications')).rejects.toMatchObject({
      name: 'UiError',
      kind: 'conflict',
      code: 'DUPLICATE_APPLICATION',
      message: 'Duplicate.',
      fieldErrors: { positionId: 'Already used.' },
      details: { existingApplicationId: 'A01', status: 409 },
    });
  });

  it('normalizes network failures but preserves AbortError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(apiClient('/health')).rejects.toMatchObject({ kind: 'network' });
    const aborted = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValueOnce(aborted);
    await expect(apiClient('/health', { signal: new AbortController().signal })).rejects.toBe(
      aborted,
    );
  });
});
