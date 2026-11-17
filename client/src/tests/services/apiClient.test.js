import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, setAuthTokenProvider } from '../../services/apiClient.js';

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiClient', () => {
  let fetchMock;

  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.test/api');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    setAuthTokenProvider(null);
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('calls the configured base URL with query parameters and parses JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { status: 'ok' }));

    const data = await apiClient('/health', { query: { page: 2, search: '', status: ['a', 'b'] } });

    expect(data).toEqual({ status: 'ok' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/api/health?page=2&status=a&status=b');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('serializes JSON bodies and adds the bearer token when a provider is set', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
    setAuthTokenProvider(() => 'token-123');

    await apiClient('/example', { method: 'POST', body: { name: 'A' } });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe('{"name":"A"}');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.headers.Authorization).toBe('Bearer token-123');
  });

  it('sends FormData without forcing a JSON content type (CV upload boundary)', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: 'CF-032' }));
    const form = new FormData();
    form.set('cv', new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' }));

    await apiClient('/example-upload', { method: 'POST', body: form });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers['Content-Type']).toBeUndefined();
  });

  it('resolves 204 No Content to null', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiClient('/example', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('keeps the backend error message and maps the status to a UiError kind', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409, { error: 'Bạn đã nộp hồ sơ CF-026 cho vị trí này.' }));

    await expect(apiClient('/example')).rejects.toMatchObject({
      name: 'UiError',
      kind: 'conflict',
      message: 'Bạn đã nộp hồ sơ CF-026 cho vị trí này.',
      details: { status: 409 },
    });
  });

  it('puts backend details directly on error.details next to the status', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, { error: 'Chưa thể xác nhận lịch.', details: { conditions: ['CF-026 trùng giờ'], existingApplicationId: 'CF-026' } }),
    );

    await expect(apiClient('/example')).rejects.toMatchObject({
      kind: 'conflict',
      details: { status: 409, conditions: ['CF-026 trùng giờ'], existingApplicationId: 'CF-026' },
    });
  });

  it('passes field errors through and falls back to a Vietnamese message', async () => {
    fetchMock.mockResolvedValue(jsonResponse(422, { fieldErrors: { sop: 'Quá 300 từ.' } }));

    await expect(apiClient('/example')).rejects.toMatchObject({
      kind: 'validation',
      message: 'Dữ liệu gửi lên chưa hợp lệ.',
      fieldErrors: { sop: 'Quá 300 từ.' },
    });
  });

  it('reports network failures as a network UiError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiClient('/health')).rejects.toMatchObject({ kind: 'network' });
  });
});
