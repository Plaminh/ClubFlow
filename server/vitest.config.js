import { defineConfig } from 'vitest/config';

// Tests wipe the database they run against. On a developer machine, set TEST_DATABASE_URL
// (for example the clubflow_test database of docker-compose.yml) to keep the dev data;
// without it, tests use DATABASE_URL, as the marker runs them on an empty database.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
    // Test files share one database, so they run one after another.
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/server.js', 'src/db/migrate.js', 'src/db/seed.js'],
    },
  },
});
