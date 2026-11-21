import { HTTP_STATUS } from '../constants/httpStatus.js';

// Any path no router answered. The path is not echoed back.
export function notFound(req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: 'No such endpoint.',
    code: 'NOT_FOUND',
  });
}
