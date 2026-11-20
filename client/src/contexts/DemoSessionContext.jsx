import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { setAuthTokenProvider } from '../services/apiClient.js';
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
    const token = typeof saved.token === 'string' ? saved.token : null;
    const user = token && saved.user && typeof saved.user.id === 'string' ? saved.user : null;
    return { token, user };
  });
  const [status, setStatus] = useState(initial.token ? 'loading' : 'ready');
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(initial.token);
  const [dataVersion, setDataVersion] = useState(0);
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [accounts] = useState(() => authService.DEMO_CREDENTIALS.map(({ password: _password, username: _username, ...user }) => user));

  const applyIdentity = useCallback((user) => {
    setAccount(user);
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
    if (!initial.token) return undefined;
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
        // Only an invalid token ends the session. A server error (e.g. mock
        // error mode) keeps the saved identity so each screen can show its own
        // Error + Retry; the API still authorizes every request.
        if (error?.details?.status !== 401 && initial.user) {
          applyIdentity(initial.user);
          setStatus('ready');
          return;
        }
        clearSession();
      },
    );
    return () => {
      active = false;
      controller.abort();
    };
  }, [applyIdentity, clearSession, initial.token, initial.user]);

  useEffect(() => {
    save({ token, user: token && account ? account : null });
  }, [token, account]);

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
    dataVersion,
    sessionEpoch,
  }), [status, accounts, account, accountId, signIn, signOut, selectDemoAccount, updateCurrentAccount, dataVersion, sessionEpoch]);

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}
