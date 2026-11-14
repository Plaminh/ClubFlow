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

export function getSessionAccountId() {
  return session.accountId;
}

export function setSessionAccountId(accountId) {
  session.accountId = accountId;
}

export function getScenarioId() {
  return scenarioId;
}

/** Switches scenario and rebuilds its data from the fixtures. */
export function loadScenario(id) {
  scenarioId = SCENARIOS.some((item) => item.id === id) ? id : DEFAULT_SCENARIO_ID;
  state = buildScenarioState(scenarioId);
}

/** Mutable state for mock services only. Never return it to the UI directly. */
export function getState() {
  return state;
}

/** The demo clock for the current scenario (ISO string). */
export function getNow() {
  return state.now;
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
 */
export async function mockRequest(ms = 150) {
  const wait = import.meta.env.MODE === 'test' ? 0 : simulation === 'slow' ? 1500 : ms;
  await new Promise((resolve) => {
    setTimeout(resolve, wait);
  });
  if (simulation === 'error') {
    throw createUiError('network', 'Không kết nối được tới máy chủ (mô phỏng lỗi mạng). Vui lòng thử lại.');
  }
}

/** Deep copy so callers can never mutate store records directly. */
export function clone(value) {
  return structuredClone(value);
}
