import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    clearMocks: true,
    // Page tests render the full app shell and step through several async
    // service calls; the 5 s default leaves too little margin on a busy machine.
    testTimeout: 10000,
    // Each page test renders the whole app in jsdom and is CPU-bound. With one
    // worker per core the files starve each other: on a 16-core machine the
    // heaviest test took 5.7 s (1.2 s alone) and random tests hit the 10 s
    // timeout; with a quarter of the cores it took 2.2 s and the whole suite
    // finished sooner (39 s instead of 45 s).
    maxWorkers: '25%',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/tests/**'],
    },
  },
});
