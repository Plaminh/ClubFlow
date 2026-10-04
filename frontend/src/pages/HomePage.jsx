import MainTemplate from '../components/templates/MainTemplate/index.js';
import ProjectOverview from '../components/organisms/ProjectOverview/index.js';
import MainLayout from '../layouts/MainLayout.jsx';
import useApiHealth from '../hooks/useApiHealth.js';

export default function HomePage() {
  const { status, errorMessage } = useApiHealth();

  return (
    <MainLayout>
      <MainTemplate
        title="Web Application Development"
        description="React Atomic Design frontend with a layered Express/PostgreSQL backend."
      >
        <ProjectOverview apiStatus={status} errorMessage={errorMessage} />
      </MainTemplate>
    </MainLayout>
  );
}
