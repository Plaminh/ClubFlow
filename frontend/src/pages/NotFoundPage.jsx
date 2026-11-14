import { Link, useLocation } from 'react-router-dom';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import MainLayout from '../layouts/MainLayout.jsx';
import { SCREEN_LABELS } from '../constants/labels.js';
import { ROUTES } from '../routes/paths.js';

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <MainLayout>
      <MainTemplate
        title={SCREEN_LABELS.notFound}
        description={`Đường dẫn "${pathname}" không tồn tại trong ClubFlow.`}
      >
        <p>
          <Link to={ROUTES.HOME}>Về trang chủ</Link>
        </p>
      </MainTemplate>
    </MainLayout>
  );
}
