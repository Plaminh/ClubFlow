import { useState } from 'react';
import Badge from '../components/atoms/Badge/index.js';
import Button from '../components/atoms/Button/index.js';
import Alert from '../components/molecules/Alert/index.js';
import AsyncContent from '../components/molecules/AsyncContent/index.js';
import Card from '../components/molecules/Card/index.js';
import EmptyState from '../components/molecules/EmptyState/index.js';
import StatCard from '../components/molecules/StatCard/index.js';
import ConfirmationChecklist from '../components/organisms/ConfirmationChecklist/index.js';
import ConfirmDialog from '../components/organisms/ConfirmDialog/index.js';
import InterviewerAssignmentsCard from '../components/organisms/InterviewerAssignmentsCard/index.js';
import ScheduleRowDialog from '../components/organisms/ScheduleRowDialog/index.js';
import ScheduleSettingsCard from '../components/organisms/ScheduleSettingsCard/index.js';
import ScheduleTable from '../components/organisms/ScheduleTable/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { SCREEN_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useAction from '../hooks/useAction.js';
import useSchedule from '../hooks/useSchedule.js';
import { ROUTES } from '../routes/paths.js';
import { downloadText } from '../utils/csv.js';
import { formatDate, formatDateTime } from '../utils/format.js';

const HEADING = {
  eyebrow: 'Bước 3 / 3 · CLB Công nghệ & Sáng tạo',
  title: SCREEN_LABELS.interviewScheduling,
  actions: (
    <Button variant="secondary" to={ROUTES.EXECUTIVE_REVIEW}>
      ← Về hồ sơ
    </Button>
  ),
  step: 3,
};

