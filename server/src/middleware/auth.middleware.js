import { HTTP_STATUS } from '../constants/httpStatus.js';
import AppError from '../errors/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export const ROLES = Object.freeze(['executive', 'applicant', 'interviewer']);

const invalidToken = () =>
  new AppError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN', 'Please sign in again.');

// Reads the user from a verified token (HS256, signature and exp checked). The role is taken
// from the token only, never from the body, query or another header. Sets req.user = { id, role }.
export function authenticate(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(invalidToken());

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(invalidToken());
  }

  if (typeof payload.sub !== 'string' || !ROLES.includes(payload.role)) {
    return next(invalidToken());
  }

  req.user = { id: payload.sub, role: payload.role };
  return next();
}

// Use after authenticate: requireRole('executive') or requireRole('applicant', 'interviewer').
// Another role gets 403 ROLE_FORBIDDEN (docs/api/README.md, Access Rule).
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          HTTP_STATUS.FORBIDDEN,
          'ROLE_FORBIDDEN',
          'Your role cannot use this endpoint.',
        ),
      );
    }
    return next();
  };
}
