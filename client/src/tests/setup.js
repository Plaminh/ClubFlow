import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetMockStore } from '../mocks/store.js';
import { installMockApi, resetMockApi } from './helpers/mockApi.js';

// Full-page tests render the whole app shell; when every test file runs in
// parallel the first render can take longer than the default 1 s.
configure({ asyncUtilTimeout: 3000 });

// The app shell checks API health on every render; never hit the network in tests.
vi.mock('../services/healthService.js', () => ({
  getHealth: vi.fn(() => Promise.resolve({ status: 'ok' })),
}));

function resetDemo() {
  resetMockStore();
  window.sessionStorage.clear();
  resetMockApi();
}

// Unmount first, then reset. Testing Library registers its own cleanup when it
// is imported above, and Vitest runs after-hooks in reverse order, so without
// this explicit cleanup() the demo data was reset while the previous test's app
// was still mounted, and a late effect could save the old demo account back
// into sessionStorage for the next test.
afterEach(() => {
  cleanup();
  resetDemo();
});

// Every test also starts from a clean demo state, whatever ran before it.
beforeEach(() => {
  resetDemo();
  installMockApi();
});
