import HealthStatus from '../models/HealthStatus.js';
import { getDatabaseStatus } from '../repositories/health.repository.js';

export async function getHealthStatus() {
  const databaseStatus = await getDatabaseStatus();

  return new HealthStatus({
    databaseTime: databaseStatus.databaseTime,
  });
}
