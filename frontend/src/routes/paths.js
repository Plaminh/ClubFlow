// Route paths for the five ClubFlow screens (specs/001-frontend-ui/research.md, D-UI-02).
export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  PROFILE: '/profile',
  EXECUTIVE_CAMPAIGN: '/executive/campaign',
  EXECUTIVE_REVIEW: '/executive/review',
  EXECUTIVE_SCHEDULING: '/executive/scheduling',
  INTERVIEWER: '/interviewer',
});

// Tabs are selected with a query parameter on their screen, not separate routes.
export const TAB_QUERY_PARAM = 'tab';

export const ROUTE_TABS = Object.freeze({
  applicantPortal: Object.freeze(['campaign', 'apply', 'mine', 'notifications']),
  applicationReview: Object.freeze(['screening', 'results']),
});
