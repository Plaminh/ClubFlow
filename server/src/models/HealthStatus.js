export default class HealthStatus {
  constructor({ databaseTime, checkedAt = new Date() }) {
    this.status = 'ok';
    this.database = 'reachable';
    this.databaseTime = new Date(databaseTime);
    this.checkedAt = new Date(checkedAt);
  }

  toJSON() {
    return {
      status: this.status,
      database: this.database,
      databaseTime: this.databaseTime.toISOString(),
      checkedAt: this.checkedAt.toISOString(),
    };
  }
}
