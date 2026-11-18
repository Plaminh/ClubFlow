import { Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import ApplicantPortalPage from '../pages/ApplicantPortalPage.jsx';
import ApplicationReviewPage from '../pages/ApplicationReviewPage.jsx';
import CampaignManagementPage from '../pages/CampaignManagementPage.jsx';
import InterviewSchedulingPage from '../pages/InterviewSchedulingPage.jsx';
import InterviewerWorkspacePage from '../pages/InterviewerWorkspacePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import SignInPage from '../pages/SignInPage.jsx';
import { SCREEN_LABELS } from '../constants/labels.js';
import { ROUTES } from './paths.js';
import AuthGate from './AuthGate.jsx';
import RoleGate from './RoleGate.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<ApplicantPortalPage />} />
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
          element={
            <RoleGate role="executive" title={SCREEN_LABELS.applicationReview}>
              <ApplicationReviewPage />
            </RoleGate>
          }
        />
        <Route
          path={ROUTES.EXECUTIVE_SCHEDULING}
          element={
            <RoleGate role="executive" title={SCREEN_LABELS.interviewScheduling}>
              <InterviewSchedulingPage />
            </RoleGate>
          }
        />
        <Route
          path={ROUTES.INTERVIEWER}
          element={
            <RoleGate role="interviewer" title={SCREEN_LABELS.interviewerWorkspace}>
              <InterviewerWorkspacePage />
            </RoleGate>
          }
        />
        <Route path={ROUTES.LOGIN} element={<SignInPage />} />
        <Route
          path={ROUTES.PROFILE}
          element={
            <AuthGate title={SCREEN_LABELS.profile}>
              <ProfilePage />
            </AuthGate>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
