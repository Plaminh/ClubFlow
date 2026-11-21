import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Card from '../../molecules/Card/index.js';
import './ConfirmationChecklist.css';

/**
 * BR-13 confirmation conditions (reference "Điều kiện xác nhận"). Each item
 * shows ✓ / ✗ plus text, so status never depends on color alone.
 */
export default function ConfirmationChecklist({ conditions, canConfirm, pending, onConfirm }) {
  return (
    <Card
      title="Điều kiện xác nhận"
      actions={
        <Badge tone={canConfirm ? 'success' : 'danger'}>
          {canConfirm ? 'Sẵn sàng xác nhận' : 'Chưa thể xác nhận'}
        </Badge>
      }
    >
      <div className="stack">
        <ul className="confirmation-checklist">
          {conditions.map((condition) => (
            <li
              key={condition.id}
              className={
                condition.met ? 'confirmation-checklist__met' : 'confirmation-checklist__failed'
              }
            >
              <span aria-hidden="true">{condition.met ? '✓' : '✗'}</span>
              <span>
                <span className="visually-hidden">{condition.met ? 'Đạt: ' : 'Chưa đạt: '}</span>
                {condition.text}
              </span>
            </li>
          ))}
        </ul>
        <div className="button-row">
          <Button onClick={onConfirm} disabled={!canConfirm || pending}>
            Approve &amp; Confirm Schedule
          </Button>
        </div>
        <p className="hint">
          {canConfirm
            ? 'Sau khi xác nhận, ứng viên và người phỏng vấn thấy lịch của mình; cấu hình chiến dịch, quyết định vòng CV và lịch được khóa.'
            : 'Xử lý các điều kiện chưa đạt ở trên để mở nút xác nhận.'}{' '}
          Xác nhận lịch không công bố kết quả tuyển dụng.
        </p>
      </div>
    </Card>
  );
}
