import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool, resetDatabase, snapshotDatabase } from '../helpers/db.js';

const serverRoot = fileURLToPath(new URL('../../', import.meta.url));
const migrationsDir = fileURLToPath(new URL('../../migrations/', import.meta.url));

// Runs `npm run seed`'s script the way the marker does, with this process's environment.
function runSeedCommand() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['src/db/seed.js'], {
      cwd: serverRoot,
      env: process.env,
    });
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('exit', (code) => resolve({ code, output }));
  });
}

afterAll(async () => {
  await resetDatabase();
});

describe('Database seed', () => {
  it('Seed npm run seed builds the schema on an empty database', async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');

    const result = await runSeedCommand();

    expect(result.code, result.output).toBe(0);
    const { rows } = await pool.query(`SELECT to_regclass('public.schema_migrations') AS t`);
    expect(rows[0].t).toBe('schema_migrations');
  }, 30_000);

  it('Seed gives the same state on an empty and on a seeded database', async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    expect((await runSeedCommand()).code).toBe(0);
    const fromEmpty = await snapshotDatabase();

    expect((await runSeedCommand()).code).toBe(0);
    const fromSeeded = await snapshotDatabase();

    expect(fromSeeded).toEqual(fromEmpty);
  }, 30_000);

  it('Seed applies every migration file once, in file-name order', async () => {
    await resetDatabase();

    const files = (await readdir(migrationsDir)).filter((name) => name.endsWith('.sql')).sort();
    const { rows } = await pool.query('SELECT filename FROM schema_migrations ORDER BY id');

    expect(rows.map((row) => row.filename)).toEqual(files);
  });
});
