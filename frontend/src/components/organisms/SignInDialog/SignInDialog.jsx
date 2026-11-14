import { useState } from 'react';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import FormField from '../../molecules/FormField/index.js';
import Modal from '../Modal/index.js';
import { ROLE_LABELS } from '../../../constants/labels.js';

const ROLE_ORDER = ['applicant', 'executive', 'interviewer'];

/**
 * Shared demo sign-in dialog. Picks a fictional account; no passwords,
 * registration, or recovery (out of scope per PRODUCT_SPEC §6).
 */
export default function SignInDialog({ open, accounts, defaultAccountId, onSignIn, onClose, busy = false, error }) {
  const [accountId, setAccountId] = useState(defaultAccountId ?? accounts[0]?.id ?? '');

  function handleSubmit(event) {
    event.preventDefault();
    if (accountId) {
      onSignIn(accountId);
    }
  }

  return (
    <Modal open={open} title="Sign In" onClose={onClose}>
      <Alert tone="info" title="Tài khoản demo">
        <p>
          Đây là mô phỏng giao diện, không có xác thực thật và không dùng mật khẩu. Quyền truy cập thật do backend
          thực thi.
        </p>
      </Alert>
      {error ? (
        <Alert tone="error" title="Chưa thể đăng nhập" live>
          <p>{error}</p>
        </Alert>
      ) : null}
      <form className="stack" onSubmit={handleSubmit}>
        <FormField label="Chọn tài khoản demo">
          {(props) => (
            <select {...props} value={accountId} onChange={(event) => setAccountId(event.target.value)} data-autofocus>
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
          )}
        </FormField>
        <div className="button-row button-row--end">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={busy || !accountId}>
            {busy ? 'Đang đăng nhập…' : 'Sign In (demo)'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
