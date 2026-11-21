import { HTTP_STATUS } from '../constants/httpStatus.js';
import AppError from '../errors/AppError.js';

// One message per field, keyed by the field name, or by a dotted path for a nested field
// (`positions.0.quota`). The first message for a field wins.
function toFieldErrors(issues) {
  const fieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_';
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

const PARTS = [
  { part: 'params', code: 'VALIDATION_ERROR' },
  { part: 'query', code: 'INVALID_QUERY' },
  { part: 'body', code: 'VALIDATION_ERROR' },
];

/**
 * Validates untrusted input before any controller runs.
 * Pass zod schemas for the parts to check: validate({ params, query, body }).
 * The parsed values (types converted, undocumented fields dropped) are put in
 * req.validated.{params,query,body}; controllers read them from there, never from req.body.
 */
export function validate(schemas) {
  return (req, res, next) => {
    const validated = {};
    for (const { part, code } of PARTS) {
      const schema = schemas[part];
      if (!schema) continue;

      const input = part === 'body' ? (req.body ?? {}) : req[part];
      const result = schema.safeParse(input);
      if (!result.success) {
        return next(
          new AppError(HTTP_STATUS.BAD_REQUEST, code, 'Some fields are invalid.', {
            fieldErrors: toFieldErrors(result.error.issues),
          }),
        );
      }
      validated[part] = result.data;
    }
    req.validated = validated;
    return next();
  };
}
