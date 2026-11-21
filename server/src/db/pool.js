import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

// DATABASE_URL is the only setting used to find the database.
const pool = new Pool({ connectionString: env.databaseUrl });

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

export default pool;
