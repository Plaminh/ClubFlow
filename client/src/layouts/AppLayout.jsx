import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '../components/organisms/AppHeader/index.js';
import DemoBar from '../components/organisms/DemoBar/index.js';
import StatusBadge from '../components/molecules/StatusBadge/index.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useApiHealth from '../hooks/useApiHealth.js';
import { HOME_BY_ROLE, NAV_BY_ROLE, canAccessProtectedPath } from '../routes/navigation.js';
import { ROUTES } from '../routes/paths.js';
import './AppLayout.css';

/**
 * Application shell for every route: skip link, header, one <main>, footer.
 * Pages render inside <Outlet />. Pages send visitors to the Sign In page
 * through the outlet context: `useOutletContext().openSignIn()` navigates to
 * /login and remembers the current location as the intended destination.
 */
export default function AppLayout() {
  const {
    account,
    role,
    accounts,
    selectDemoAccount,
    signOut,
  } = useDemoSession();
  const { status: apiStatus } = useApiHealth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const mainRef = useRef(null);
  const previousPath = useRef(pathname);
  const signingOut = useRef(false);

  // Move focus to the new page on client-side navigation, never on first load.
  // Compare with the previous path instead of a "first render" flag: React
  // StrictMode runs mount effects twice in development, which made a flag
  // focus <main> on initial load and skip the header for keyboard users.
  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }
    previousPath.current = pathname;
    mainRef.current?.focus();
  }, [pathname]);

  useEffect(() => {
    if (signingOut.current && pathname === ROUTES.HOME) {
      signingOut.current = false;
      signOut();
    }
  }, [pathname, signOut]);

  // The only normal sign-in flow is the /login page; remember where the visitor was.
  function openSignIn() {
    navigate(ROUTES.LOGIN, { state: { from: location } });
  }

  // Development-only account switch from the DemoBar (no credentials involved).
  async function handleDemoAccountChange(accountId) {
    if (!accountId) {
      handleSignOut();
      return;
    }
    try {
      const selected = await selectDemoAccount(accountId);
      if (!canAccessProtectedPath(selected.role, pathname)) {
        navigate(HOME_BY_ROLE[selected.role]);
      }
    } catch {
      // A failed or cancelled sign-in keeps the current account.
    }
  }

  // Sign Out always ends on the public portal. The session is cleared only
  // once that navigation has rendered: clearing it while a protected screen is
  // still shown would let its gate redirect the new guest to /login instead.
  function handleSignOut() {
    if (pathname === ROUTES.HOME) {
      signOut();
      return;
    }
    signingOut.current = true;
    navigate(ROUTES.HOME);
  }

  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <AppHeader
        homeTo={HOME_BY_ROLE[role]}
        navItems={NAV_BY_ROLE[role]}
        account={account}
        role={role}
        signInTo={ROUTES.LOGIN}
        signInState={{ from: location }}
        profileTo={ROUTES.PROFILE}
        onSignOut={handleSignOut}
      />
      <DemoBar
        accounts={accounts}
        accountId={account?.id ?? ''}
        onAccountChange={handleDemoAccountChange}
      />
      <main id="main-content" ref={mainRef} className="container app-layout__main" tabIndex={-1}>
        <Outlet context={{ openSignIn }} />
      </main>
      <footer className="app-layout__footer">
        <div className="container app-layout__footer-inner">
          <span>ClubFlow · Bản demo giao diện · dữ liệu hư cấu</span>
          <StatusBadge status={apiStatus} />
        </div>
      </footer>
    </div>
  );
}
