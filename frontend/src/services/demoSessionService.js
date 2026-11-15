/*
 * Demo identity and scenario service. This is NOT authentication: it only
 * selects which fictional account and workflow phase the UI previews. Real
 * sign-in, tokens, and authorization belong to the backend
 * (see docs/frontend/INTEGRATION.md).
 */
import { ACCOUNTS } from '../mocks/fixtures.js';
import { SCENARIOS } from '../mocks/scenarios.js';
import {
  clone,
  getScenarioId,
  getSessionAccountId,
  getSimulation,
  loadScenario,
  mockRequest,
  setSessionAccountId,
  setSimulation as setStoreSimulation,
} from '../mocks/store.js';
import { createUiError } from './uiError.js';

/** Demo account list. Not affected by the simulated network modes. */
export async function listAccounts() {
  return clone(ACCOUNTS);
}

export async function signIn(accountId) {
  await mockRequest();
  const account = ACCOUNTS.find((item) => item.id === accountId);
  if (!account) {
    throw createUiError('notFound', 'Không tìm thấy tài khoản demo.');
  }

  setSessionAccountId(account.id);
  return clone(account);
}

export async function signOut() {
  setSessionAccountId(null);
}

/* Synchronous helpers for the demo controls (they never call a backend). */

export function listScenarios() {
  return clone(SCENARIOS);
}

/** Current demo selection; the account object is included so the role is known on first render. */
export function getDemoState() {
  const accountId = getSessionAccountId();
  const account = ACCOUNTS.find((item) => item.id === accountId) ?? null;
  return { accountId, account: account ? clone(account) : null, scenarioId: getScenarioId(), simulation: getSimulation() };
}

/** Restores a saved demo selection (e.g. after a reload); data itself restarts from fixtures. */
export function restoreDemoState({ accountId, scenarioId } = {}) {
  if (scenarioId && scenarioId !== getScenarioId()) {
    loadScenario(scenarioId);
  }
  if (accountId && ACCOUNTS.some((account) => account.id === accountId)) {
    setSessionAccountId(accountId);
  }
}

/** Switches scenario; all demo data restarts from that scenario's fixtures. */
export function setScenario(scenarioId) {
  loadScenario(scenarioId);
}

/** Discards demo changes and restores the current scenario's fixtures. */
export function resetDemoData() {
  loadScenario(getScenarioId());
}

export function setSimulation(mode) {
  setStoreSimulation(mode);
}
