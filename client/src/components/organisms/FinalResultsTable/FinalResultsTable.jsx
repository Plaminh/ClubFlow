import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import DataTable from '../DataTable/index.js';
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_STATUS_TONES,
  PUBLICATION_STATUS_LABELS,
  RESULT_DECISION_LABELS,
  RESULT_DECISION_TONES,
  SCHEDULE_STATUS_LABELS,
  getLabel,
} from '../../../constants/labels.js';
import { formatDate, formatTimeRange } from '../../../utils/format.js';

/** Final results per application (reference review-final-results-preview.html). */
export default function FinalResultsTable({ rows, selectedId, onSelect }) {
  const columns = [
    {
      key: 'application',
      header: 'Hồ sơ',
      render: (row) => (
        <>
          <strong>{row.applicationId}</strong>
          <span className="data-table__sub">{row.applicantName}</span>
        </>
      ),
    },
    { key: 'position', header: 'Vị trí', render: (row) => row.positionName },
    {
      key: 'interview',
      header: 'Phỏng vấn',
      render: (row) => (
        <>
          <Badge tone="success">{SCHEDULE_STATUS_LABELS.confirmed}</Badge>
          <span className="data-table__sub">
            {formatDate(row.start)} · {formatTimeRange(row.start, row.end)} · {row.roomName}
          </span>
        </>
      ),
    },
    {
      key: 'assessment',
      header: 'Đánh giá',
      render: (row) => (
        <Badge tone={ASSESSMENT_STATUS_TONES[row.assessmentStatus]}>
          {getLabel(ASSESSMENT_STATUS_LABELS, row.assessmentStatus)}
        </Badge>
      ),
    },
    { key: 'interviewer', header: 'Người phỏng vấn', render: (row) => row.interviewerName },
    {
      key: 'decision',
      header: 'Quyết định',
      render: (row) => (
        <Badge tone={RESULT_DECISION_TONES[row.decision ?? 'none']}>
          {getLabel(RESULT_DECISION_LABELS, row.decision, RESULT_DECISION_LABELS.none)}
        </Badge>
      ),
    },
    {
      key: 'publication',
      header: 'Công bố',
      render: (row) => {
        if (row.publishedAt) {
          return <Badge tone="success">{PUBLICATION_STATUS_LABELS.published}</Badge>;
        }
        return row.decision ? (
          <Badge tone="warning">{PUBLICATION_STATUS_LABELS.unpublished}</Badge>
        ) : (
          <Badge>—</Badge>
        );
      },
    },
    {
      key: 'action',
      header: 'Thao tác',
      render: (row) => (
        <Button
          variant="secondary"
          onClick={() => onSelect(row.applicationId)}
          disabled={row.applicationId === selectedId}
          aria-label={
            row.applicationId === selectedId
              ? `Đang xem ${row.applicationId}`
              : `Mở ${row.applicationId} · ${row.applicantName}`
          }
        >
          {row.applicationId === selectedId ? 'Đang xem' : 'Mở'}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      caption="Kết quả cuối theo hồ sơ"
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.applicationId}
      selectedKey={selectedId}
    />
  );
}
