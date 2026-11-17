import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Card from '../../molecules/Card/index.js';
import { formatDate, formatTimeRange } from '../../../utils/format.js';

/**
 * Read-only application details for the assigned interviewer. Executive-only
 * screening notes are never part of this data.
 */
export default function InterviewDetailCard({ interview }) {
  return (
    <Card
      as="article"
      kicker="Hồ sơ đang chọn"
      title={`${interview.applicationId} · ${interview.applicantName}`}
      actions={<Badge>Chỉ đọc</Badge>}
    >
      <div className="stack">
        <dl className="summary-list summary-list--columns">
          <div>
            <dt>Vị trí</dt>
            <dd>{interview.positionName}</dd>
          </div>
          <div>
            <dt>Khoa · Năm</dt>
            <dd>
              {interview.faculty} · {interview.year}
            </dd>
          </div>
          <div>
            <dt>Buổi phỏng vấn</dt>
            <dd>
              {formatDate(interview.start)} · {formatTimeRange(interview.start, interview.end)} · Phòng{' '}
              {interview.roomName}
            </dd>
          </div>
        </dl>
        <div>
          <h3>Bài trình bày nguyện vọng</h3>
          <p>{interview.sop}</p>
        </div>
        <div>
          <p className="section-kicker">CV</p>
          <Button variant="secondary" href={interview.cv.url} target="_blank" rel="noreferrer">
            Mở CV mẫu hư cấu (PDF)
          </Button>
          <p className="hint">
            {interview.cv.fileName} · mẫu hư cấu dùng chung cho bản demo. Bản triển khai chỉ cấp quyền xem CV cho người
            phỏng vấn được phân công.
          </p>
        </div>
      </div>
    </Card>
  );
}
