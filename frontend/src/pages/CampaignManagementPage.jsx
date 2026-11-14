import { useEffect, useRef, useState } from 'react';
import Badge from '../components/atoms/Badge/index.js';
import Button from '../components/atoms/Button/index.js';
import Alert from '../components/molecules/Alert/index.js';
import AsyncContent from '../components/molecules/AsyncContent/index.js';
import Card from '../components/molecules/Card/index.js';
import Timeline from '../components/molecules/Timeline/index.js';
import CampaignDetailsCard from '../components/organisms/CampaignDetailsCard/index.js';
import CampaignPreview from '../components/organisms/CampaignPreview/index.js';
import ConfirmDialog from '../components/organisms/ConfirmDialog/index.js';
import InterviewSetupCard from '../components/organisms/InterviewSetupCard/index.js';
import Modal from '../components/organisms/Modal/index.js';
import PositionsEditor from '../components/organisms/PositionsEditor/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { SCREEN_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useAction from '../hooks/useAction.js';
import useCampaign from '../hooks/useCampaign.js';
import { ROUTES } from '../routes/paths.js';
import { formatDate } from '../utils/format.js';
import { validateCampaignForPublish } from '../utils/validation.js';

const HEADING = {
  eyebrow: 'Bước 1 / 3 · Thiết lập chiến dịch',
  title: SCREEN_LABELS.campaignManagement,
  description: 'Chuẩn bị thông tin tuyển thành viên và cấu hình phỏng vấn cho cùng một chiến dịch.',
};

function toForm(view) {
  const { campaign } = view;
  return {
    name: campaign.name,
    hostClub: campaign.hostClub,
    description: campaign.description,
    instructions: campaign.instructions,
    opensOn: campaign.opensOn,
    closesOn: campaign.closesOn,
    interviewDate: campaign.interviewDate,
    interviewWindow: campaign.interviewWindow,
    slotMinutes: campaign.slotMinutes,
    positions: view.positions.map((position) => ({
      key: position.id,
      id: position.id,
      departmentName: position.departmentName,
      name: position.name,
      quota: String(position.quota ?? ''),
      description: position.description,
      requirements: position.requirements,
      applicationCount: position.applicationCount,
    })),
  };
}

