import app from './app.js';
import { env } from './config/env.js';
import pool from './db/pool.js';

// No host argument: listen on every interface, as the marker's container needs.
const server = app.listen(env.port, () => {
  console.log(`ClubFlow server listening on port ${server.address().port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
