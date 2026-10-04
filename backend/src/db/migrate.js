import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './pool.js';
import { withTransaction } from './transaction.js';

const migrationsDirectory = fileURLToPath(
  new URL('../../../database/migrations/', import.meta.url),
);

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT filename FROM schema_migrations');
  return new Set(result.rows.map((row) => row.filename));
}

async function migrate() {
  await ensureMigrationTable();

  const filenames = (await readdir(migrationsDirectory))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();

  if (filenames.length === 0) {
    console.log('No migration files found.');
    return;
  }

  const applied = await getAppliedMigrations();

  for (const filename of filenames) {
    if (applied.has(filename)) {
      console.log(`Skipping ${filename}`);
      continue;
    }

    const sql = await readFile(path.join(migrationsDirectory, filename), 'utf8');

    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [filename],
      );
    });

    console.log(`Applied ${filename}`);
  }
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
