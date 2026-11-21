import { useEffect, useRef, useState } from 'react';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import FormField from '../../molecules/FormField/index.js';
import Modal from '../Modal/index.js';
import { formatTimeRange } from '../../../utils/format.js';

/**
 * Manual edit / assign-slot dialog for one draft row. Options come from the
 * schedule view (sessions in the window, interviewers assigned to the
 * position, available rooms); the service re-checks the result.
 */
export default function ScheduleRowDialog({
  row,
  sessionStarts,
  slotMinutes,
  interviewers,
  rooms,
  busy,
  error,
  onSubmit,
  onClose,
}) {
  const [values, setValues] = useState({
    start: row.start ?? sessionStarts[0] ?? '',
    interviewerId: row.interviewerId ?? interviewers[0]?.id ?? '',
    roomId: row.roomId ?? rooms[0]?.id ?? '',
  });
  const fieldErrors = error?.fieldErrors ?? {};
  const formRef = useRef(null);

  // UI-FR-017: when the service rejects the change field by field, focus the first invalid field.
  useEffect(() => {
    if (error?.fieldErrors) {
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
    }
  }, [error]);
  const set = (field) => (event) =>
    setValues((previous) => ({ ...previous, [field]: event.target.value }));
  const endOf = (start) => new Date(new Date(start).getTime() + slotMinutes * 60000).toISOString();

  return (
    <Modal
      open
      title={`${row.status === 'unassigned' ? 'Gán khung giờ' : 'Sửa phân công'} · ${row.applicationId}`}
      onClose={onClose}
    >
      <p>
        {row.applicantName} · {row.positionName} · giờ rảnh {row.availabilityText || '—'}
      </p>
      {row.reasons.length > 0 && row.status !== 'proposed' ? (
        <Alert tone={row.status === 'conflict' ? 'error' : 'warning'} title="Lý do hiện tại">
          <p>{row.reasons.join(' ')}</p>
        </Alert>
      ) : null}
      {error && !error.fieldErrors ? (
        <Alert tone="error" title="Chưa cập nhật được" live>
          <p>{error.message}</p>
        </Alert>
      ) : null}
      <form
        ref={formRef}
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(values);
        }}
      >
        <FormField id="row-start" label="Ca phỏng vấn" error={fieldErrors.start}>
          {(props) => (
            <select {...props} value={values.start} onChange={set('start')} data-autofocus>
              {sessionStarts.map((start) => (
                <option key={start} value={start}>
                  {formatTimeRange(start, endOf(start))}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField
          id="row-interviewer"
          label="Người phỏng vấn"
          error={fieldErrors.interviewerId}
          hint="Chỉ gồm người được phân công cho vị trí này."
        >
          {(props) => (
            <select {...props} value={values.interviewerId} onChange={set('interviewerId')}>
              {interviewers.map((interviewer) => (
                <option key={interviewer.id} value={interviewer.id}>
                  {interviewer.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id="row-room" label="Phòng" error={fieldErrors.roomId}>
          {(props) => (
            <select {...props} value={values.roomId} onChange={set('roomId')}>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <p className="hint">
          Sau khi lưu, hệ thống kiểm tra lại giờ rảnh, người phỏng vấn và phòng của toàn bộ lịch
          nháp.
        </p>
        <div className="button-row button-row--end">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Đang cập nhật…' : 'Cập nhật ca'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
