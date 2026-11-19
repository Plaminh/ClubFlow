import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import DataTable from '../DataTable/index.js';
import { SCHEDULE_STATUS_LABELS, SCHEDULE_STATUS_TONES, getLabel } from '../../../constants/labels.js';
import { formatTimeRange } from '../../../utils/format.js';

/**
 * Draft or confirmed interview schedule (reference "Lịch nháp" / "Lịch Confirmed").
 * In draft mode each row has an Edit / Assign Slot action.
 */
export default function ScheduleTable({ rows, readOnly, onEdit, caption }) {
  const columns = [
    {
      key: 'application',
      header: 'Hồ sơ / Ứng viên',
      render: (row) => (
        <>
          <strong>{row.applicationId}</strong>
          <span className="data-table__sub">{row.applicantName}</span>
        </>
      ),
    },
    { key: 'position', header: 'Vị trí', render: (row) => row.positionName },
    { key: 'availability', header: 'Giờ rảnh ứng viên', render: (row) => row.availabilityText || '—' },
    {
      key: 'time',
      header: 'Giờ phỏng vấn',
      render: (row) => (row.start ? formatTimeRange(row.start, row.end) : 'Chưa xếp'),
    },
    { key: 'interviewer', header: 'Người phỏng vấn', render: (row) => row.interviewerName ?? 'Chưa xếp' },
    { key: 'room', header: 'Phòng', render: (row) => row.roomName ?? 'Chưa xếp' },
    {
      key: 'status',
      header: 'Trạng thái và lý do',
      render: (row) => (
        <>
          <Badge tone={SCHEDULE_STATUS_TONES[row.status]}>{getLabel(SCHEDULE_STATUS_LABELS, row.status)}</Badge>
          {row.status !== 'confirmed' ? <span className="data-table__sub">{row.reasons.join(' ')}</span> : null}
        </>
      ),
    },
  ];

  if (!readOnly) {
    columns.push({
      key: 'action',
      header: 'Thao tác',
      render: (row) => (
        <Button
          variant="secondary"
          onClick={() => onEdit(row)}
          aria-label={`${row.status === 'unassigned' ? 'Assign Slot' : row.status === 'conflict' ? 'Resolve' : 'Edit'} ${row.applicationId}`}
        >
          {row.status === 'unassigned' ? '+ Assign Slot' : row.status === 'conflict' ? 'Resolve' : 'Edit'}
        </Button>
      ),
    });
  }

  return (
    <DataTable
      caption={caption}
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.applicationId}
      emptyText="Chưa có hồ sơ nào qua vòng CV."
    />
  );
}
