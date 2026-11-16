import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { formatDate } from '../../../utils/format.js';

const INTERVIEW_WINDOWS = Object.freeze([
  { value: '09:00-12:00', start: '09:00', end: '12:00' },
  { value: '13:00-17:00', start: '13:00', end: '17:00' },
]);

/**
 * Campaign-level interview configuration (reference "Chuẩn bị phỏng vấn"):
 * one date, the window applicants choose availability from, and the common
 * duration. Editable in a draft; shown as text with `readOnly` (published).
 * It is not applicant availability and not an interview assignment.
 */
export default function InterviewSetupCard({ values, errors, disabled, readOnly, onChange }) {
  const windowValue = `${values.interviewWindow.start}-${values.interviewWindow.end}`;

  if (readOnly) {
    return (
      <Card title="Chuẩn bị phỏng vấn">
        <div className="stack">
          <dl className="summary-list">
            <div>
              <dt>Ngày phỏng vấn</dt>
              <dd>{formatDate(values.interviewDate)}</dd>
            </div>
            <div>
              <dt>Khung giờ ứng viên chọn</dt>
              <dd>
                {values.interviewWindow.start}–{values.interviewWindow.end}
              </dd>
            </div>
            <div>
              <dt>Thời lượng mỗi ca</dt>
              <dd>{values.slotMinutes} phút, dùng chung cho mọi buổi phỏng vấn</dd>
            </div>
          </dl>
          <p className="hint">
            Ứng viên chọn giờ rảnh theo cấu hình này khi nộp hồ sơ. Việc phân công từng buổi phỏng vấn thực hiện ở Interview
            Scheduling.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Chuẩn bị phỏng vấn">
      <div className="stack">
        <FormField
          id="interview-date"
          label="Ngày phỏng vấn"
          error={errors.interviewDate}
          hint={[
            values.interviewDate ? `Ngày đã chọn: ${formatDate(values.interviewDate)}.` : '',
            values.closesOn ? `Sau ngày đóng đơn ${formatDate(values.closesOn)}.` : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {(props) => (
            <input
              {...props}
              type="date"
              value={values.interviewDate ?? ''}
              disabled={disabled}
              onChange={(event) => onChange('interviewDate', event.target.value)}
            />
          )}
        </FormField>
        <FormField id="interview-window" label="Khung giờ ứng viên chọn">
          {(props) => (
            <select
              {...props}
              value={windowValue}
              disabled={disabled}
              onChange={(event) => {
                const selected = INTERVIEW_WINDOWS.find((item) => item.value === event.target.value);
                onChange('interviewWindow', { start: selected.start, end: selected.end });
              }}
            >
              {INTERVIEW_WINDOWS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.start}–{item.end}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id="slot-duration" label="Thời lượng mỗi ca" hint="Dùng chung cho mọi buổi phỏng vấn của chiến dịch.">
          {(props) => (
            <select
              {...props}
              value={String(values.slotMinutes)}
              disabled={disabled}
              onChange={(event) => onChange('slotMinutes', Number(event.target.value))}
            >
              {[15, 20, 30].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} phút
                </option>
              ))}
            </select>
          )}
        </FormField>
        <p className="hint">Ba thông tin này sẽ khóa khi chiến dịch được công bố, vì ứng viên chọn giờ rảnh dựa trên chúng.</p>
      </div>
    </Card>
  );
}
