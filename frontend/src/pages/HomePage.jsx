import ClubFlowOverview from '../components/organisms/ClubFlowOverview/index.js';
import useApiHealth from '../hooks/useApiHealth.js';
import { SCREEN_LABELS } from '../constants/labels.js';
import RoutePlaceholderPage from './RoutePlaceholderPage.jsx';

// Route "/": temporary Applicant Portal entry point (UI-1.1). It keeps the
// existing API health check until its replacement is reviewed.
export default function HomePage() {
  const { status, errorMessage } = useApiHealth();

  return (
    <RoutePlaceholderPage title={SCREEN_LABELS.applicantPortal}>
      <ClubFlowOverview apiStatus={status} errorMessage={errorMessage} />
    </RoutePlaceholderPage>
  );
}
