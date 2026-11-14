import { useCallback, useRef, useState } from 'react';
import { toUiError } from '../services/uiError.js';

/**
 * Runs a mutation (service call) and tracks it.
 * `run(fn)` resolves to { ok: true, value } or { ok: false, error } — it never
 * throws, so pages can show `error.message` and `error.fieldErrors` directly.
 */
export default function useAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const pendingRef = useRef(false);

  const run = useCallback(async (fn) => {
    if (pendingRef.current) {
      return { ok: false, error: null };
    }
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      const value = await fn();
      return { ok: true, value };
    } catch (caught) {
      const uiError = toUiError(caught);
      setError(uiError);
      return { ok: false, error: uiError };
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { run, pending, error, clearError };
}
