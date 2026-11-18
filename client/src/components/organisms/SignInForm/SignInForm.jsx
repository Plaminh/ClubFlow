import { useRef, useState } from 'react';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import './SignInForm.css';

export default function SignInForm({ onSubmit, pending, serviceError, examples = [] }) {
  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!values.username.trim()) nextErrors.username = 'Tên đăng nhập là bắt buộc.';
    if (!values.password) nextErrors.password = 'Mật khẩu là bắt buộc.';
    setErrors(nextErrors);
    const first = nextErrors.username ? usernameRef : nextErrors.password ? passwordRef : null;
    if (first) {
      first.current?.focus();
      return;
    }
    await onSubmit(values);
  }

  return (
    <div className="sign-in-grid">
      <Card title="Thông tin đăng nhập">
        <form onSubmit={handleSubmit} noValidate>
          {serviceError ? (
            <Alert tone="error" title="Không thể đăng nhập" live>
              <p>{serviceError.message}</p>
            </Alert>
          ) : null}
          <FormField id="sign-in-username" label="Tên đăng nhập" error={errors.username}>
            {(props) => (
              <input {...props} ref={usernameRef} type="text" autoComplete="username" value={values.username} disabled={pending} onChange={(event) => update('username', event.target.value)} />
            )}
          </FormField>
          <FormField
            id="sign-in-password"
            label="Mật khẩu"
            error={errors.password}
            extra={
              <Button className="sign-in-form__toggle" variant="quiet" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              </Button>
            }
          >
            {(props) => (
              <input {...props} ref={passwordRef} type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={values.password} disabled={pending} onChange={(event) => update('password', event.target.value)} />
            )}
          </FormField>
          <Button type="submit" block disabled={pending}>{pending ? 'Đang đăng nhập…' : 'Đăng nhập'}</Button>
        </form>
      </Card>

      <Card as="aside" title="Tài khoản demo" subtitle="Dữ liệu hư cấu dành riêng cho bản mẫu.">
        <Alert tone="warning" title="Không phải tài khoản thật">
          <p>Mật khẩu dưới đây được công khai cho môi trường phát triển và chỉ được lưu dưới dạng phiên bearer trong tab hiện tại.</p>
        </Alert>
        <dl className="summary-list sign-in-form__examples">
          {examples.map((example) => (
            <div key={example.username}>
              <dt>{example.displayName}</dt>
              <dd><code>{example.username}</code><br /><code>{example.password}</code></dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