function CampaignWorkspace({ view, actions }) {
  const [form, setForm] = useState(() => toForm(view));
  const [current, setCurrent] = useState(view);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [listError, setListError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [focusErrors, setFocusErrors] = useState(0);
  const containerRef = useRef(null);
  const newPositionCounter = useRef(0);
  const action = useAction();

  const { campaign, locked, hasApplications } = current;
  const published = campaign.status === 'published';
  const disabled = locked || action.pending;

  // Move focus to the first invalid field after a failed save or publish.
  useEffect(() => {
    if (focusErrors > 0) {
      containerRef.current?.querySelector('[aria-invalid="true"]')?.focus();
    }
  }, [focusErrors]);

  function applyView(next) {
    setCurrent(next);
    setForm(toForm(next));
  }

  function change(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function changePosition(key, field, value) {
    setForm((previous) => ({
      ...previous,
      positions: previous.positions.map((position) => (position.key === key ? { ...position, [field]: value } : position)),
    }));
  }

  function addPosition() {
    newPositionCounter.current += 1;
    setForm((previous) => ({
      ...previous,
      positions: [
        ...previous.positions,
        {
          key: `new-${newPositionCounter.current}`,
          departmentName: '',
          name: '',
          quota: '',
          description: '',
          requirements: '',
          applicationCount: 0,
        },
      ],
    }));
  }

  function showValidation(fieldErrors, message) {
    setErrors(fieldErrors);
    setListError(fieldErrors.positions ?? '');
    setBanner({ tone: 'error', title: message ?? 'Chưa thể công bố chiến dịch', text: 'Hãy sửa các trường được đánh dấu. Dữ liệu hợp lệ bạn đã nhập vẫn được giữ lại.' });
    setFocusErrors((count) => count + 1);
  }

  function handleFailure(error) {
    if (error?.fieldErrors) {
      showValidation(error.fieldErrors, error.message);
    } else if (error) {
      setBanner({ tone: 'error', title: 'Chưa thể lưu', text: error.message });
    }
  }

  async function saveDraft() {
    setBanner(null);
    const result = await action.run(() => actions.saveDraft(form));
    if (result.ok) {
      applyView(result.value);
      setErrors({});
      setBanner({ tone: 'success', title: 'Đã lưu bản nháp (mô phỏng)', text: 'Bản nháp chỉ hiển thị với Ban tuyển dụng.' });
    } else {
      handleFailure(result.error);
    }
  }

  function requestPublish() {
    setBanner(null);
    const fieldErrors = validateCampaignForPublish(form);
    if (Object.keys(fieldErrors).length > 0) {
      showValidation(fieldErrors, published ? 'Chưa thể lưu thay đổi' : 'Chưa thể công bố chiến dịch');
      return;
    }
    setErrors({});
    setListError('');
    if (published) {
      submitPublish();
    } else {
      setPublishOpen(true);
    }
  }

  async function submitPublish() {
    const wasPublished = published;
    const result = await action.run(() => actions.publish(form));
    setPublishOpen(false);
    if (result.ok) {
      applyView(result.value);
      setBanner(
        wasPublished
          ? { tone: 'success', title: 'Đã lưu thay đổi (mô phỏng)', text: 'Chiến dịch vẫn đang được công bố.' }
          : { tone: 'success', title: 'Đã công bố chiến dịch (mô phỏng)', text: 'Chiến dịch hiển thị công khai trên Applicant Portal.' },
      );
    } else {
      handleFailure(result.error);
    }
  }

  function requestRemove(position) {
    setListError('');
    if (!position.id) {
      setForm((previous) => ({ ...previous, positions: previous.positions.filter((item) => item.key !== position.key) }));
      return;
    }
    setRemoving(position);
  }

  async function confirmRemove() {
    const position = removing;
    const result = await action.run(() => actions.removePosition(position.id));
    setRemoving(null);
    if (result.ok) {
      setCurrent(result.value);
      setForm((previous) => ({ ...previous, positions: previous.positions.filter((item) => item.key !== position.key) }));
    } else if (result.error) {
      setListError(result.error.message);
    }
  }

  const headerActions = (
    <>
      {!published ? (
        <Button variant="secondary" onClick={saveDraft} disabled={disabled}>
          Lưu bản nháp
        </Button>
      ) : null}
      <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
        Xem trước
      </Button>
      <Button onClick={requestPublish} disabled={disabled}>
        {published ? 'Lưu thay đổi' : 'Công bố chiến dịch'}
      </Button>
    </>
  );

  const statusBadge = locked
    ? { label: 'Chỉ đọc', tone: 'neutral' }
    : published
      ? { label: 'Đã công bố', tone: 'success' }
      : { label: 'Bản nháp', tone: 'warning' };

  return (
    <MainTemplate {...HEADING} actions={headerActions} context={form.name} step={1}>
      <div className="stack stack--roomy" ref={containerRef}>
        {banner ? (
          <Alert tone={banner.tone} title={banner.title} live>
            <p>{banner.text}</p>
          </Alert>
        ) : null}
        {locked ? (
          <Alert tone="info" title="Cấu hình chiến dịch đang ở chế độ chỉ đọc">
            <p>Lịch phỏng vấn đã được xác nhận nên cấu hình chiến dịch được khóa (BR-14). Bạn vẫn có thể xem trước.</p>
          </Alert>
        ) : null}
        {published && !locked ? (
          <Alert tone="success" title="Chiến dịch đã được công bố">
            <p>
              Ứng viên có thể nộp hồ sơ từ {formatDate(campaign.opensOn)} đến hết {formatDate(campaign.closesOn)}. Công
              bố không tự khóa cấu hình; trạng thái chỉ đọc chỉ áp dụng sau khi lịch phỏng vấn được xác nhận.
            </p>
            <Button to={ROUTES.EXECUTIVE_REVIEW}>Mở Application Review →</Button>
          </Alert>
        ) : null}

        <Timeline
          items={[
            { date: formatDate(form.opensOn), label: 'Mở đơn ứng tuyển' },
            { date: formatDate(form.closesOn), label: 'Đóng đơn ứng tuyển' },
            {
              date: formatDate(form.interviewDate),
              label: `Phỏng vấn · ${form.interviewWindow.start}–${form.interviewWindow.end}`,
            },
          ]}
        />

        <div className="sidebar-layout">
          <div className="stack stack--roomy">
            <CampaignDetailsCard
              values={form}
              errors={errors}
              statusLabel={statusBadge.label}
              statusTone={statusBadge.tone}
              disabled={disabled}
              onChange={change}
            />
            <PositionsEditor
              positions={form.positions}
              errors={errors}
              listError={listError}
              disabled={disabled}
              onAdd={addPosition}
              onChange={changePosition}
              onRemove={requestRemove}
            />
          </div>
          <aside className="stack stack--roomy" aria-label="Chuẩn bị và xem trước chiến dịch">
            <InterviewSetupCard
              values={form}
              errors={errors}
              disabled={disabled || hasApplications}
              lockedHint={
                hasApplications && !locked
                  ? 'Đã có hồ sơ chọn khung giờ nên không đổi ngày, khung giờ và thời lượng tại đây (giả định giao diện, chờ trả lời Q-03).'
                  : null
              }
              onChange={change}
            />
            <Card title="Xem trước chiến dịch" actions={<Badge>Chỉ đọc</Badge>}>
              <dl className="summary-list">
                <div>
                  <dt>Thời gian nhận đơn</dt>
                  <dd>
                    {formatDate(form.opensOn)}–{formatDate(form.closesOn)}
                  </dd>
                </div>
                <div>
                  <dt>Vị trí</dt>
                  <dd>{form.positions.map((position) => position.name || 'Chưa đặt tên').join(' · ') || '—'}</dd>
                </div>
                <div>
                  <dt>Phỏng vấn</dt>
                  <dd>
                    {formatDate(form.interviewDate)} · {form.interviewWindow.start}–{form.interviewWindow.end} ·{' '}
                    {form.slotMinutes} phút/ca
                  </dd>
                </div>
              </dl>
              <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
                Xem toàn bộ bản xem trước
              </Button>
            </Card>
          </aside>
        </div>
      </div>

      <Modal open={previewOpen} title="Xem trước chiến dịch" size="large" onClose={() => setPreviewOpen(false)}>
        <CampaignPreview campaign={form} positions={form.positions} />
      </Modal>
      <ConfirmDialog
        open={publishOpen}
        title="Công bố chiến dịch?"
        confirmLabel="Công bố chiến dịch"
        busy={action.pending}
        onConfirm={submitPublish}
        onCancel={() => setPublishOpen(false)}
      >
        <p>
          Chiến dịch sẽ hiển thị công khai. Ứng viên chỉ nộp được hồ sơ từ {formatDate(form.opensOn)} đến hết{' '}
          {formatDate(form.closesOn)}.
        </p>
      </ConfirmDialog>
      <ConfirmDialog
        open={Boolean(removing)}
        title="Xóa vị trí?"
        confirmLabel="Xóa vị trí"
        tone="danger"
        busy={action.pending}
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      >
        <p>Vị trí {removing?.name || 'này'} sẽ bị xóa khỏi chiến dịch.</p>
      </ConfirmDialog>
    </MainTemplate>
  );
}

export default function CampaignManagementPage() {
  const { dataVersion } = useDemoSession();
  const { data, status, error, reload, ...actions } = useCampaign();

  if (status !== 'success') {
    return (
      <MainTemplate {...HEADING} step={1}>
        <AsyncContent status={status} error={error} onRetry={reload} />
      </MainTemplate>
    );
  }

  return <CampaignWorkspace key={dataVersion} view={data} actions={actions} />;
}
