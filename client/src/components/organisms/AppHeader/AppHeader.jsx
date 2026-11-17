import { Link, NavLink } from 'react-router-dom';
import Button from '../../atoms/Button/index.js';
import AccountMenu from '../../molecules/AccountMenu/index.js';
import { ROLE_LABELS } from '../../../constants/labels.js';
import './AppHeader.css';

/**
 * Site header: brand, role-specific navigation, current demo identity, and
 * the sign-in / sign-out entry. Pure presentation; the layout supplies data.
 */
export default function AppHeader({ homeTo, navItems, account, role, signInTo, signInState, profileTo, onSignOut }) {
  let who = 'Khách (chưa đăng nhập)';
  if (account) {
    // The Executive account is named after its role; show the club instead of repeating it.
    const detail = account.displayName === ROLE_LABELS[role] ? account.description : ROLE_LABELS[role];
    who = `${account.displayName} · ${detail}`;
  }

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
            <AccountMenu displayName={account.displayName} profileTo={profileTo} onSignOut={onSignOut} />
          ) : (
            <Button to={signInTo} state={signInState}>
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
