import { HTTP_STATUS } from '../constants/httpStatus.js';
import AppError from '../errors/AppError.js';

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  console.error(error);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error',
  });
}
