import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { env } from '../config/env.js';
import pool from './pool.js';
import { withTransaction } from './transaction.js';
import { runMigrations } from './migrate.js';

const seedsDirectory = fileURLToPath(new URL('./seeds/', import.meta.url));

// Drops the public schema, applies every migration, then runs every seed module in file-name
// order, all in one transaction: the result is the same on an empty and on a seeded database.
export async function resetAndSeed() {
  const uploadDir = path.resolve(env.uploadDir);
  await mkdir(uploadDir, { recursive: true });

  const modules = (await readdir(seedsDirectory)).filter((name) => name.endsWith('.js')).sort();

  await withTransaction(async (client) => {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE');
    await client.query('CREATE SCHEMA public');
    await runMigrations(client);

    for (const name of modules) {
      const { default: seed } = await import(pathToFileURL(path.join(seedsDirectory, name)).href);
      await seed(client, { uploadDir, appToday: env.appToday });
    }
  });
  return modules;
}

// `npm run seed`
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  resetAndSeed()
    .then((modules) => {
      console.log(
        `Seeded${modules.length ? `: ${modules.join(', ')}` : ' (no seed modules yet)'}.`,
      );
    })
    .catch((error) => {
      console.error('Seeding failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
