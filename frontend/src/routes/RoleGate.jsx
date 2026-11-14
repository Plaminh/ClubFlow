import { useOutletContext } from 'react-router-dom';
import Button from '../components/atoms/Button/index.js';
import EmptyState from '../components/molecules/EmptyState/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { ROLE_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';

/**
 * Shows a screen only to the demo role it is designed for; otherwise a
 * restricted state with a sign-in prompt. This shapes the DEMO UI only —
 * it is not access control. The backend must authorize every request.
 */
export default function RoleGate({ role, title, children }) {
  const { role: currentRole, status } = useDemoSession();
  const { openSignIn } = useOutletContext() ?? {};

  if (currentRole === role) {
    return children;
  }

  return (
    <MainTemplate title={title}>
      <EmptyState
        title={`Màn hình này dành cho ${ROLE_LABELS[role]}`}
        actions={
          openSignIn ? (
            <Button onClick={openSignIn} disabled={status === 'loading'}>
              {currentRole === 'visitor' ? 'Sign In' : 'Đổi tài khoản demo'}
            </Button>
          ) : null
        }
      >
        <p>
          Đăng nhập bằng tài khoản demo vai trò {ROLE_LABELS[role]} để xem nội dung. Đây chỉ là trạng thái giao diện;
          quyền truy cập thật do backend kiểm soát.
        </p>
      </EmptyState>
    </MainTemplate>
  );
}