function SchedulingWorkspace({ initial, campaign, actions }) {
  const [schedule, setSchedule] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [rowError, setRowError] = useState(null);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const action = useAction();

  const confirmed = schedule.status === 'confirmed';
  const hasDraft = schedule.status === 'draft';
  const { summary } = schedule;
  const conflictRows = schedule.rows.filter((row) => row.status === 'conflict');

  async function run(fn, success) {
    const result = await action.run(fn);
    if (result.ok) {
      setSchedule(result.value);
      if (success) {
        setMessage({ tone: 'success', ...success });
      }
    } else if (result.error) {
      setMessage({ tone: 'error', title: 'Chưa thực hiện được', text: result.error.message });
    }
    return result;
  }

  function generate() {
    setRegenerateOpen(false);
    run(() => actions.generateDraft(), {
      title: 'Đã tạo lịch nháp',
      text: 'Lịch nháp mẫu đã được tạo cho các hồ sơ qua vòng CV. Kiểm tra các bản ghi Conflict và Unassigned.',
    });
  }

  async function submitRow(values) {
    setRowError(null);
    const result = await action.run(() => actions.updateRow(editing.applicationId, values));
    if (result.ok) {
      setSchedule(result.value);
      const updated = result.value.rows.find((row) => row.applicationId === editing.applicationId);
      setMessage({
        tone: updated?.status === 'proposed' ? 'success' : 'warning',
        title: `Đã cập nhật ${editing.applicationId}: ${updated?.status === 'proposed' ? 'Proposed' : 'vẫn còn vấn đề'}`,
        text: updated?.reasons.join(' '),
      });
      setEditing(null);
    } else {
      setRowError(result.error);
    }
  }

  async function exportTimetable() {
    const result = await action.run(() => actions.exportTimetable());
    if (result.ok) {
      downloadText(result.value.fileName, result.value.content);
      setMessage({ tone: 'success', title: `Đã xuất lịch ${result.value.rowCount} buổi phỏng vấn` });
    }
  }

  async function confirmSchedule() {
    setConfirmOpen(false);
    await run(() => actions.confirm(), {
      title: 'Đã xác nhận lịch phỏng vấn',
      text: 'Ứng viên và người phỏng vấn được phân công giờ đã thấy lịch của mình. Kết quả tuyển dụng chưa được công bố.',
    });
  }

  const interviewersFor = (positionId) =>
    schedule.assignments
      .filter((assignment) => assignment.positionIds.includes(positionId))
      .map((assignment) => ({ id: assignment.interviewerId, name: assignment.interviewerName }));

  const description = confirmed
    ? `Lịch đã xác nhận cho ${summary.shortlisted} hồ sơ qua vòng CV · ngày phỏng vấn ${formatDate(campaign.interviewDate)}.`
    : `Lịch nháp cho ${summary.shortlisted} hồ sơ qua vòng CV · ngày phỏng vấn ${formatDate(campaign.interviewDate)}.`;

  if (schedule.zeroShortlisted) {
    return (
      <MainTemplate {...HEADING} description={description} context={campaign.name}>
        <EmptyState
          title="Không có hồ sơ qua vòng CV"
          actions={<Button to={ROUTES.EXECUTIVE_REVIEW}>Mở Application Review</Button>}
        >
          <p>
            Khi không có hồ sơ nào qua vòng CV, bước xác nhận lịch phỏng vấn được bỏ qua (BR-13). Lịch chỉ được lập cho hồ
            sơ “Qua vòng CV”.
          </p>
        </EmptyState>
      </MainTemplate>
    );
  }

  return (
    <MainTemplate {...HEADING} description={description} context={campaign.name}>
      <div className="stack stack--roomy">
        {message ? (
          <Alert tone={message.tone} title={message.title} live>
            {message.text ? <p>{message.text}</p> : null}
          </Alert>
        ) : null}

        <ScheduleSettingsCard
          settings={schedule.settings}
          rooms={schedule.rooms}
          hasDraft={schedule.status !== 'none'}
          disabled={action.pending}
          readOnly={confirmed}
          roomsReadOnly
          onGenerate={() => (hasDraft ? setRegenerateOpen(true) : generate())}
        />

        <section aria-label="Tổng quan trạng thái lịch">
          <div className="stats-grid">
            <StatCard value={summary.shortlisted} label="Hồ sơ đủ điều kiện" />
            {confirmed ? (
              <StatCard value={summary.confirmed} label="Confirmed" />
            ) : (
              <>
                <StatCard value={summary.proposed} label="Proposed" />
                <StatCard value={summary.conflict} label="Conflict" />
                <StatCard value={summary.unassigned} label="Unassigned" />
              </>
            )}
          </div>
        </section>

        <InterviewerAssignmentsCard assignments={schedule.assignments} />

        <Card
          title={confirmed ? 'Lịch Confirmed' : 'Lịch nháp'}
          subtitle={`Trạng thái tính theo đúng ${summary.shortlisted} hồ sơ đã qua vòng CV.`}
          actions={
            <>
              {confirmed ? <Badge tone="success">Confirmed · chỉ đọc</Badge> : null}
              {!confirmed && schedule.hasUnsavedChanges ? <Badge tone="warning">Có thay đổi chưa lưu</Badge> : null}
              {!confirmed ? (
                <Button
                  variant="secondary"
                  disabled={action.pending || !schedule.hasUnsavedChanges}
                  onClick={() => run(() => actions.saveDraft(), { title: 'Đã lưu lịch nháp' })}
                >
                  Lưu thay đổi
                </Button>
              ) : null}
              <Button variant="secondary" onClick={exportTimetable} disabled={action.pending}>
                Xuất lịch
              </Button>
            </>
          }
        >
          <div className="stack">
            {confirmed ? (
              <Alert tone="success" title={`Lịch đã được xác nhận ${formatDateTime(schedule.confirmedAt)}`}>
                <p>
                  Cấu hình chiến dịch, quyết định vòng CV và lịch được khóa (BR-14). Phần đánh giá và kết quả cuối vẫn
                  thực hiện ở giai đoạn sau.
                </p>
              </Alert>
            ) : null}
            {conflictRows.length > 0 ? (
              <Alert tone="error" title={`${conflictRows.length} bản ghi Conflict cần xử lý`}>
                <ul>
                  {conflictRows.map((row) => (
                    <li key={row.applicationId}>
                      {row.applicationId} · {row.applicantName}: {row.reasons.join(' ')}
                    </li>
                  ))}
                </ul>
              </Alert>
            ) : null}
            <ScheduleTable
              caption={confirmed ? 'Lịch phỏng vấn đã xác nhận' : 'Bảng lịch nháp'}
              rows={schedule.rows}
              readOnly={confirmed}
              onEdit={(row) => {
                setRowError(null);
                setEditing(row);
              }}
            />
          </div>
        </Card>

        {!confirmed ? (
          <ConfirmationChecklist
            conditions={schedule.conditions}
            canConfirm={schedule.canConfirm}
            pending={action.pending}
            onConfirm={() => setConfirmOpen(true)}
          />
        ) : null}
      </div>

      {editing ? (
        <ScheduleRowDialog
          row={editing}
          sessionStarts={schedule.sessionStarts}
          slotMinutes={schedule.settings.slotMinutes}
          interviewers={interviewersFor(editing.positionId)}
          rooms={schedule.rooms.filter((room) => schedule.settings.roomIds.includes(room.id))}
          busy={action.pending}
          error={rowError}
          onSubmit={submitRow}
          onClose={() => setEditing(null)}
        />
      ) : null}
      <ConfirmDialog
        open={regenerateOpen}
        title="Tạo lại lịch nháp?"
        confirmLabel="Thay thế lịch nháp"
        tone="danger"
        busy={action.pending}
        onConfirm={generate}
        onCancel={() => setRegenerateOpen(false)}
      >
        <p>Lịch nháp hiện tại, kể cả các chỉnh sửa thủ công, sẽ bị thay thế.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận lịch phỏng vấn?"
        confirmLabel="Duyệt & xác nhận lịch"
        busy={action.pending}
        onConfirm={confirmSchedule}
        onCancel={() => setConfirmOpen(false)}
      >
        <p>
          Sau khi xác nhận, lịch chỉ đọc và không thể tạo lại. Ứng viên và người phỏng vấn thấy buổi của mình. Xác nhận
          lịch không công bố kết quả tuyển dụng.
        </p>
      </ConfirmDialog>
    </MainTemplate>
  );
}

export default function InterviewSchedulingPage() {
  const { dataVersion } = useDemoSession();
  const { data, status, error, reload, ...actions } = useSchedule();

  if (status !== 'success') {
    return (
      <MainTemplate {...HEADING}>
        <AsyncContent status={status} error={error} onRetry={reload} />
      </MainTemplate>
    );
  }

  return <SchedulingWorkspace key={dataVersion} initial={data.schedule} campaign={data.campaign} actions={actions} />;
}
