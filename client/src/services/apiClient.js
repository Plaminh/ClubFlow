import { UiError } from './uiError.js';

let getAuthToken = () => null;

export function setAuthTokenProvider(provider) {
  getAuthToken = typeof provider === 'function' ? provider : () => null;
}

const STATUS_KINDS = { 400: 'validation', 401: 'forbidden', 403: 'forbidden', 404: 'notFound', 409: 'conflict', 422: 'validation' };
const DEFAULT_MESSAGES = {
  validation: 'Dữ liệu gửi lên chưa hợp lệ.',
  forbidden: 'Bạn không có quyền thực hiện thao tác này.',
  notFound: 'Không tìm thấy dữ liệu yêu cầu.',
  conflict: 'Thao tác xung đột với dữ liệu hiện có.',
  unknown: 'Máy chủ gặp lỗi. Vui lòng thử lại.',
};

function buildUrl(path, query) {
  if (typeof path !== 'string' || /^https?:\/\//iu.test(path)) throw new TypeError('apiClient requires a relative API path.');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const apiPath = normalized === '/api' || normalized.startsWith('/api/') ? normalized : `/api${normalized}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item));
  }
  const search = params.toString();
  return `${apiPath}${search ? `?${search}` : ''}`;
}

async function readBody(response, responseType = 'auto') {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') ?? '';
  if (responseType === 'blob' || (responseType === 'auto' && contentType.includes('application/pdf'))) return response.blob();
  const text = await response.text();
  if (!text) return null;
  if (responseType !== 'text' && contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

export async function apiClient(path, { method = 'GET', query, body, headers = {}, responseType = 'auto', ...fetchOptions } = {}) {
  const finalHeaders = { Accept: 'application/json', ...headers };
  let payload = body;
  if (body !== undefined && !(body instanceof FormData) && typeof body !== 'string') {
    payload = JSON.stringify(body);
    finalHeaders['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  const url = buildUrl(path, query);

  let response;
  try {
    response = await fetch(url, { ...fetchOptions, method, headers: finalHeaders, body: payload });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new UiError('network', 'Không kết nối được tới máy chủ. Vui lòng thử lại.');
  }

  // Error bodies are JSON even for blob/text downloads, so read them as such.
  const data = await readBody(response, response.ok ? responseType : 'auto');
  if (!response.ok) {
    const kind = STATUS_KINDS[response.status] ?? 'unknown';
    const message = (data && typeof data === 'object' && (data.error || data.message)) || DEFAULT_MESSAGES[kind];
    const backendDetails = data?.details && typeof data.details === 'object' ? data.details : {};
    throw new UiError(kind, message, {
      code: data?.code,
      fieldErrors: data?.fieldErrors,
      details: { ...backendDetails, status: response.status },
    });
  }
  return data;
}

export function apiDownload(path, options = {}) {
  return apiClient(path, { ...options, responseType: options.responseType ?? 'blob' });
}
