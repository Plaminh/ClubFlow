import { useEffect, useRef, useState } from 'react';
import Button from '../../atoms/Button/index.js';
import Card from '../../molecules/Card/index.js';
import ChoiceGroup from '../../molecules/ChoiceGroup/index.js';
import FormField from '../../molecules/FormField/index.js';
import {
  SLOT_MINUTES,
  toGenerateBody,
  validateScheduleSettings,
} from '../../../utils/scheduleSettings.js';

function fromSettings(settings) {
  return {
    interviewDate: settings.interviewDate ?? '',
    windowStart: settings.interviewWindow?.start ?? '',
    windowEnd: settings.interviewWindow?.end ?? '',
    slotMinutes: String(settings.slotMinutes ?? ''),
  };
}

/** API field errors (400 VALIDATION_ERROR) mapped onto the form's fields. */
function fromApiErrors(fieldErrors = {}) {
  const errors = {};
  if (fieldErrors.interviewDate) errors.interviewDate = fieldErrors.interviewDate;
  if (fieldErrors.interviewWindow) errors.windowEnd = fieldErrors.interviewWindow;
  if (fieldErrors.slotMinutes) errors.slotMinutes = fieldErrors.slotMinutes;
  return errors;
}

/**
 * Draft parameters for C8: the Executive chooses the interview date, the time
 * window and the common duration, then generates the draft. The values start
 * from the current draft's settings (the Campaign's before the first draft).
 * Rooms come from Interview Setup and are only summarized here unless
 * `roomsReadOnly` is false.
 */
export default function ScheduleSettingsCard({
  settings,
  rooms,
  closesOn,
  hasDraft,
  disabled,
  readOnly,
  roomsReadOnly = false,
  apiError,
  onRoomsChange,
  onGenerate,
}) {
  const [values, setValues] = useState(() => fromSettings(settings));
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState(() => fromApiErrors(apiError?.fieldErrors));
  const [shownApiError, setShownApiError] = useState(apiError);
  const formRef = useRef(null);
  const selectedRooms = rooms.filter((room) => settings.roomIds.includes(room.id));

  // A 400 from the API is shown on the matching fields until those fields change.
  if (apiError !== shownApiError) {
    setShownApiError(apiError);
    setServerErrors(fromApiErrors(apiError?.fieldErrors));
  }
  useEffect(() => {
    if (apiError?.fieldErrors) formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [apiError]);

  const clientErrors = attempted ? validateScheduleSettings(values, closesOn) : {};
  const errors = { ...serverErrors, ...clientErrors };

  const set = (field) => (event) => {
    const { value } = event.target;
    setValues((previous) => ({ ...previous, [field]: value }));
    setServerErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      if (field === 'windowStart' || field === 'slotMinutes') delete next.windowEnd;
      return next;
    });
  };

  function submit(event) {
    event.preventDefault();
    if (disabled || readOnly) return;
    setAttempted(true);
    const found = validateScheduleSettings(values, closesOn);
    if (Object.keys(found).length) {
      // Focus after the error messages have rendered.
      setTimeout(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    onGenerate(toGenerateBody(values));
  }

  return (
    <Card title="Cấu hình lịch nháp">
      <form
        ref={formRef}
        className="stack"
        noValidate
        onSubmit={submit}
        aria-label="Cấu hình lịch nháp"
      >
        <div className="field-grid">
          <FormField
            id="schedule-date"
            label="Ngày phỏng vấn"
            error={errors.interviewDate}
            hint="Một ngày cho cả chiến dịch, sau ngày đóng đơn."
          >
            {(props) => (
              <input
                {...props}
                type="date"
                value={values.interviewDate}
                onChange={set('interviewDate')}
                disabled={readOnly}
                required
              />
            )}
          </FormField>
          <FormField id="schedule-window-start" label="Giờ bắt đầu" error={errors.windowStart}>
            {(props) => (
              <input
                {...props}
                type="time"
                step={300}
                value={values.windowStart}
                onChange={set('windowStart')}
                disabled={readOnly}
                required
              />
            )}
          </FormField>
          <FormField id="schedule-window-end" label="Giờ kết thúc" error={errors.windowEnd}>
            {(props) => (
              <input
                {...props}
                type="time"
                step={300}
                value={values.windowEnd}
                onChange={set('windowEnd')}
                disabled={readOnly}
                required
              />
            )}
          </FormField>
          <FormField
            id="schedule-slot-minutes"
            label="Thời lượng mỗi ca"
            error={errors.slotMinutes}
            hint="Dùng chung cho mọi buổi phỏng vấn."
          >
            {(props) => (
              <select
                {...props}
                value={values.slotMinutes}
                onChange={set('slotMinutes')}
                disabled={readOnly}
                required
              >
                <option value="">Chọn thời lượng</option>
                {SLOT_MINUTES.map((minutes) => (
                  <option key={minutes} value={String(minutes)}>
                    {minutes} phút
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </div>

        {readOnly || roomsReadOnly ? (
          <dl className="summary-list">
            <div>
              <dt>Phòng dùng cho lịch</dt>
              <dd>{selectedRooms.map((room) => room.name).join(', ') || '—'}</dd>
            </div>
          </dl>
        ) : (
          <ChoiceGroup
            legend="Phòng có sẵn"
            name="rooms"
            options={rooms.map((room) => ({ value: room.id, label: room.name }))}
            value={settings.roomIds}
            onChange={onRoomsChange}
            hint="Chọn phòng dùng cho lịch nháp. Mỗi phòng chỉ có một buổi phỏng vấn tại một thời điểm."
            disabled={disabled}
          />
        )}

        {readOnly ? (
          <p className="hint">
            Lịch đã xác nhận: ngày, khoảng giờ và thời lượng không thể đổi và không thể tạo lại
            lịch.
          </p>
        ) : (
          <p className="hint">
            Ứng viên chọn giờ rảnh theo cấu hình của chiến dịch; ca nằm ngoài giờ rảnh đó sẽ là
            Unassigned kèm lý do.
            {hasDraft ? ' Bạn sẽ được hỏi trước khi thay thế lịch nháp hiện tại.' : ''}
            {roomsReadOnly
              ? ' Phòng đã được chọn trong Interview Setup và khóa sau hồ sơ hợp lệ đầu tiên.'
              : ''}
          </p>
        )}
        <div className="button-row">
          <Button type="submit" disabled={disabled || readOnly}>
            {hasDraft ? 'Tạo lại lịch nháp' : 'Tạo lịch nháp'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
