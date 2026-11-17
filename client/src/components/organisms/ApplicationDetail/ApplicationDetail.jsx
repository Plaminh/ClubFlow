import { useEffect, useRef, useState } from 'react';
import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { getLabel, SCREENING_STATUS_LABELS, SCREENING_STATUS_TONES } from '../../../constants/labels.js';
import { formatDateTime } from '../../../utils/format.js';
import './ApplicationDetail.css';

function decisionHint(detail) {
  const others = detail.siblingIds.length > 0 ? `; hồ sơ ${detail.siblingIds.join(', ')} được duyệt độc lập` : '';
  const scope = `Áp dụng riêng cho ${detail.id}${others}.`;
  if (detail.locked) {
    return `${scope} Lịch phỏng vấn đã được xác nhận nên quyết định vòng CV đã khóa (BR-14).`;
  }
  if (detail.screeningStatus !== 'pendingReview') {
    return `${scope} Quyết định "${getLabel(SCREENING_STATUS_LABELS, detail.screeningStatus)}" đã được lưu và không thể thay đổi.`;
  }
  return `${scope} Quyết định sẽ không thể thay đổi sau khi lưu.`;
}

/** Selected application beside the list (reference detail card). */
export default function ApplicationDetail({ detail, pending, message, focusOnMount, onSaveNote, onShortlist, onReject, onClose }) {
  const [note, setNote] = useState(detail.privateNote ?? '');
  const panelRef = useRef(null);
  const canDecide = !detail.locked && detail.screeningStatus === 'pendingReview';

  useEffect(() => {
    if (focusOnMount) {
      panelRef.current?.querySelector('.application-detail__title')?.focus();
    }
  }, [focusOnMount]);

  return (
    <div ref={panelRef} className="application-detail">
      <Card
        as="article"
        kicker="Hồ sơ đang chọn"
        title={
          <span tabIndex={-1} className="application-detail__title">
            {detail.id} · {detail.applicantName}
          </span>
        }
        actions={
          <Button variant="secondary" onClick={onClose}>
            × Đóng chi tiết
          </Button>
        }
      >
        <div className="stack">
          <p>
            <Badge tone={SCREENING_STATUS_TONES[detail.screeningStatus]}>
              {getLabel(SCREENING_STATUS_LABELS, detail.screeningStatus)}
            </Badge>
          </p>
          <dl className="summary-list summary-list--columns">
            <div>
              <dt>Vị trí</dt>
              <dd>{detail.positionName}</dd>
            </div>
            <div>
              <dt>Thời gian nộp</dt>
              <dd>{formatDateTime(detail.submittedAt)}</dd>
            </div>
            <div>
              <dt>Khung giờ có thể tham gia</dt>
              <dd>{detail.availabilityText || '—'}</dd>
            </div>
            <div>
              <dt>Thời gian duyệt</dt>
              <dd>{formatDateTime(detail.reviewedAt, 'Chưa duyệt')}</dd>
            </div>
            <div>
              <dt>Mã số sinh viên · Email</dt>
              <dd>
                {detail.student.studentId} · {detail.student.email}
              </dd>
            </div>
            <div>
              <dt>Khoa · Năm</dt>
              <dd>
                {detail.student.faculty} · {detail.student.year}
              </dd>
            </div>
          </dl>
          <div>
            <Button variant="secondary" href={detail.cv.url} target="_blank" rel="noreferrer">
              Mở CV mẫu hư cấu (PDF)
            </Button>
            <p className="hint">
              {detail.cv.fileName} · {Math.round(detail.cv.sizeBytes / 1024)} KB · Dữ liệu tổng hợp, không thuộc người
              thật.
            </p>
          </div>
          <section aria-labelledby={`sop-${detail.id}`}>
            <h3 id={`sop-${detail.id}`}>Bài trình bày nguyện vọng · bản đầy đủ</h3>
            {detail.sop.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </section>
          <div className="panel-subtle stack stack--tight">
            <FormField id={`note-${detail.id}`} label="Ghi chú nội bộ · chỉ Ban tuyển dụng nhìn thấy">
              {(props) => <textarea {...props} rows={5} value={note} onChange={(event) => setNote(event.target.value)} />}
            </FormField>
            <div>
              <Button variant="secondary" onClick={() => onSaveNote(note)} disabled={pending}>
                Lưu ghi chú
              </Button>
            </div>
          </div>
          {message ? (
            <Alert tone={message.tone} title={message.title} live>
              {message.text ? <p>{message.text}</p> : null}
            </Alert>
          ) : null}
          <div className="button-row" role="group" aria-label="Quyết định hồ sơ">
            <Button variant="danger" onClick={onReject} disabled={!canDecide || pending}>
              Loại hồ sơ
            </Button>
            <Button onClick={onShortlist} disabled={!canDecide || pending}>
              Shortlist Candidate
            </Button>
          </div>
          <p className="hint">{decisionHint(detail)}</p>
        </div>
      </Card>
    </div>
  );
}
