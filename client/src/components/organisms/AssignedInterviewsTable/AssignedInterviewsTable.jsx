import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import DataTable from '../DataTable/index.js';
import { formatDate, formatTimeRange } from '../../../utils/format.js';

function assessmentBadge(interview) {
  if (interview.assessmentStatus === 'submitted') {
    return <Badge tone="success">Đã đánh giá</Badge>;
  }
  return interview.timing === 'completed' ? (
    <Badge tone="warning">Chờ đánh giá</Badge>
  ) : (
    <Badge tone="warning">Chưa diễn ra</Badge>
  );
}

/** Only this interviewer's confirmed interviews (reference "Assigned Interviews"). */
export default function AssignedInterviewsTable({ interviews, selectedId, onSelect }) {
  const columns = [
    { key: 'id', header: 'Hồ sơ', render: (row) => <strong>{row.applicationId}</strong> },
    { key: 'applicant', header: 'Ứng viên', render: (row) => row.applicantName },
    { key: 'position', header: 'Vị trí', render: (row) => row.positionName },
    { key: 'date', header: 'Ngày', render: (row) => formatDate(row.start) },
    { key: 'time', header: 'Khung giờ', render: (row) => formatTimeRange(row.start, row.end) },
    { key: 'room', header: 'Phòng', render: (row) => row.roomName },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <>
          <Badge tone="success">Confirmed</Badge>
          {assessmentBadge(row)}
        </>
      ),
    },
    {
      key: 'action',
      header: 'Thao tác',
      render: (row) => (
        <Button
          variant="secondary"
          onClick={() => onSelect(row.interviewId)}
          disabled={row.interviewId === selectedId}
          aria-label={
            row.interviewId === selectedId
              ? `Đang xem ${row.applicationId}`
              : `Chọn ${row.applicationId} · ${row.applicantName}`
          }
        >
          {row.interviewId === selectedId ? 'Đang xem' : 'Chọn'}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      caption="Các buổi phỏng vấn được phân công"
      columns={columns}
      rows={interviews}
      getRowKey={(row) => row.interviewId}
      selectedKey={selectedId}
    />
  );
}
