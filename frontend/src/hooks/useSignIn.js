import { useDemoSession } from '../contexts/demoSession.js';
import * as authService from '../services/authService.js';
import useAction from './useAction.js';
import useServiceData from './useServiceData.js';

export default function useSignIn() {
  const session = useDemoSession();
  const credentials = useServiceData(authService.listDemoCredentials);
  const action = useAction();

  return {
    credentials,
    pending: action.pending,
    error: action.error,
    clearError: action.clearError,
    signIn: (values) => action.run(() => session.signIn(values)),
  };
}
