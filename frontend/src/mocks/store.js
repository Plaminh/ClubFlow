/*
 * In-memory demo store. It stands in for the backend during UI-first
 * development and resets when the page reloads. Only mock services use it.
 */

const session = { accountId: null };

export function getSessionAccountId() {
  return session.accountId;
}

export function setSessionAccountId(accountId) {
  session.accountId = accountId;
}

/** Restores the initial demo state (used by "reset demo" and by tests). */
export function resetMockStore() {
  session.accountId = null;
}

/** Simulated network latency for demo realism; zero in automated tests. */
export function mockDelay(ms = 150) {
  const wait = import.meta.env.MODE === 'test' ? 0 : ms;
  return new Promise((resolve) => {
    setTimeout(resolve, wait);
  });
}

/** Deep copy so callers can never mutate store records directly. */
export function clone(value) {
  return structuredClone(value);
}
