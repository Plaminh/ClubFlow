/*
 * Demo session provider: which fictional account and workflow scenario the UI
 * is previewing. NOT authentication and NOT authorization — the backend must
 * enforce access. Replace with a real auth provider during backend integration.
 *
 * `dataVersion` changes whenever demo data is replaced (scenario switch,
 * reset, network mode); page hooks reload when it changes.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import * as demoSessionService from '../services/demoSessionService.js';
import { DemoSessionContext } from './demoSession.js';

const STORAGE_KEY = 'clubflow.demoSession';

function readSaved() {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? 'null') ?? {};
  } catch {
    return {};
  }
}

function save(value) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode); the demo still works without it.
  }
}

export function DemoSessionProvider({ children }) {
  const [initial] = useState(() => {
    demoSessionService.restoreDemoState(readSaved());
    return demoSessionService.getDemoState();
  });
  const [accounts, setAccounts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [account, setAccount] = useState(initial.account);
  const [scenarioId, setScenarioId] = useState(initial.scenarioId);
  const [simulation, setSimulationState] = useState(initial.simulation);
  const [dataVersion, setDataVersion] = useState(0);
  // Changes whenever the identity or demo data is replaced (sign in/out, account
  // switch, scenario switch, reset). Pages key their local state on it so
  // unsaved edits can never carry over to another account or dataset.
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [scenarios] = useState(() => demoSessionService.listScenarios());

  useEffect(() => {
    let active = true;
    demoSessionService.listAccounts().then(
      (items) => {
        if (active) {
          setAccounts(items);
          setStatus('ready');
        }
      },
      () => {
        if (active) {
          setStatus('error');
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const accountId = account?.id ?? null;

  useEffect(() => {
    save({ accountId, scenarioId });
  }, [accountId, scenarioId]);

  const signIn = useCallback(async (credentials) => {
    const signedIn = await authService.signIn(credentials);
    setAccount(signedIn);
    setSessionEpoch((epoch) => epoch + 1);
    return signedIn;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setAccount(null);
    setSessionEpoch((epoch) => epoch + 1);
  }, []);

  // Development-only account switch used by the DemoBar (no credentials).
  const selectDemoAccount = useCallback(async (id) => {
    if (!id) {
      await authService.signOut();
      setAccount(null);
      setSessionEpoch((epoch) => epoch + 1);
      return null;
    }
    const selected = await demoSessionService.signIn(id);
    setAccount(selected);
    setSessionEpoch((epoch) => epoch + 1);
    return selected;
  }, []);

  // Applies a saved profile to the header. A late result for an account that is
  // no longer the current one is ignored instead of replacing the new identity.
  const updateCurrentAccount = useCallback((updated) => {
    setAccount((current) => (current?.id === updated.id ? updated : current));
    setAccounts((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setDataVersion((version) => version + 1);
  }, []);

  const setScenario = useCallback((id) => {
    demoSessionService.setScenario(id);
    setScenarioId(id);
    setAccount(demoSessionService.getDemoState().account);
    demoSessionService.listAccounts().then(setAccounts);
    setDataVersion((version) => version + 1);
    setSessionEpoch((epoch) => epoch + 1);
  }, []);

  const resetDemo = useCallback(() => {
    demoSessionService.resetDemoData();
    setAccount(demoSessionService.getDemoState().account);
    demoSessionService.listAccounts().then(setAccounts);
    setDataVersion((version) => version + 1);
    setSessionEpoch((epoch) => epoch + 1);
  }, []);

  const setSimulation = useCallback((mode) => {
    demoSessionService.setSimulation(mode);
    setSimulationState(mode);
    setDataVersion((version) => version + 1);
  }, []);

  const value = useMemo(() => {
    return {
      status,
      accounts,
      account,
      accountId,
      role: account?.role ?? 'visitor',
      signIn,
      signOut,
      selectDemoAccount,
      updateCurrentAccount,
      scenarios,
      scenarioId,
      scenario: scenarios.find((item) => item.id === scenarioId) ?? null,
      setScenario,
      resetDemo,
      simulation,
      setSimulation,
      dataVersion,
      sessionEpoch,
    };
  }, [
    accounts,
    account,
    accountId,
    status,
    signIn,
    signOut,
    selectDemoAccount,
    updateCurrentAccount,
    scenarios,
    scenarioId,
    setScenario,
    resetDemo,
    simulation,
    setSimulation,
    dataVersion,
    sessionEpoch,
  ]);

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}
