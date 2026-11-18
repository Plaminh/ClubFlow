import { useCallback, useEffect, useRef, useState } from 'react';
import { useDemoSession } from '../contexts/demoSession.js';
import { toUiError } from '../services/uiError.js';

/**
 * Loads data through a service function.
 * Returns { data, status: 'idle' | 'loading' | 'success' | 'error', error (UiError), reload, refreshing }.
 * With `{ enabled: false }` nothing is requested and the status is 'idle'.
 * Reloads when `deps` change, when the signed-in account changes, and when demo
 * data is replaced (scenario switch / reset). With a real backend the demo
 * version simply never changes.
 *
 * State is only set from the async callbacks; "loading" is derived by
 * comparing the key of the last finished request with the current one.
 * Data loaded for a different account is never returned (no stale data from
 * another identity while the new request is in flight).
 */
export default function useServiceData(loader, deps = [], { enabled = true } = {}) {
  const { accountId, dataVersion } = useDemoSession();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, accountId: null, data: null, error: null });
  const loaderRef = useRef(loader);
  const requestKey = JSON.stringify([...deps, accountId, dataVersion, reloadCount, enabled]);

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let active = true;
    const controller = new AbortController();
    loaderRef.current({ signal: controller.signal }).then(
      (data) => {
        if (active) {
          setResult({ key: requestKey, accountId, data, error: null });
        }
      },
      (error) => {
        if (active) {
          setResult({ key: requestKey, accountId, data: null, error: toUiError(error) });
        }
      },
    );
    return () => {
      active = false;
      controller.abort();
    };
    // accountId and enabled are part of requestKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  if (!enabled) {
    return { data: null, status: 'idle', error: null, refreshing: false, reload };
  }
  const settled = result.key === requestKey;
  const sameAccount = result.accountId === accountId;
  const data = sameAccount ? result.data : null;
  let status = 'loading';
  if (settled) {
    status = result.error ? 'error' : 'success';
  } else if (data !== null) {
    status = 'success';
  }

  return {
    data,
    status,
    error: settled ? result.error : null,
    refreshing: !settled && data !== null,
    reload,
  };
}
