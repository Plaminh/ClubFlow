import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './pool.js';
import { withTransaction } from './transaction.js';

const seedsDirectory = fileURLToPath(
  new URL('../../../database/seeds/', import.meta.url),
);

async function seed() {
  const filenames = (await readdir(seedsDirectory))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();

  if (filenames.length === 0) {
    console.log('No seed files found.');
    return;
  }

  for (const filename of filenames) {
    const sql = await readFile(path.join(seedsDirectory, filename), 'utf8');

    await withTransaction(async (client) => {
      await client.query(sql);
    });

    console.log(`Executed ${filename}`);
  }
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
