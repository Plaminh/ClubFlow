import { useEffect, useState } from 'react';
import { getHealth } from '../services/healthService.js';

export default function useApiHealth() {
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      try {
        await getHealth();
        if (active) {
          setStatus('online');
          setErrorMessage('');
        }
      } catch (error) {
        if (active) {
          setStatus('offline');
          setErrorMessage(error.message);
        }
      }
    }

    checkHealth();

    return () => {
      active = false;
    };
  }, []);

  return { status, errorMessage };
}
