import { Navigate, useLocation } from 'react-router-dom';
import Button from '../components/atoms/Button/index.js';
import AsyncContent from '../components/molecules/AsyncContent/index.js';
import EmptyState from '../components/molecules/EmptyState/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { ROLE_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';
import { HOME_BY_ROLE } from './navigation.js';
import { ROUTES } from './paths.js';

/**
 * Shows a screen only to the demo role it is designed for; otherwise a
 * restricted state with a sign-in prompt. This shapes the DEMO UI only —
 * it is not access control. The backend must authorize every request.
 */
export default function RoleGate({ role, title, children }) {
  const { role: currentRole, status } = useDemoSession();
  const location = useLocation();

  // While a saved session is restored, keep the screen's heading and show the shared loading state.
  if (status === 'loading') {
    return (
      <MainTemplate title={title}>
        <AsyncContent status="loading" loadingLabel="Đang khôi phục phiên đăng nhập…" />
      </MainTemplate>
    );
  }
  if (currentRole === role) {
    return children;
  }

  if (currentRole === 'visitor') {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return (
    <MainTemplate title={title}>
      <EmptyState
        title={`Màn hình này dành cho ${ROLE_LABELS[role]}`}
        actions={<Button to={HOME_BY_ROLE[currentRole]}>Về trang của tôi</Button>}
      >
        <p>
          Đăng nhập bằng tài khoản vai trò {ROLE_LABELS[role]} (hoặc đổi tài khoản trong tùy chọn demo) để xem nội dung. Đây chỉ là trạng thái giao diện;
          quyền truy cập thật do backend kiểm soát.
        </p>
      </EmptyState>
    </MainTemplate>
  );
}
