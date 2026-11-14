import { Link, NavLink } from 'react-router-dom';
import Button from '../../atoms/Button/index.js';
import { ROLE_LABELS } from '../../../constants/labels.js';
import './AppHeader.css';

/**
 * Site header: brand, role-specific navigation, current demo identity, and
 * the sign-in / sign-out entry. Pure presentation; the layout supplies data.
 */
export default function AppHeader({ homeTo, navItems, account, role, onSignIn, onSignOut }) {
  const who = account ? `${account.displayName} · ${ROLE_LABELS[role]}` : 'Khách (chưa đăng nhập)';

  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <Link className="app-header__brand" to={homeTo}>
          ClubFlow
        </Link>
        <nav className="app-header__nav" aria-label="Điều hướng chính">
          <ul className="app-header__links">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink className="app-header__link" to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="app-header__session">
          <span className="app-header__who">{who}</span>
          {account ? (
            <Button variant="secondary" onClick={onSignOut}>
              Sign Out
            </Button>
          ) : (
            <Button onClick={onSignIn}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
}
