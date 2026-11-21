import { useEffect, useRef, useState } from 'react';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { isEmail } from '../../../utils/validation.js';

// Mounted fresh each time editing starts (and re-keyed by ProfilePage on any
// session change), so the initial values never belong to another account.
export default function ProfileEditForm({ profile, saving, serviceError, onSave, onCancel }) {
  const [values, setValues] = useState({ displayName: profile.displayName, email: profile.email });
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const focusAfterSave = useRef(null);

  // Fields are disabled while saving, so a field rejected by the service can
  // only receive focus once the request has settled. No dependency list: the
  // target is set after "saving" may already have rendered as false, and the
  // setErrors() that follows it always causes the render this effect needs.
  useEffect(() => {
    if (!saving && focusAfterSave.current) {
      focusAfterSave.current.current?.focus();
      focusAfterSave.current = null;
    }
  });

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!values.displayName.trim()) nextErrors.displayName = 'Họ và tên là bắt buộc.';
    if (!values.email.trim()) nextErrors.email = 'Email là bắt buộc.';
    else if (!isEmail(values.email)) nextErrors.email = 'Email chưa đúng định dạng.';
    setErrors(nextErrors);
    const first = nextErrors.displayName ? nameRef : nextErrors.email ? emailRef : null;
    if (first) {
      first.current?.focus();
      return;
    }
    const result = await onSave(values);
    if (!result.ok && result.error?.fieldErrors) {
      setErrors(result.error.fieldErrors);
      focusAfterSave.current = result.error.fieldErrors.displayName ? nameRef : emailRef;
    }
  }

  return (
    <Card
      title="Chỉnh sửa hồ sơ"
      subtitle="Chỉ họ tên hiển thị và email có thể thay đổi trong bản mẫu."
    >
      <form className="stack" noValidate onSubmit={handleSubmit}>
        {serviceError ? (
          <Alert tone="error" title="Chưa thể lưu thay đổi" live>
            <p>{serviceError.message}</p>
          </Alert>
        ) : null}
        <FormField id="profile-display-name" label="Họ và tên" error={errors.displayName}>
          {(props) => (
            <input
              {...props}
              ref={nameRef}
              autoComplete="name"
              value={values.displayName}
              disabled={saving}
              onChange={(event) => update('displayName', event.target.value)}
            />
          )}
        </FormField>
        <FormField id="profile-email" label="Email" error={errors.email}>
          {(props) => (
            <input
              {...props}
              ref={emailRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              disabled={saving}
              onChange={(event) => update('email', event.target.value)}
            />
          )}
        </FormField>
        <div className="button-row button-row--end">
          <Button variant="secondary" disabled={saving} onClick={onCancel}>
            Hủy thay đổi
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
