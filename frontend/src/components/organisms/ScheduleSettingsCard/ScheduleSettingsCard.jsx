import Button from '../../atoms/Button/index.js';
import Card from '../../molecules/Card/index.js';
import ChoiceGroup from '../../molecules/ChoiceGroup/index.js';
import FormField from '../../molecules/FormField/index.js';
import { formatDate } from '../../../utils/format.js';

/**
 * Draft parameters (reference "Cấu hình lịch nháp"): the one interview date
 * and window come from the campaign; duration and rooms are chosen here.
 */
export default function ScheduleSettingsCard({ settings, rooms, hasDraft, disabled, onDurationChange, onRoomsChange, onGenerate }) {
  return (
    <Card
      title="Cấu hình lịch nháp"
      actions={
        <Button onClick={onGenerate} disabled={disabled}>
          {hasDraft ? 'Tạo lại lịch nháp' : 'Tạo lịch nháp'}
        </Button>
      }
    >
      <div className="stack">
        <div className="field-grid">
          <FormField id="schedule-date" label="Ngày phỏng vấn" hint="Một ngày phỏng vấn cho cả chiến dịch.">
            {(props) => <input {...props} value={formatDate(settings.interviewDate)} readOnly />}
          </FormField>
          <FormField id="schedule-window" label="Khoảng giờ">
            {(props) => <input {...props} value={`${settings.interviewWindow.start}–${settings.interviewWindow.end}`} readOnly />}
          </FormField>
          <FormField id="schedule-duration" label="Thời lượng mỗi ca" hint="Dùng chung cho mọi buổi phỏng vấn.">
            {(props) => (
              <select
                {...props}
                value={String(settings.slotMinutes)}
                disabled={disabled}
                onChange={(event) => onDurationChange(Number(event.target.value))}
              >
                {[15, 20, 30].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} phút
                  </option>
                ))}
              </select>
            )}
          </FormField>
          <ChoiceGroup
            legend="Phòng có sẵn"
            name="rooms"
            options={rooms.map((room) => ({ value: room.id, label: room.name }))}
            value={settings.roomIds}
            onChange={onRoomsChange}
            disabled={disabled}
          />
        </div>
        <p className="hint">Bạn sẽ được hỏi trước khi thay thế lịch nháp hiện tại.</p>
      </div>
    </Card>
  );
}
