import { Navigate, useLocation } from 'react-router-dom';
import { useDemoSession } from '../contexts/demoSession.js';
import { ROUTES } from './paths.js';

export default function AuthGate({ children }) {
  const { account, status } = useDemoSession();
  const location = useLocation();

  if (status === 'loading') {
    return null;
  }
  if (!account) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }
  return children;
}
