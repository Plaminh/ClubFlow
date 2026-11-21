import Badge from '../../atoms/Badge/index.js';
import DataTable from '../DataTable/index.js';
import {
  SCREENING_STATUS_LABELS,
  SCREENING_STATUS_TONES,
  getLabel,
} from '../../../constants/labels.js';
import { formatDate, formatDateTime, formatTimeRange } from '../../../utils/format.js';

function interviewCell(application) {
  if (application.interview) {
    const { start, end, roomName } = application.interview;
    return (
      <>
        <Badge tone="success">Confirmed</Badge>
        <span className="data-table__sub">
          {formatDate(start)} · {formatTimeRange(start, end)} · Phòng {roomName}
        </span>
      </>
    );
  }
  return (
    <Badge>
      {application.screeningStatus === 'rejected' ? 'Không có phỏng vấn' : 'Chưa có lịch'}
    </Badge>
  );
}

function resultCell(application) {
  if (application.result) {
    const pass = application.result.decision === 'pass';
    return <Badge tone={pass ? 'success' : 'danger'}>{pass ? 'Final Pass' : 'Final Fail'}</Badge>;
  }
  if (application.screeningStatus === 'rejected') {
    return <span className="muted">Không áp dụng</span>;
  }
  return application.interview ? (
    <Badge tone="warning">Chưa công bố</Badge>
  ) : (
    <span className="muted">Chưa có</span>
  );
}

function noteFor(application) {
  if (application.result) {
    return `Kết quả đã được công bố cho hồ sơ ${application.id}.`;
  }
  if (application.screeningStatus === 'rejected') {
    return 'Hồ sơ không được chuyển sang vòng phỏng vấn.';
  }
  if (application.interview) {
    return 'Lịch phỏng vấn đã được xác nhận. Kết quả cuối chỉ hiển thị sau khi Ban tuyển dụng công bố.';
  }
  if (application.screeningStatus === 'shortlisted') {
    return '“Qua vòng CV” chỉ nghĩa là đủ điều kiện xếp lịch phỏng vấn, chưa phải kết quả cuối. Lịch sẽ hiển thị sau khi được xác nhận.';
  }
  return 'Hồ sơ đang chờ Ban tuyển dụng duyệt.';
}

/** The applicant's own applications, each tracked independently (BR-05, BR-08). */
export default function MyApplicationsTable({ applications }) {
  const columns = [
    { key: 'id', header: 'Hồ sơ', render: (application) => <strong>{application.id}</strong> },
    { key: 'position', header: 'Vị trí', render: (application) => application.positionName },
    {
      key: 'submitted',
      header: 'Ngày nộp',
      render: (application) => formatDateTime(application.submittedAt),
    },
    {
      key: 'screening',
      header: 'Sàng lọc CV',
      render: (application) => (
        <Badge tone={SCREENING_STATUS_TONES[application.screeningStatus]}>
          {getLabel(SCREENING_STATUS_LABELS, application.screeningStatus)}
        </Badge>
      ),
    },
    { key: 'interview', header: 'Phỏng vấn', render: interviewCell },
    { key: 'result', header: 'Kết quả cuối', render: resultCell },
    {
      key: 'note',
      header: 'Ghi chú',
      render: (application) => <span className="data-table__sub">{noteFor(application)}</span>,
    },
  ];

  return (
    <DataTable
      caption="Hồ sơ của tôi"
      columns={columns}
      rows={applications}
      getRowKey={(application) => application.id}
    />
  );
}
