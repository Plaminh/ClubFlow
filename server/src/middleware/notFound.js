import { HTTP_STATUS } from '../constants/httpStatus.js';

export function notFound(req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: 'Not Found',
    path: req.originalUrl,
  });
}
