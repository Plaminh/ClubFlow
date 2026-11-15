import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { resetMockStore } from '../mocks/store.js';

// Full-page tests render the whole app shell; when every test file runs in
// parallel the first render can take longer than the default 1 s.
configure({ asyncUtilTimeout: 3000 });

// The app shell checks API health on every render; never hit the network in tests.
vi.mock('../services/healthService.js', () => ({
  getHealth: vi.fn(() => Promise.resolve({ status: 'ok' })),
}));

afterEach(() => {
  resetMockStore();
  window.sessionStorage.clear();
});
