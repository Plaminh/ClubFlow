/*
 * In-memory demo store. It stands in for the backend during UI-first
 * development and resets when the page reloads. Only mock services use it.
 */
import { createUiError } from '../services/uiError.js';
import { DEFAULT_SCENARIO_ID, SCENARIOS, buildScenarioState } from './scenarios.js';

const session = { accountId: null };
let scenarioId = DEFAULT_SCENARIO_ID;
let state = buildScenarioState(scenarioId);
let simulation = 'normal';
// Bumped whenever the demo account or scenario data changes, so a request that
// started before the change cannot read or write the new context.
let contextGeneration = 0;

export function getSessionAccountId() {
  return session.accountId;
}

export function setSessionAccountId(accountId) {
  if (session.accountId !== accountId) {
    contextGeneration += 1;
  }
  session.accountId = accountId;
}

export function getScenarioId() {
  return scenarioId;
}

/** Switches scenario and rebuilds its data from the fixtures. */
export function loadScenario(id) {
  scenarioId = SCENARIOS.some((item) => item.id === id) ? id : DEFAULT_SCENARIO_ID;
  state = buildScenarioState(scenarioId);
  contextGeneration += 1;
}

/** Mutable state for mock services only. Never return it to the UI directly. */
export function getState() {
  return state;
}

export function getSimulation() {
  return simulation;
}

export function setSimulation(mode) {
  simulation = ['normal', 'slow', 'error'].includes(mode) ? mode : 'normal';
}

/** Restores the initial demo state (used by tests). */
export function resetMockStore() {
  session.accountId = null;
  simulation = 'normal';
  loadScenario(DEFAULT_SCENARIO_ID);
}

/**
 * Simulated network round trip for every mock service call: a short delay
 * (zero in automated tests), or the demo "slow" / "error" network modes.
 * Every mock service awaits this BEFORE touching state; if the demo account or
 * scenario changed meanwhile, the call is cancelled instead of acting on the
 * new context.
 */
export async function mockRequest(ms = 150) {
  const startedIn = contextGeneration;
  const wait = import.meta.env.MODE === 'test' ? 0 : simulation === 'slow' ? 1500 : ms;
  await new Promise((resolve) => {
    setTimeout(resolve, wait);
  });
  if (simulation === 'error') {
    throw createUiError('network', 'Không kết nối được tới máy chủ (mô phỏng lỗi mạng). Vui lòng thử lại.');
  }
  if (contextGeneration !== startedIn) {
    throw createUiError('conflict', 'Thao tác đã bị hủy vì tài khoản hoặc kịch bản demo đã thay đổi trong lúc xử lý.');
  }
}

/** Deep copy so callers can never mutate store records directly. */
export function clone(value) {
  return structuredClone(value);
}
