import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { resetMockStore } from '../mocks/store.js';

// The app shell checks API health on every render; never hit the network in tests.
vi.mock('../services/healthService.js', () => ({
  getHealth: vi.fn(() => Promise.resolve({ status: 'ok' })),
}));

afterEach(() => {
  resetMockStore();
});
