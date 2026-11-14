import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { formatDate } from '../../../utils/format.js';

const INTERVIEW_WINDOWS = Object.freeze([
  { value: '09:00-12:00', start: '09:00', end: '12:00' },
  { value: '13:00-17:00', start: '13:00', end: '17:00' },
]);

/** Interview preparation (reference "Chuẩn bị phỏng vấn"): one date, window, common duration. */
export default function InterviewSetupCard({ values, errors, disabled, lockedHint, onChange }) {
  const windowValue = `${values.interviewWindow.start}-${values.interviewWindow.end}`;

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
        {lockedHint ? <p className="hint">{lockedHint}</p> : null}
      </div>
    </Card>
  );
}
