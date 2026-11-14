import { Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RoutePlaceholderPage from '../pages/RoutePlaceholderPage.jsx';
import { SCREEN_LABELS } from '../constants/labels.js';
import { ROUTES } from './paths.js';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route
          path={ROUTES.EXECUTIVE_CAMPAIGN}
          element={<RoutePlaceholderPage title={SCREEN_LABELS.campaignManagement} />}
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
