import { useId } from 'react';
import Badge from '../../atoms/Badge/index.js';
import { ROLE_LABELS } from '../../../constants/labels.js';
import './DemoBar.css';

/**
 * Development-only demo controls: a quick account switch that still signs in
 * through the HTTP login endpoint (the product flow is the /login page). All
 * data comes from the HTTP mock; its mode and reset are controlled when the
 * mock is started, never from the browser. Collapsed by default so it does
 * not push page content down on small screens.
 */
const ROLE_ORDER = ['applicant', 'executive', 'interviewer'];

export default function DemoBar({ accounts = [], accountId = '', onAccountChange }) {
  const accountFieldId = useId();

  return (
    <section className="demo-bar" aria-label="Điều khiển bản demo">
      <details className="container demo-bar__details">
        <summary className="demo-bar__summary">
          <Badge tone="warning">Demo</Badge>
          <span>Dữ liệu từ HTTP mock</span>
          <span className="demo-bar__toggle">Tùy chọn demo</span>
        </summary>
        <div className="demo-bar__panel">
          <p className="hint">
            Mọi dữ liệu đến từ HTTP mock qua <code>/api</code>. Chọn chế độ normal/slow/error/empty
            bằng biến <code>MOCK_MODE</code> khi khởi động mock; khởi động lại mock để đặt lại dữ
            liệu.
          </p>
          <div className="demo-bar__controls">
            <label className="demo-bar__field" htmlFor={accountFieldId}>
              <span>Đổi tài khoản nhanh (chỉ để thử nghiệm)</span>
              <select
                id={accountFieldId}
                value={accountId}
                onChange={(event) => onAccountChange(event.target.value)}
              >
                <option value="">Không đăng nhập (khách)</option>
                {ROLE_ORDER.map((role) => (
                  <optgroup key={role} label={ROLE_LABELS[role]}>
                    {accounts
                      .filter((account) => account.role === role)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.displayName}
                          {account.description ? ` · ${account.description}` : ''}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
        </div>
      </details>
    </section>
  );
}
