import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { setAuthTokenProvider } from '../services/apiClient.js';
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
    // The current tab can still work when sessionStorage is unavailable.
  }
}

export function DemoSessionProvider({ children }) {
  const [initial] = useState(() => {
    const saved = readSaved();
    demoSessionService.restoreDemoState({ scenarioId: saved.scenarioId });
    return { ...demoSessionService.getDemoState(), token: typeof saved.token === 'string' ? saved.token : null };
  });
  const [status, setStatus] = useState(initial.token ? 'loading' : 'ready');
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(initial.token);
  const [scenarioId, setScenarioId] = useState(initial.scenarioId);
  const [simulation, setSimulationState] = useState(initial.simulation);
  const [dataVersion, setDataVersion] = useState(0);
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [scenarios] = useState(() => demoSessionService.listScenarios());
  const [accounts] = useState(() => authService.DEMO_CREDENTIALS.map(({ password: _password, username: _username, ...user }) => user));

  const applyIdentity = useCallback((user) => {
    setAccount(user);
    demoSessionService.syncLegacyDomainIdentity(user?.id ?? null);
  }, [setAccount]);

  const clearSession = useCallback(() => {
    setToken(null);
    applyIdentity(null);
    setStatus('ready');
    setSessionEpoch((epoch) => epoch + 1);
  }, [applyIdentity, setSessionEpoch, setStatus, setToken]);

  useEffect(() => {
    setAuthTokenProvider(() => token);
    return () => setAuthTokenProvider(null);
  }, [token]);

  useEffect(() => {
    if (!initial.token) {
      demoSessionService.syncLegacyDomainIdentity(null);
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    authService.getCurrentUser({ signal: controller.signal }).then(
      (user) => {
        if (!active) return;
        applyIdentity(user);
        setStatus('ready');
      },
      (error) => {
        if (!active || error?.name === 'AbortError') return;
        clearSession();
      },
    );
    return () => {
      active = false;
      controller.abort();
    };
  }, [applyIdentity, clearSession, initial.token]);

  useEffect(() => {
    save({ token, scenarioId });
  }, [token, scenarioId]);

  const signIn = useCallback(async (credentials) => {
    const session = await authService.signIn(credentials);
    setToken(session.token);
    applyIdentity(session.user);
    setStatus('ready');
    setSessionEpoch((epoch) => epoch + 1);
    return session.user;
  }, [applyIdentity, setSessionEpoch, setStatus, setToken]);

  const signOut = useCallback(async () => {
    try {
      if (token) await authService.signOut();
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  // Development-only shortcut. It still uses the real HTTP login endpoint and
  // therefore never creates a second browser-only authentication path.
  const selectDemoAccount = useCallback(async (id) => {
    if (!id) {
      await signOut();
      return null;
    }
    const credential = authService.DEMO_CREDENTIALS.find((item) => item.id === id);
    if (!credential) return null;
    return signIn({ username: credential.username, password: credential.password });
  }, [signIn, signOut]);

  const updateCurrentAccount = useCallback((updated) => {
    setAccount((current) => (current?.id === updated.id ? { ...current, ...updated } : current));
    setDataVersion((version) => version + 1);
  }, [setAccount, setDataVersion]);

  const setScenario = useCallback((id) => {
    demoSessionService.setScenario(id);
    setScenarioId(id);
    demoSessionService.syncLegacyDomainIdentity(account?.id ?? null);
    setDataVersion((version) => version + 1);
    setSessionEpoch((epoch) => epoch + 1);
  }, [account?.id, setDataVersion, setScenarioId, setSessionEpoch]);

  const resetDemo = useCallback(() => {
    demoSessionService.resetDemoData();
    demoSessionService.syncLegacyDomainIdentity(account?.id ?? null);
    setDataVersion((version) => version + 1);
    setSessionEpoch((epoch) => epoch + 1);
  }, [account?.id, setDataVersion, setSessionEpoch]);

  const setSimulation = useCallback((mode) => {
    demoSessionService.setSimulation(mode);
    setSimulationState(mode);
    setDataVersion((version) => version + 1);
  }, [setDataVersion, setSimulationState]);

  const accountId = account?.id ?? null;
  const value = useMemo(() => ({
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
  }), [status, accounts, account, accountId, signIn, signOut, selectDemoAccount, updateCurrentAccount, scenarios, scenarioId, setScenario, resetDemo, simulation, setSimulation, dataVersion, sessionEpoch]);

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}
