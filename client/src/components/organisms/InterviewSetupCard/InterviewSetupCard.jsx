import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { formatDate } from '../../../utils/format.js';
import './InterviewSetupCard.css';

const WINDOWS = [
  { value: '09:00-12:00', start: '09:00', end: '12:00' },
  { value: '13:00-17:00', start: '13:00', end: '17:00' },
];

function timeOf(value, fallback) {
  return value?.slice(11, 16) || fallback;
}

function instant(date, time) {
  return `${date}T${time}:00+07:00`;
}

export default function InterviewSetupCard({ values, errors, disabled, readOnly, onChange }) {
  const windowValue = `${values.interviewWindow.start}-${values.interviewWindow.end}`;
  const updateAssignment = (interviewerId, updater) => {
    const assignments = values.assignments.map((item) => (item.interviewerId === interviewerId ? updater(item) : item));
    onChange('assignments', assignments);
  };

  if (readOnly) {
    return (
      <Card title="Chuẩn bị phỏng vấn">
        <dl className="summary-list">
          <div><dt>Ngày phỏng vấn</dt><dd>{formatDate(values.interviewDate)}</dd></div>
          <div><dt>Khung giờ</dt><dd>{values.interviewWindow.start}–{values.interviewWindow.end}</dd></div>
          <div><dt>Thời lượng</dt><dd>{values.slotMinutes} phút/ca</dd></div>
          <div><dt>Phòng</dt><dd>{values.rooms.filter((room) => values.roomIds.includes(room.id)).map((room) => room.name).join(', ') || '—'}</dd></div>
          <div><dt>Phân công</dt><dd>{values.assignments.filter((item) => item.positionIds.length).map((item) => `${item.interviewerName}: ${item.positionNames.join(', ')}`).join(' · ') || '—'}</dd></div>
        </dl>
      </Card>
    );
  }

  return (
    <Card title="Chuẩn bị phỏng vấn">
      <div className="stack">
        <FormField id="interview-date" label="Ngày phỏng vấn" error={errors.interviewDate} hint={values.closesOn ? `Sau ngày đóng đơn ${formatDate(values.closesOn)}.` : ''}>
          {(props) => <input {...props} type="date" value={values.interviewDate ?? ''} disabled={disabled} onChange={(event) => onChange('interviewDate', event.target.value)} />}
        </FormField>
        <FormField id="interview-window" label="Khung giờ ứng viên chọn" error={errors.interviewWindow}>
          {(props) => (
            <select {...props} value={windowValue} disabled={disabled} onChange={(event) => {
              const selected = WINDOWS.find((item) => item.value === event.target.value);
              onChange('interviewWindow', { start: selected.start, end: selected.end });
            }}>
              {WINDOWS.map((item) => <option key={item.value} value={item.value}>{item.start}–{item.end}</option>)}
            </select>
          )}
        </FormField>
        <FormField id="slot-duration" label="Thời lượng mỗi ca" error={errors.slotMinutes}>
          {(props) => <select {...props} value={String(values.slotMinutes)} disabled={disabled} onChange={(event) => onChange('slotMinutes', Number(event.target.value))}>{[15, 20, 30].map((minutes) => <option key={minutes} value={minutes}>{minutes} phút</option>)}</select>}
        </FormField>

        <fieldset>
          <legend>Phòng phỏng vấn</legend>
          {values.rooms.map((room) => (
            <label key={room.id} className="checkbox-row">
              <input type="checkbox" checked={values.roomIds.includes(room.id)} disabled={disabled} onChange={(event) => onChange('roomIds', event.target.checked ? [...values.roomIds, room.id] : values.roomIds.filter((id) => id !== room.id))} />
              {room.name}
            </label>
          ))}
          {errors.roomIds ? <p className="field-error">{errors.roomIds}</p> : null}
        </fieldset>

        <fieldset>
          <legend>Interviewer, vị trí và thời gian rảnh</legend>
          {values.assignments.map((assignment, index) => (
            <div key={assignment.interviewerId} className="stack stack--tight">
              <strong>{assignment.interviewerName}</strong>
              {values.positions.map((position) => (
                <label key={position.key} className="checkbox-row">
                  <input type="checkbox" checked={assignment.positionIds.includes(position.id)} disabled={disabled || !position.id} onChange={(event) => updateAssignment(assignment.interviewerId, (current) => ({ ...current, positionIds: event.target.checked ? [...current.positionIds, position.id] : current.positionIds.filter((id) => id !== position.id) }))} />
                  {position.name || 'Vị trí chưa đặt tên'}
                </label>
              ))}
              <div className="field-grid">
                <FormField id={`availability-${index}-start`} label="Rảnh từ" error={errors[`assignments.${index}.availability`]}>
                  {(props) => <input {...props} type="time" value={timeOf(assignment.availability[0]?.start, values.interviewWindow.start)} disabled={disabled} onChange={(event) => updateAssignment(assignment.interviewerId, (current) => ({ ...current, availability: [{ start: instant(values.interviewDate, event.target.value), end: current.availability[0]?.end ?? instant(values.interviewDate, values.interviewWindow.end) }] }))} />}
                </FormField>
                <FormField id={`availability-${index}-end`} label="Rảnh đến">
                  {(props) => <input {...props} type="time" value={timeOf(assignment.availability[0]?.end, values.interviewWindow.end)} disabled={disabled} onChange={(event) => updateAssignment(assignment.interviewerId, (current) => ({ ...current, availability: [{ start: current.availability[0]?.start ?? instant(values.interviewDate, values.interviewWindow.start), end: instant(values.interviewDate, event.target.value) }] }))} />}
                </FormField>
              </div>
            </div>
          ))}
          {errors.assignments ? <p className="field-error">{errors.assignments}</p> : null}
        </fieldset>
      </div>
    </Card>
  );
}
