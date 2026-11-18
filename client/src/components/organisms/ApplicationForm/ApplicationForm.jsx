import { useEffect, useRef, useState } from 'react';
import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import ChoiceGroup from '../../molecules/ChoiceGroup/index.js';
import FileField from '../../molecules/FileField/index.js';
import FormField from '../../molecules/FormField/index.js';
import { formatDate, formatTimeRange } from '../../../utils/format.js';
import { MAX_SOP_WORDS, countWords, validateApplicationInput } from '../../../utils/validation.js';
import './ApplicationForm.css';

const FACULTIES = ['Công nghệ thông tin', 'Thiết kế', 'Truyền thông'];

function emptyValues(account) {
  return { positionId: '', email: account.email ?? '', faculty: account.faculty ?? FACULTIES[0], sop: '', slotIds: [], cv: null };
}

/**
 * Application form (reference applicant.html "Apply"): fixed student fields,
 * PDF CV ≤ 5 MB, SOP ≤ 300 words with a live counter, club-provided slots.
 * Client checks give fast feedback; `onSubmit` returns the service result,
 * whose field errors are shown the same way.
 */
export default function ApplicationForm({ account, positions, slots, slotMinutes, interviewDate, applications, disabled, onSubmit }) {
  const [values, setValues] = useState(() => emptyValues(account));
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [pending, setPending] = useState(false);
  const [focusErrors, setFocusErrors] = useState(0);
  const formRef = useRef(null);
  const words = countWords(values.sop);
  const appliedByPosition = Object.fromEntries(applications.map((application) => [application.positionId, application.id]));

  useEffect(() => {
    if (focusErrors > 0) {
      formRef.current?.querySelector('[aria-invalid="true"], .choice-group--invalid input')?.focus();
    }
  }, [focusErrors]);

  function set(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
    if (field === 'positionId' && appliedByPosition[value]) {
      setErrors((previous) => ({
        ...previous,
        positionId: `Bạn đã nộp hồ sơ ${appliedByPosition[value]} cho vị trí này. Mỗi vị trí chỉ có một hồ sơ trong chiến dịch; bạn vẫn có thể ứng tuyển vị trí khác.`,
      }));
    }
  }

  function fail(fieldErrors, title = 'Chưa thể gửi hồ sơ') {
    setErrors(fieldErrors);
    setBanner({ tone: 'error', title, text: 'Hãy sửa các trường được đánh dấu. Dữ liệu hợp lệ bạn đã nhập vẫn được giữ lại.' });
    setFocusErrors((count) => count + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBanner(null);
    const fieldErrors = validateApplicationInput(values);
    if (appliedByPosition[values.positionId]) {
      fieldErrors.positionId = `Bạn đã nộp hồ sơ ${appliedByPosition[values.positionId]} cho vị trí này. Mỗi vị trí chỉ có một hồ sơ trong chiến dịch; bạn vẫn có thể ứng tuyển vị trí khác.`;
    }
    if (Object.keys(fieldErrors).length > 0) {
      fail(fieldErrors);
      return;
    }

    const formData = new FormData();
    formData.set('positionId', values.positionId);
    formData.set('email', values.email);
    formData.set('faculty', values.faculty);
    formData.set('sop', values.sop);
    values.slotIds.forEach((slotId) => formData.append('slotIds', slotId));
    formData.set('cv', values.cv);

    setPending(true);
    const result = await onSubmit(formData);
    setPending(false);
    if (result.ok) {
      setValues(emptyValues(account));
      setErrors({});
      setBanner({
        tone: 'success',
        title: `Đã gửi hồ sơ ${result.value.id}`,
        text: 'Hồ sơ mới xuất hiện trong tab My Applications với trạng thái Chờ duyệt.',
      });
    } else if (result.error?.fieldErrors) {
      fail(result.error.fieldErrors, result.error.message);
    } else if (result.error) {
      setBanner({ tone: 'error', title: 'Chưa thể gửi hồ sơ', text: result.error.message });
    }
  }

  const position = positions.find((item) => item.id === values.positionId);
  const chosenSlots = slots.filter((slot) => values.slotIds.includes(slot.id));

  return (
    <form ref={formRef} className="stack" noValidate onSubmit={handleSubmit}>
      {banner ? (
        <Alert tone={banner.tone} title={banner.title} live>
          <p>{banner.text}</p>
        </Alert>
      ) : null}
      <div className="split-layout split-layout--wide-first">
        <Card title="Hồ sơ ứng tuyển" actions={<Badge tone="warning">Bản nháp</Badge>}>
          <div className="stack">
            <FormField
              id="apply-position"
              label="Vị trí ứng tuyển"
              error={errors.positionId}
              hint="Bạn có thể ứng tuyển nhiều vị trí, mỗi vị trí một hồ sơ."
            >
              {(props) => (
                <select {...props} value={values.positionId} disabled={disabled} onChange={(event) => set('positionId', event.target.value)}>
                  <option value="">Chọn vị trí…</option>
                  {positions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {appliedByPosition[item.id] ? ' (đã nộp)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <div className="field-grid">
              <FormField id="apply-name" label="Họ và tên">
                {(props) => <input {...props} value={account.displayName} readOnly />}
              </FormField>
              <FormField id="apply-student-id" label="Mã số sinh viên">
                {(props) => <input {...props} value={account.studentId ?? ''} readOnly />}
              </FormField>
              <FormField id="apply-email" label="Email liên hệ" error={errors.email}>
                {(props) => (
                  <input
                    {...props}
                    type="email"
                    value={values.email}
                    disabled={disabled}
                    onChange={(event) => set('email', event.target.value)}
                  />
                )}
              </FormField>
              <FormField id="apply-faculty" label="Khoa" error={errors.faculty}>
                {(props) => (
                  <select {...props} value={values.faculty} disabled={disabled} onChange={(event) => set('faculty', event.target.value)}>
                    {FACULTIES.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            </div>
            <FileField
              id="apply-cv"
              label="CV (PDF, tối đa 5 MB)"
              accept="application/pdf,.pdf"
              file={values.cv}
              error={errors.cv}
              hint="Tệp được gửi bằng multipart tới dịch vụ ClubFlow và phải là PDF tối đa 5 MB."
              disabled={disabled}
              onChange={(file) => set('cv', file)}
            />
            <FormField
              id="apply-sop"
              label="Bài trình bày nguyện vọng (Statement of Purpose)"
              error={errors.sop}
              extra={
                <p className={`sop-counter ${words > MAX_SOP_WORDS ? 'sop-counter--over' : ''}`.trim()} aria-live="polite">
                  <span>Tối đa {MAX_SOP_WORDS} từ</span>
                  <strong>
                    {words} / {MAX_SOP_WORDS} từ
                  </strong>
                </p>
              }
            >
              {(props) => (
                <textarea
                  {...props}
                  rows={7}
                  value={values.sop}
                  disabled={disabled}
                  onChange={(event) => set('sop', event.target.value)}
                />
              )}
            </FormField>
            <ChoiceGroup
              legend={`Khung giờ phỏng vấn có thể tham gia · ${formatDate(interviewDate)}`}
              name="slotIds"
              options={slots.map((slot) => ({ value: slot.id, label: formatTimeRange(slot.start, slot.end) }))}
              value={values.slotIds}
              onChange={(slotIds) => set('slotIds', slotIds)}
              hint={`Mỗi ca kéo dài ${slotMinutes} phút. Lịch chính thức chỉ hiển thị sau khi Ban tuyển dụng xác nhận.`}
              error={errors.slotIds}
              disabled={disabled}
            />
          </div>
        </Card>
        <Card as="aside" title="Tóm tắt hồ sơ">
          <div className="stack">
            <dl className="summary-list">
              <div>
                <dt>Vị trí</dt>
                <dd>{position?.name ?? 'Chưa chọn'}</dd>
              </div>
              <div>
                <dt>CV</dt>
                <dd>{values.cv?.name ?? 'Chưa chọn tệp'}</dd>
              </div>
              <div>
                <dt>Bài trình bày</dt>
                <dd>
                  {words} / {MAX_SOP_WORDS} từ
                </dd>
              </div>
              <div>
                <dt>Khung giờ</dt>
                <dd>{chosenSlots.map((slot) => formatTimeRange(slot.start, slot.end)).join(', ') || 'Chưa chọn'}</dd>
              </div>
            </dl>
            <Button type="submit" block disabled={disabled || pending}>
              {pending ? 'Đang gửi…' : 'Submit Application'}
            </Button>
            <p className="hint">
              Kiểm tra kỹ trước khi gửi: sau khi gửi, bạn không thể sửa hồ sơ, đổi CV hay đổi khung giờ đã chọn.
            </p>
            <p className="hint">Gửi hồ sơ không bảo đảm kết quả. Mỗi vị trí chỉ nhận một hồ sơ từ cùng tài khoản.</p>
          </div>
        </Card>
      </div>
    </form>
  );
}
