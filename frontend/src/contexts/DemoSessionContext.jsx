/*
 * Demo session provider: which fictional account the UI is previewing.
 * NOT authentication and NOT authorization — the backend must enforce access.
 * Replace with a real auth provider during backend integration.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as demoSessionService from '../services/demoSessionService.js';
import { DemoSessionContext } from './demoSession.js';

export function DemoSessionProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(() => demoSessionService.getCurrentAccountId());
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    demoSessionService.listAccounts().then((items) => {
      if (active) {
        setAccounts(items);
        setStatus('ready');
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (id) => {
    const account = await demoSessionService.signIn(id);
    setAccountId(account.id);
    return account;
  }, []);

  const signOut = useCallback(async () => {
    await demoSessionService.signOut();
    setAccountId(null);
  }, []);

  const value = useMemo(() => {
    const account = accounts.find((item) => item.id === accountId) ?? null;
    return {
      status,
      accounts,
      account,
      role: account?.role ?? 'visitor',
      signIn,
      signOut,
    };
  }, [accounts, accountId, status, signIn, signOut]);

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}
