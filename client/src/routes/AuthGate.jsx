import { Navigate, useLocation } from 'react-router-dom';
import { useDemoSession } from '../contexts/demoSession.js';
import { ROUTES } from './paths.js';

export default function AuthGate({ children }) {
  const { account } = useDemoSession();
  const location = useLocation();

  if (!account) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }
  return children;
}
