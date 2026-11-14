import MainTemplate from '../components/templates/MainTemplate/index.js';

// Temporary: stands in for a ClubFlow screen until its phase replaces it.
export default function RoutePlaceholderPage({ title, children }) {
  return (
    <MainTemplate
      title={title}
      description="Trang tạm thời để kiểm tra định tuyến. Giao diện của màn hình này sẽ được xây dựng ở giai đoạn sau."
    >
      {children}
    </MainTemplate>
  );
}
