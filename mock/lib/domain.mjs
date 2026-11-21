import { userForToken } from './state.mjs';

export class HttpError extends Error {
  constructor(status, code, message, extras = {}) {
    super(message);
    this.status = status;
    this.code = code;
    Object.assign(this, extras);
  }
}

export function fail(status, code, message, extras) {
  throw new HttpError(status, code, message, extras);
}

export function authenticate(state, headers) {
  const authorization = headers.get('authorization') ?? '';
  const match = authorization.match(/^Bearer\s+(.+)$/iu);
  const user = match ? userForToken(state, match[1]) : null;
  if (!user) fail(401, 'INVALID_TOKEN', 'A valid bearer token is required.');
  return user;
}

export function requireRole(user, role) {
  if (user.role !== role) fail(403, 'ROLE_FORBIDDEN', `This action requires the ${role} role.`);
}

export function validateEmail(email) {
  return (
    typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)
  );
}

export function wordCount(value) {
  return typeof value === 'string' ? value.trim().split(/\s+/u).filter(Boolean).length : 0;
}

export function overlaps(left, right) {
  return Boolean(left.start && right.start && left.start < right.end && right.start < left.end);
}

export function addMinutes(iso, minutes) {
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):00\+07:00$/u);
  if (!match) return null;
  const total = Number(match[2]) * 60 + Number(match[3]) + minutes;
  return `${match[1]}T${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00+07:00`;
}

export function errorBody(error) {
  const body = { error: error.message, code: error.code ?? 'INTERNAL_ERROR' };
  if (error.fieldErrors) body.fieldErrors = error.fieldErrors;
  if (error.details) body.details = error.details;
  return body;
}
