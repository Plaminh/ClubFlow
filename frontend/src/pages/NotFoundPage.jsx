import { useLocation } from 'react-router-dom';
import Button from '../components/atoms/Button/index.js';
import EmptyState from '../components/molecules/EmptyState/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { SCREEN_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';
import { HOME_BY_ROLE } from '../routes/navigation.js';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const { role } = useDemoSession();

  return (
    <MainTemplate title={SCREEN_LABELS.notFound}>
      <EmptyState
        title="Đường dẫn không tồn tại"
        actions={<Button to={HOME_BY_ROLE[role]}>Về trang chủ</Button>}
      >
        <p>{`Đường dẫn "${pathname}" không tồn tại trong ClubFlow.`}</p>
      </EmptyState>
    </MainTemplate>
  );
}
