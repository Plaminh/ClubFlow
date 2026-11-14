import MainTemplate from '../components/templates/MainTemplate/index.js';
import MainLayout from '../layouts/MainLayout.jsx';

// Temporary (UI-1.1): stands in for a ClubFlow screen so routing can be
// verified. Each route gets its real screen in UI-2…UI-4.
export default function RoutePlaceholderPage({ title, children }) {
  return (
    <MainLayout>
      <MainTemplate
        title={title}
        description="Trang tạm thời (UI-1.1) để kiểm tra định tuyến. Giao diện của màn hình này sẽ được xây dựng ở giai đoạn sau."
      >
        {children}
      </MainTemplate>
    </MainLayout>
  );
}
