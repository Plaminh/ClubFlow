import { createContext, useContext } from 'react';

export const DemoSessionContext = createContext(null);

/** Current HTTP account/session plus isolated development demo controls. */
export function useDemoSession() {
  const value = useContext(DemoSessionContext);
  if (!value) {
    throw new Error('useDemoSession must be used inside DemoSessionProvider');
  }
  return value;
}
