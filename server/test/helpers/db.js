import pool from '../../src/db/pool.js';
import { resetAndSeed } from '../../src/db/seed.js';

// Every test file that touches the database calls this in beforeAll: the seed state of
// docs/api/README.md, built from scratch (drop schema, migrate, seed). Files run one at a time.
export async function resetDatabase() {
  await resetAndSeed();
}

// Every row of every table in the public schema, ordered, as plain data.
// Infrastructure for tests only: table names come from the catalog, never from a request.
export async function snapshotDatabase() {
  const { rows: tables } = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`,
  );
  const snapshot = {};
  for (const { table_name: name } of tables) {
    const quoted = `"${name.replaceAll('"', '""')}"`;
    const { rows } = await pool.query(`SELECT * FROM ${quoted} ORDER BY 1`);
    snapshot[name] = name === 'schema_migrations' ? rows.map(({ filename }) => filename) : rows;
  }
  return snapshot;
}

export { pool };
