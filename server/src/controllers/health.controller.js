import { HTTP_STATUS } from '../constants/httpStatus.js';
import { getHealthStatus } from '../services/health.service.js';

// The service still asks the database (a failure becomes 500 through the error handler);
// the answer carries only what the contract documents: { "status": "ok" }.
export async function getHealth(req, res) {
  const healthStatus = await getHealthStatus();
  res.status(HTTP_STATUS.OK).json({ status: healthStatus.status });
}
