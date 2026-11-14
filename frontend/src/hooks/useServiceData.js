import { useCallback, useEffect, useRef, useState } from 'react';
import { useDemoSession } from '../contexts/demoSession.js';
import { toUiError } from '../services/uiError.js';

/**
 * Loads data through a service function.
 * Returns { data, status: 'loading' | 'success' | 'error', error (UiError), reload, refreshing }.
 * Reloads when `deps` change, when the signed-in account changes, and when demo
 * data is replaced (scenario switch / reset). With a real backend the demo
 * version simply never changes.
 *
 * State is only set from the async callbacks; "loading" is derived by
 * comparing the key of the last finished request with the current one.
 */
export default function useServiceData(loader, deps = []) {
  const { accountId, dataVersion } = useDemoSession();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const loaderRef = useRef(loader);
  const requestKey = JSON.stringify([...deps, accountId, dataVersion, reloadCount]);

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let active = true;
    loaderRef.current().then(
      (data) => {
        if (active) {
          setResult({ key: requestKey, data, error: null });
        }
      },
      (error) => {
        if (active) {
          setResult({ key: requestKey, data: null, error: toUiError(error) });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const settled = result.key === requestKey;
  let status = 'loading';
  if (settled) {
    status = result.error ? 'error' : 'success';
  } else if (result.data !== null) {
    status = 'success';
  }

  return {
    data: result.data,
    status,
    error: settled ? result.error : null,
    refreshing: !settled && result.data !== null,
    reload,
  };
}
