import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '../components/organisms/AppHeader/index.js';
import DemoBar from '../components/organisms/DemoBar/index.js';
import SignInDialog from '../components/organisms/SignInDialog/index.js';
import StatusBadge from '../components/molecules/StatusBadge/index.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useApiHealth from '../hooks/useApiHealth.js';
import { HOME_BY_ROLE, NAV_BY_ROLE } from '../routes/navigation.js';
import { ROUTES } from '../routes/paths.js';
import { toUiError } from '../services/uiError.js';
import './AppLayout.css';

/**
 * Application shell for every route: skip link, header, one <main>, footer.
 * Pages render inside <Outlet />. Pages can open the shared sign-in dialog
 * through the outlet context: `useOutletContext().openSignIn()`.
 */
export default function AppLayout() {
  const {
    account,
    role,
    accounts,
    signIn,
    signOut,
    scenarios,
    scenarioId,
    setScenario,
    simulation,
    setSimulation,
    resetDemo,
  } = useDemoSession();
  const { status: apiStatus } = useApiHealth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const isFirstRender = useRef(true);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInBusy, setSignInBusy] = useState(false);
  const [signInError, setSignInError] = useState('');

  // Move focus to the new page on client-side navigation (not on first load).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  function openSignIn() {
    setSignInError('');
    setSignInOpen(true);
  }

  async function handleSignIn(accountId) {
    setSignInBusy(true);
    setSignInError('');
    try {
      const signedIn = await signIn(accountId);
      setSignInOpen(false);
      const home = HOME_BY_ROLE[signedIn.role];
      if (pathname !== home && !(signedIn.role === 'applicant' && pathname === ROUTES.HOME)) {
        navigate(home);
      }
    } catch (error) {
      setSignInError(toUiError(error).message);
    } finally {
      setSignInBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
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
        onSignIn={openSignIn}
        onSignOut={handleSignOut}
      />
      <DemoBar
        scenarios={scenarios}
        scenarioId={scenarioId}
        onScenarioChange={setScenario}
        simulation={simulation}
        onSimulationChange={setSimulation}
        onReset={resetDemo}
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
      {signInOpen ? (
        <SignInDialog
          open
          accounts={accounts}
          defaultAccountId={account?.id}
          busy={signInBusy}
          error={signInError}
          onSignIn={handleSignIn}
          onClose={() => setSignInOpen(false)}
        />
      ) : null}
    </div>
  );
}
