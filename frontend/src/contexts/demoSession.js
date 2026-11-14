import { createContext, useContext } from 'react';

export const DemoSessionContext = createContext(null);

/** Current demo account, role, and demo controls. Not authentication. */
export function useDemoSession() {
  const value = useContext(DemoSessionContext);
  if (!value) {
    throw new Error('useDemoSession must be used inside DemoSessionProvider');
  }
  return value;
}
