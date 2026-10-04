import pool from '../db/pool.js';

export async function getDatabaseStatus() {
  const result = await pool.query('SELECT NOW() AS database_time');

  return {
    databaseTime: result.rows[0].database_time,
  };
}
