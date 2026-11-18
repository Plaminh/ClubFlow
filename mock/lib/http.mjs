import { HttpError, errorBody } from './domain.mjs';
import { emptyProjection } from './state.mjs';

export async function parseRequestBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return null;
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      throw new HttpError(400, 'INVALID_REQUEST', 'The JSON request body is invalid.');
    }
  }
  if (contentType.includes('multipart/form-data')) {
    try {
      return await request.formData();
    } catch {
      throw new HttpError(400, 'INVALID_REQUEST', 'The multipart request body is invalid.');
    }
  }
  return null;
}

export function json(status, body, headers = {}) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

export function csv(body, fileName) {
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${fileName}"`,
    },
  });
}

export function pdf(body, fileName) {
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="${fileName}"`,
      'content-length': String(body.byteLength),
    },
  });
}

export function matchPath(pathname, pattern) {
  const names = [];
  const source = pattern.replace(/:[^/]+/gu, (part) => {
    names.push(part.slice(1));
    return '([^/]+)';
  });
  const match = pathname.match(new RegExp(`^${source}$`, 'u'));
  if (!match) return null;
  return Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(match[index + 1])]));
}

export function projectForMode(response, mode) {
  if (mode !== 'empty' || !response.headers.get('content-type')?.includes('application/json') || response.status === 204) return response;
  return response.json().then((body) => json(response.status, emptyProjection(body), Object.fromEntries(response.headers.entries())));
}

export function responseForError(error) {
  if (error instanceof HttpError) return json(error.status, errorBody(error));
  return json(500, { error: 'Unexpected mock server error.', code: 'INTERNAL_ERROR' });
}

export async function delay(milliseconds) {
  if (milliseconds > 0) await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
