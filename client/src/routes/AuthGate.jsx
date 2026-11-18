import { Navigate, useLocation } from 'react-router-dom';
import AsyncContent from '../components/molecules/AsyncContent/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { useDemoSession } from '../contexts/demoSession.js';
import { ROUTES } from './paths.js';

export default function AuthGate({ title, children }) {
  const { account, status } = useDemoSession();
  const location = useLocation();

  // While a saved session is restored, keep the screen's heading and show the shared loading state.
  if (status === 'loading') {
    return (
      <MainTemplate title={title}>
        <AsyncContent status="loading" loadingLabel="Đang khôi phục phiên đăng nhập…" />
      </MainTemplate>
    );
  }
  if (!account) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }
  return children;
}
