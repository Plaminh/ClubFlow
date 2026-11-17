import { NAV_LABELS } from '../constants/labels.js';
import { ROUTES } from './paths.js';

// Header links shown for each demo role. This only shapes the UI; it is not
// access control (the backend must enforce permissions).
export const NAV_BY_ROLE = Object.freeze({
  visitor: [{ to: ROUTES.HOME, label: NAV_LABELS.applicantPortal, end: true }],
  applicant: [{ to: ROUTES.HOME, label: NAV_LABELS.applicantPortal, end: true }],
  executive: [
    { to: ROUTES.EXECUTIVE_CAMPAIGN, label: NAV_LABELS.campaign },
    { to: ROUTES.EXECUTIVE_REVIEW, label: NAV_LABELS.review },
    { to: ROUTES.EXECUTIVE_SCHEDULING, label: NAV_LABELS.scheduling },
    { to: ROUTES.HOME, label: NAV_LABELS.publicPortal, end: true },
  ],
  interviewer: [{ to: ROUTES.INTERVIEWER, label: NAV_LABELS.interviewerWorkspace }],
});

// Where each role lands after a demo sign-in.
export const HOME_BY_ROLE = Object.freeze({
  visitor: ROUTES.HOME,
  applicant: ROUTES.HOME,
  executive: ROUTES.EXECUTIVE_CAMPAIGN,
  interviewer: ROUTES.INTERVIEWER,
});

const PROTECTED_PATHS_BY_ROLE = Object.freeze({
  applicant: new Set([ROUTES.HOME, ROUTES.PROFILE]),
  executive: new Set([
    ROUTES.PROFILE,
    ROUTES.EXECUTIVE_CAMPAIGN,
    ROUTES.EXECUTIVE_REVIEW,
    ROUTES.EXECUTIVE_SCHEDULING,
  ]),
  interviewer: new Set([ROUTES.PROFILE, ROUTES.INTERVIEWER]),
});

export function canAccessProtectedPath(role, pathname) {
  return PROTECTED_PATHS_BY_ROLE[role]?.has(pathname) ?? false;
}

export function postSignInDestination(role, intendedLocation) {
  if (intendedLocation?.pathname && canAccessProtectedPath(role, intendedLocation.pathname)) {
    return `${intendedLocation.pathname}${intendedLocation.search ?? ''}`;
  }
  return HOME_BY_ROLE[role] ?? ROUTES.HOME;
}
