import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RoutePlaceholderPage from '../pages/RoutePlaceholderPage.jsx';
import { SCREEN_LABELS } from '../constants/labels.js';
import { ROUTES } from './paths.js';

// UI-1.1: screens other than "/" are temporary placeholders until UI-2…UI-4.
export default function AppRoutes() {
  return (
    <Routes>
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
    </Routes>
  );
}
