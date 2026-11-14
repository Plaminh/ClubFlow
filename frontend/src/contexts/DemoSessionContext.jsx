/*
 * Demo session provider: which fictional account and workflow scenario the UI
 * is previewing. NOT authentication and NOT authorization — the backend must
 * enforce access. Replace with a real auth provider during backend integration.
 *
 * `dataVersion` changes whenever demo data is replaced (scenario switch,
 * reset, network mode); page hooks reload when it changes.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [accountId, setAccountId] = useState(initial.accountId);
  const [scenarioId, setScenarioId] = useState(initial.scenarioId);
  const [simulation, setSimulationState] = useState(initial.simulation);
  const [dataVersion, setDataVersion] = useState(0);
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

  useEffect(() => {
    save({ accountId, scenarioId });
  }, [accountId, scenarioId]);

  const signIn = useCallback(async (id) => {
    const account = await demoSessionService.signIn(id);
    setAccountId(account.id);
    return account;
  }, []);

  const signOut = useCallback(async () => {
    await demoSessionService.signOut();
    setAccountId(null);
  }, []);

  const setScenario = useCallback((id) => {
    demoSessionService.setScenario(id);
    setScenarioId(id);
    setDataVersion((version) => version + 1);
  }, []);

  const resetDemo = useCallback(() => {
    demoSessionService.resetDemoData();
    setDataVersion((version) => version + 1);
  }, []);

  const setSimulation = useCallback((mode) => {
    demoSessionService.setSimulation(mode);
    setSimulationState(mode);
    setDataVersion((version) => version + 1);
  }, []);

  const value = useMemo(() => {
    const account = accounts.find((item) => item.id === accountId) ?? null;
    return {
      status,
      accounts,
      account,
      accountId,
      role: account?.role ?? 'visitor',
      signIn,
      signOut,
      scenarios,
      scenarioId,
      scenario: scenarios.find((item) => item.id === scenarioId) ?? null,
      setScenario,
      resetDemo,
      simulation,
      setSimulation,
      dataVersion,
    };
  }, [
    accounts,
    accountId,
    status,
    signIn,
    signOut,
    scenarios,
    scenarioId,
    setScenario,
    resetDemo,
    simulation,
    setSimulation,
    dataVersion,
  ]);

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}
