import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pool from './pool.js';
import { withTransaction } from './transaction.js';

export const migrationsDirectory = fileURLToPath(new URL('../../migrations/', import.meta.url));

// Infrastructure SQL (AGENTS.md allows it here): the migration files and their bookkeeping.
export async function runMigrations(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map((row) => row.filename));

  const filenames = (await readdir(migrationsDirectory))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();

  const newlyApplied = [];
  for (const filename of filenames) {
    if (applied.has(filename)) continue;
    const sql = await readFile(path.join(migrationsDirectory, filename), 'utf8');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    newlyApplied.push(filename);
  }
  return newlyApplied;
}

// `npm run migrate`: apply the migrations not yet applied, keeping existing data.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  withTransaction(runMigrations)
    .then((applied) => {
      console.log(applied.length ? `Applied ${applied.join(', ')}` : 'Schema is up to date.');
    })
    .catch((error) => {
      console.error('Migration failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
