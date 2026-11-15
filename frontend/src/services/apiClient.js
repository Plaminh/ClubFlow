/*
 * Shared HTTP client for every backend call (AGENTS.md: services → apiClient).
 *
 * - Base URL from VITE_API_URL (single root .env).
 * - JSON bodies are serialized; FormData (e.g. CV upload) is sent as-is so the
 *   browser sets the multipart boundary.
 * - Adds `Authorization: Bearer <token>` when an auth token provider is set
 *   (registered by the future authentication context; none in demo mode).
 * - Rejects with a UiError: the backend's message is kept (current backend
 *   format: `{ error: message }`), the HTTP status is mapped to an error kind,
 *   and optional `fieldErrors` / `details` are passed through.
 * - 204 / empty responses resolve to null.
 */
import { UiError } from './uiError.js';

let getAuthToken = () => null;

/** Registers a function that returns the current access token (or null). */
export function setAuthTokenProvider(provider) {
  getAuthToken = typeof provider === 'function' ? provider : () => null;
}

const STATUS_KINDS = {
  400: 'validation',
  401: 'forbidden',
  403: 'forbidden',
  404: 'notFound',
  409: 'conflict',
  422: 'validation',
};

const DEFAULT_MESSAGES = {
  validation: 'Dữ liệu gửi lên chưa hợp lệ.',
  forbidden: 'Bạn không có quyền thực hiện thao tác này.',
  notFound: 'Không tìm thấy dữ liệu yêu cầu.',
  conflict: 'Thao tác xung đột với dữ liệu hiện có.',
  unknown: 'Máy chủ gặp lỗi. Vui lòng thử lại.',
};

function buildUrl(path, query) {
  const base = import.meta.env.VITE_API_URL ?? '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    for (const item of Array.isArray(value) ? value : [value]) {
      params.append(key, String(item));
    }
  }
  const search = params.toString();
  return `${base}${path}${search ? `?${search}` : ''}`;
}

async function readBody(response) {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  const type = response.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

/**
 * apiClient(path, { method, query, body, headers, signal, ...fetchOptions })
 * Resolves with the parsed response body (or null); rejects with a UiError.
 */
export async function apiClient(path, { method = 'GET', query, body, headers = {}, ...fetchOptions } = {}) {
  const finalHeaders = { Accept: 'application/json', ...headers };
  let payload = body;
  if (body !== undefined && !(body instanceof FormData) && typeof body !== 'string') {
    payload = JSON.stringify(body);
    finalHeaders['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), { ...fetchOptions, method, headers: finalHeaders, body: payload });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }
    throw new UiError('network', 'Không kết nối được tới máy chủ. Vui lòng thử lại.');
  }

  const data = await readBody(response);
  if (!response.ok) {
    const kind = STATUS_KINDS[response.status] ?? 'unknown';
    const message = (data && typeof data === 'object' && (data.error || data.message)) || DEFAULT_MESSAGES[kind];
    throw new UiError(kind, message, {
      fieldErrors: data?.fieldErrors,
      details: { status: response.status, ...(data?.details ? { details: data.details } : {}) },
    });
  }
  return data;
}
