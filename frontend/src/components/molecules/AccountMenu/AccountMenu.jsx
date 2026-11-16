import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../atoms/Button/index.js';
import './AccountMenu.css';

/**
 * Account disclosure for a signed-in (simulated) user: "Hồ sơ cá nhân" and "Đăng xuất".
 * Keyboard: Enter/Space on the trigger toggles it, Escape closes it and returns
 * focus to the trigger, and Tab out of the menu or a click outside closes it.
 * It is a disclosure (not role="menu") so Tab keeps working as users expect.
 */
export default function AccountMenu({ displayName, profileTo, onSignOut }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function handleKeyDown(event) {
    if (open && event.key === 'Escape') {
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  function handleBlur(event) {
    if (open && !rootRef.current?.contains(event.relatedTarget)) {
      setOpen(false);
    }
  }

  return (
    <div className="account-menu" ref={rootRef} onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <button
        ref={triggerRef}
        type="button"
        className="button button--secondary account-menu__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Tài khoản của ${displayName}`}
        onClick={() => setOpen((value) => !value)}
      >
        Tài khoản
      </button>
      {open ? (
        <ul className="account-menu__panel" id={panelId}>
          <li>
            <Link className="account-menu__item" to={profileTo} onClick={() => setOpen(false)}>
              Hồ sơ cá nhân
            </Link>
          </li>
          <li>
            <Button
              className="account-menu__item"
              variant="quiet"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              Đăng xuất
            </Button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
