import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['mock/tests/**/*.test.mjs'],
    fileParallelism: false,
    testTimeout: 10_000,
  },
});
