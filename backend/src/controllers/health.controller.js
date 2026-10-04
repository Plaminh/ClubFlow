import { HTTP_STATUS } from '../constants/httpStatus.js';
import { getHealthStatus } from '../services/health.service.js';

export async function getHealth(req, res) {
  const healthStatus = await getHealthStatus();
  res.status(HTTP_STATUS.OK).json(healthStatus);
}
