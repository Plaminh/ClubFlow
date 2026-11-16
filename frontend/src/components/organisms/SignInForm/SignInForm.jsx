import { useRef, useState } from 'react';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { isEmail } from '../../../utils/validation.js';
import './SignInForm.css';

export default function SignInForm({ onSubmit, pending, serviceError, examples = [] }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!values.email.trim()) {
      nextErrors.email = 'Email là bắt buộc.';
    } else if (!isEmail(values.email)) {
      nextErrors.email = 'Email chưa đúng định dạng.';
    }
    if (!values.password) {
      nextErrors.password = 'Mật khẩu là bắt buộc.';
    }
    setErrors(nextErrors);
    const first = nextErrors.email ? emailRef : nextErrors.password ? passwordRef : null;
    if (first) {
      first.current?.focus();
      return;
    }
    await onSubmit(values);
  }

  return (
    <div className="sign-in-grid">
      <Card title="Thông tin đăng nhập" subtitle="Sử dụng tài khoản demo đã được cấp sẵn.">
        <form className="stack" noValidate onSubmit={handleSubmit}>
          {serviceError ? (
            <Alert tone="error" title="Chưa thể đăng nhập" live>
              <p>{serviceError.message}</p>
            </Alert>
          ) : null}
          <FormField id="sign-in-email" label="Email" error={errors.email}>
            {(props) => (
              <input
                {...props}
                ref={emailRef}
                type="email"
                autoComplete="username"
                inputMode="email"
                value={values.email}
                disabled={pending}
                onChange={(event) => update('email', event.target.value)}
              />
            )}
          </FormField>
          <FormField
            id="sign-in-password"
            label="Mật khẩu"
            error={errors.password}
            extra={
              <Button
                className="sign-in-form__toggle"
                variant="quiet"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              </Button>
            }
          >
            {(props) => (
              <input
                {...props}
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={values.password}
                disabled={pending}
                onChange={(event) => update('password', event.target.value)}
              />
            )}
          </FormField>
          <Button type="submit" block disabled={pending}>
            {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </Button>
        </form>
      </Card>

      <Card as="aside" title="Tài khoản demo" subtitle="Dữ liệu hư cấu dành riêng cho bản mẫu.">
        <Alert tone="warning" title="Không phải xác thực thật">
          <p>Mật khẩu dưới đây được công khai cho môi trường phát triển và không được lưu trong trình duyệt.</p>
        </Alert>
        <dl className="summary-list sign-in-form__examples">
          {examples.map((example) => (
            <div key={example.email}>
              <dt>{example.displayName}</dt>
              <dd>
                <code>{example.email}</code>
                <br />
                <code>{example.password}</code>
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
