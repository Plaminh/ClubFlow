import Button from '../../atoms/Button/index.js';
import Card from '../../molecules/Card/index.js';
import ChoiceGroup from '../../molecules/ChoiceGroup/index.js';
import { formatDate } from '../../../utils/format.js';

/**
 * Draft parameters (reference "Cấu hình lịch nháp"). Two different things are
 * kept apart on purpose:
 * - the interview date, window, and common duration belong to the campaign
 *   configuration (Campaign Management) and are only summarized here;
 * - the rooms are a scheduling choice and stay editable until the schedule is
 *   confirmed (`readOnly`), when they are summarized too.
 */
export default function ScheduleSettingsCard({ settings, rooms, hasDraft, disabled, readOnly, onRoomsChange, onGenerate }) {
  const selectedRooms = rooms.filter((room) => settings.roomIds.includes(room.id));

  return (
    <Card
      title="Cấu hình lịch nháp"
      actions={
        <Button onClick={onGenerate} disabled={disabled || readOnly}>
          {hasDraft ? 'Tạo lại lịch nháp' : 'Tạo lịch nháp'}
        </Button>
      }
    >
      <div className="stack">
        <section className="stack stack--tight" aria-label="Cấu hình phỏng vấn của chiến dịch">
          <p className="section-kicker">Từ cấu hình chiến dịch</p>
          <dl className="summary-list summary-list--columns">
            <div>
              <dt>Ngày phỏng vấn</dt>
              <dd>{formatDate(settings.interviewDate)} · một ngày cho cả chiến dịch</dd>
            </div>
            <div>
              <dt>Khoảng giờ</dt>
              <dd>
                {settings.interviewWindow.start}–{settings.interviewWindow.end}
              </dd>
            </div>
            <div>
              <dt>Thời lượng mỗi ca</dt>
              <dd>{settings.slotMinutes} phút · dùng chung cho mọi buổi phỏng vấn</dd>
            </div>
            {readOnly ? (
              <div>
                <dt>Phòng dùng cho lịch</dt>
                <dd>{selectedRooms.map((room) => room.name).join(', ') || '—'}</dd>
              </div>
            ) : null}
          </dl>
          <p className="hint">
            Ngày, khoảng giờ và thời lượng được thiết lập ở Campaign Management và đã khóa từ khi chiến dịch được công bố,
            vì ứng viên chọn giờ rảnh dựa trên chúng.
          </p>
        </section>
        {readOnly ? null : (
          <>
            <ChoiceGroup
              legend="Phòng có sẵn"
              name="rooms"
              options={rooms.map((room) => ({ value: room.id, label: room.name }))}
              value={settings.roomIds}
              onChange={onRoomsChange}
              hint="Chọn phòng dùng cho lịch nháp. Mỗi phòng chỉ có một buổi phỏng vấn tại một thời điểm."
              disabled={disabled}
            />
            <p className="hint">Bạn sẽ được hỏi trước khi thay thế lịch nháp hiện tại.</p>
          </>
        )}
      </div>
    </Card>
  );
}
