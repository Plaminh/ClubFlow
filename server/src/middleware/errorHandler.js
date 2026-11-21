import { HTTP_STATUS } from '../constants/httpStatus.js';
import AppError from '../errors/AppError.js';

function toBody(error) {
  const body = { error: error.message, code: error.code };
  if (error.fieldErrors) body.fieldErrors = error.fieldErrors;
  if (error.details) body.details = error.details;
  return body;
}

// Errors raised by express.json() and Multer before any controller runs.
function fromParserError(error) {
  if (error.type === 'entity.parse.failed') {
    return new AppError(
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_JSON',
      'The request body is not valid JSON.',
    );
  }
  if (error.type === 'entity.too.large' || error.code === 'LIMIT_FILE_SIZE') {
    return new AppError(
      HTTP_STATUS.PAYLOAD_TOO_LARGE,
      'PAYLOAD_TOO_LARGE',
      'The request is too large.',
      error.field ? { fieldErrors: { [error.field]: 'The file is larger than allowed.' } } : {},
    );
  }
  return null;
}

// The one error handler of the app. A deliberate refusal (AppError) keeps its status and code;
// anything else is logged on the server and answered 500 with no message, detail or stack trace.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const known = error instanceof AppError ? error : fromParserError(error);
  if (known) {
    return res.status(known.statusCode).json(toBody(known));
  }

  console.error(error);
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: 'Something went wrong on the server.',
    code: 'INTERNAL_ERROR',
  });
}
