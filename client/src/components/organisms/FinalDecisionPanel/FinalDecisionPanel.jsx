import { useId } from 'react';
import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import {
  PUBLICATION_STATUS_LABELS,
  RECOMMENDATION_LABELS,
  RESULT_DECISION_LABELS,
  RESULT_DECISION_TONES,
  getLabel,
} from '../../../constants/labels.js';
import { formatDate, formatDateTime, formatTimeRange } from '../../../utils/format.js';

function decisionHint(row) {
  if (row.publishedAt) {
    return 'Kết quả đã công bố nên không thể thay đổi.';
  }
  if (row.assessmentStatus !== 'submitted') {
    return 'Cần có đánh giá phỏng vấn trước khi ghi nhận quyết định.';
  }
  return `Quyết định chỉ áp dụng cho ${row.applicationId}; hồ sơ khác của cùng ứng viên được quyết định riêng.`;
}

/**
 * Selected application in the Final Results tab: interview summary, the
 * interviewer's assessment (advisory), and the Executive's Pass/Fail. The
 * interviewer's recommendation is plain text inside the assessment box; only
 * the Executive's final decision uses the Pass/Fail badges.
 */
export default function FinalDecisionPanel({ row, assessment, assessmentOpen, onToggleAssessment, onRecord, pending, message }) {
  const assessmentId = useId();
  const canDecide = row.assessmentStatus === 'submitted' && !row.publishedAt;

  return (
    <Card
      as="article"
      kicker="Hồ sơ đang chọn"
      title={`${row.applicationId} · ${row.applicantName}`}
      subtitle={`${row.positionName} · ${formatDate(row.start)} · ${formatTimeRange(row.start, row.end)} · ${row.roomName} · Người phỏng vấn: ${row.interviewerName}`}
    >
      <div className="stack">
        <div>
          <Button variant="secondary" aria-expanded={assessmentOpen} aria-controls={assessmentId} onClick={onToggleAssessment}>
            {assessmentOpen ? 'Ẩn đánh giá' : 'View Assessment'}
          </Button>
        </div>
        {assessmentOpen ? (
          <div id={assessmentId}>
            {row.assessmentStatus !== 'submitted' ? (
              <Alert tone="warning" title="Chưa có đánh giá">
                <p>Người phỏng vấn {row.interviewerName} chưa gửi đánh giá, nên chưa thể ghi nhận quyết định.</p>
              </Alert>
            ) : assessment.status === 'success' && assessment.data ? (
              <div className="panel-subtle stack stack--tight">
                <h3>Đánh giá của người phỏng vấn · chỉ để tham khảo</h3>
                <p>
                  <strong>Nhận xét:</strong> {assessment.data.notes}
                </p>
                <p>
                  <strong>Đề xuất của người phỏng vấn:</strong>{' '}
                  {getLabel(RECOMMENDATION_LABELS, assessment.data.recommendation, RECOMMENDATION_LABELS.none)}
                </p>
                <p className="hint">
                  Đề xuất không phải kết quả cuối. Ban tuyển dụng tự ghi nhận Pass hoặc Fail ở phần “Quyết định cuối” bên
                  dưới.
                </p>
                <p className="hint">
                  {assessment.data.interviewerName} · gửi {formatDateTime(assessment.data.submittedAt)}
                </p>
              </div>
            ) : (
              <p className="muted" role="status">
                {assessment.status === 'error' ? assessment.error?.message : 'Đang tải đánh giá…'}
              </p>
            )}
          </div>
        ) : null}

        <div className="stack stack--tight">
          <p className="section-kicker">Quyết định cuối của Ban tuyển dụng</p>
          <p>
            {row.decision ? (
              <>
                Quyết định hiện tại:{' '}
                <Badge tone={RESULT_DECISION_TONES[row.decision]}>{getLabel(RESULT_DECISION_LABELS, row.decision)}</Badge>{' '}
                <Badge tone={row.publishedAt ? 'success' : 'warning'}>
                  {row.publishedAt ? `${PUBLICATION_STATUS_LABELS.published} · chỉ đọc` : PUBLICATION_STATUS_LABELS.unpublished}
                </Badge>
              </>
            ) : (
              'Chưa ghi nhận quyết định.'
            )}
          </p>
          {message ? (
            <Alert tone={message.tone} title={message.title} live>
              {message.text ? <p>{message.text}</p> : null}
            </Alert>
          ) : null}
          <div className="button-row" role="group" aria-label={`Quyết định cho ${row.applicationId}`}>
            <Button variant="success" onClick={() => onRecord('pass')} disabled={!canDecide || pending}>
              Record Pass
            </Button>
            <Button variant="danger" onClick={() => onRecord('fail')} disabled={!canDecide || pending}>
              Record Fail
            </Button>
          </div>
          <p className="hint">{decisionHint(row)}</p>
        </div>
      </div>
    </Card>
  );
}
