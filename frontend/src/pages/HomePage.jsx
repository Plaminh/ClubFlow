import MainTemplate from '../components/templates/MainTemplate/index.js';
import ClubFlowOverview from '../components/organisms/ClubFlowOverview/index.js';
import MainLayout from '../layouts/MainLayout.jsx';
import useApiHealth from '../hooks/useApiHealth.js';
import { APP_DESCRIPTION, APP_NAME } from '../constants/project.js';

export default function HomePage() {
  const { status, errorMessage } = useApiHealth();

  return (
    <MainLayout>
      <MainTemplate title={APP_NAME} description={APP_DESCRIPTION}>
        <ClubFlowOverview apiStatus={status} errorMessage={errorMessage} />
      </MainTemplate>
    </MainLayout>
  );
}
