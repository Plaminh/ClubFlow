import { Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import CampaignManagementPage from '../pages/CampaignManagementPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RoutePlaceholderPage from '../pages/RoutePlaceholderPage.jsx';
import { SCREEN_LABELS } from '../constants/labels.js';
import { ROUTES } from './paths.js';
import RoleGate from './RoleGate.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route
          path={ROUTES.EXECUTIVE_CAMPAIGN}
          element={
            <RoleGate role="executive" title={SCREEN_LABELS.campaignManagement}>
              <CampaignManagementPage />
            </RoleGate>
          }
        />
        <Route
          path={ROUTES.EXECUTIVE_REVIEW}
          element={<RoutePlaceholderPage title={SCREEN_LABELS.applicationReview} />}
        />
        <Route
          path={ROUTES.EXECUTIVE_SCHEDULING}
          element={<RoutePlaceholderPage title={SCREEN_LABELS.interviewScheduling} />}
        />
        <Route
          path={ROUTES.INTERVIEWER}
          element={<RoutePlaceholderPage title={SCREEN_LABELS.interviewerWorkspace} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
