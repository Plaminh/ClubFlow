import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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

const LOCK_MESSAGES = {
  scheduleConfirmed: {
    title: 'Cấu hình chiến dịch đang ở chế độ chỉ đọc',
    text: 'Chiến dịch đã được công bố và lịch phỏng vấn đã được xác nhận, nên cấu hình chiến dịch được khóa (BR-14). Bạn vẫn có thể xem trước.',
  },
};

function toForm(view) {
  const { campaign } = view;
  const existing = new Map(view.interviewSetup.assignments.map((assignment) => [assignment.interviewerId, assignment]));
  return {
    id: campaign.id,
    name: campaign.name,
    hostClub: campaign.hostClub,
    description: campaign.description,
    instructions: campaign.instructions,
    opensOn: campaign.opensOn,
    closesOn: campaign.closesOn,
    interviewDate: campaign.interviewDate,
    interviewWindow: campaign.interviewWindow,
    slotMinutes: campaign.slotMinutes,
    rooms: view.interviewSetup.rooms,
    roomIds: view.interviewSetup.roomIds,
    assignments: view.interviewSetup.interviewers.map((interviewer) => {
      const assignment = existing.get(interviewer.id);
      return assignment ?? {
        interviewerId: interviewer.id,
        interviewerName: interviewer.name,
        positionIds: [],
        positionNames: [],
        availability: [{
          start: `${campaign.interviewDate}T${campaign.interviewWindow.start}:00+07:00`,
          end: `${campaign.interviewDate}T${campaign.interviewWindow.end}:00+07:00`,
        }],
      };
    }),
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

/** An unsaved draft that reuses the club's interviewer and room catalog from an existing campaign. */
function blankView(catalog) {
  return {
    campaign: {
      id: null,
      name: '',
      hostClub: catalog.campaign.hostClub,
      description: '',
      instructions: '',
      opensOn: '',
      closesOn: '',
      interviewDate: '',
      interviewWindow: catalog.campaign.interviewWindow,
      slotMinutes: catalog.campaign.slotMinutes,
      status: 'draft',
    },
    phase: 'draft',
    positions: [],
    interviewSetup: { ...catalog.interviewSetup, assignments: [], roomIds: [], locked: false, lockReason: null },
    locked: false,
    lockReason: null,
  };
}

function CampaignWorkspace({ view, actions, onCreated, onCreateNew, created = false }) {
  const [form, setForm] = useState(() => toForm(view));
  const [current, setCurrent] = useState(view);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(() => (created
    ? { tone: 'success', title: 'Đã tạo bản nháp chiến dịch', text: 'Tiếp tục cấu hình Interview Setup, xem trước và công bố khi sẵn sàng.' }
    : null));
  const [listError, setListError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [focusErrors, setFocusErrors] = useState(0);
  const containerRef = useRef(null);
  const newPositionCounter = useRef(0);
  const action = useAction();

  const { campaign, locked, lockReason } = current;
  const disabled = action.pending;

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
    const mapped = Object.fromEntries(Object.entries(fieldErrors).map(([field, value]) => {
      const match = field.match(/^positions\.(\d+)\.(.+)$/u);
      if (!match) return [field, value];
      const position = form.positions[Number(match[1])];
      return [position ? `position:${position.key}:${match[2]}` : field, value];
    }));
    setErrors(mapped);
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
    if (result.ok && !form.id) {
      // The first save of a new campaign creates it; continue on its own id.
      onCreated(result.value.campaign.id);
      return;
    }
    if (result.ok) {
      applyView(result.value);
      setErrors({});
      setBanner({ tone: 'success', title: 'Đã lưu thay đổi', text: 'Dữ liệu chiến dịch đã được dịch vụ ClubFlow xác nhận.' });
    } else {
      handleFailure(result.error);
    }
  }

  function requestPublish() {
    setBanner(null);
    const fieldErrors = validateCampaignForPublish(form);
    if (Object.keys(fieldErrors).length > 0) {
      showValidation(fieldErrors, 'Chưa thể công bố chiến dịch');
      return;
    }
    setErrors({});
    setListError('');
    setPublishOpen(true);
  }

  async function submitPublish() {
    const result = await action.run(() => actions.publish(form));
    setPublishOpen(false);
    if (result.ok) {
      applyView(result.value);
      setBanner({
        tone: 'success',
        title: 'Đã công bố chiến dịch',
        text: 'Chiến dịch hiển thị công khai trên Applicant Portal. Chi tiết vẫn có thể chỉnh sửa theo giới hạn Q-03 cho đến khi lịch được xác nhận.',
      });
    } else {
      handleFailure(result.error);
    }
  }

  async function submitClose() {
    const result = await action.run(() => actions.closeApplications());
    setCloseOpen(false);
    if (result.ok) {
      setCurrent(result.value);
      setBanner({
        tone: 'success',
        title: 'Đã đóng nhận hồ sơ',
        text: 'Ứng viên không thể nộp thêm hồ sơ. Bạn có thể bắt đầu duyệt hồ sơ và xếp lịch phỏng vấn.',
      });
    } else if (result.error) {
      setBanner({ tone: 'error', title: 'Chưa đóng được nhận hồ sơ', text: result.error.message });
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

  const draft = campaign.status === 'draft';
  const headerActions = (
    <>
      {locked ? null : (
        <Button variant="secondary" onClick={saveDraft} disabled={disabled}>
          {draft ? 'Save as Draft' : 'Lưu thay đổi'}
        </Button>
      )}
      <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
        Preview Campaign
      </Button>
      {locked || !draft || !form.id ? null : (
        <Button onClick={requestPublish} disabled={disabled}>
          Publish Campaign
        </Button>
      )}
      {form.id && onCreateNew ? (
        <Button variant="secondary" onClick={onCreateNew} disabled={disabled}>
          Tạo chiến dịch mới
        </Button>
      ) : null}
      {!locked && current.phase === 'open' ? (
        <Button variant="secondary" onClick={() => setCloseOpen(true)} disabled={disabled}>
          Đóng nhận hồ sơ sớm
        </Button>
      ) : null}
    </>
  );

  const statusBadge = campaign.status === 'published' ? { label: 'Đã công bố', tone: 'success' } : { label: 'Bản nháp', tone: 'warning' };
  const lockMessage = LOCK_MESSAGES[lockReason];

  return (
    <MainTemplate {...HEADING} actions={headerActions} context={form.name} step={1}>
      <div className="stack stack--roomy" ref={containerRef}>
        {banner ? (
          <Alert tone={banner.tone} title={banner.title} live>
            <p>{banner.text}</p>
          </Alert>
        ) : null}
        {lockMessage ? (
          <Alert tone="info" title={lockMessage.title}>
            <p>{lockMessage.text}</p>
            <Button to={ROUTES.EXECUTIVE_REVIEW}>Mở Application Review →</Button>
          </Alert>
        ) : null}
        {!locked && campaign.status === 'published' ? (
          <Alert tone="info" title="Chiến dịch đã được công bố">
            <p>Chi tiết và vị trí vẫn chỉnh sửa được theo Q-03; vị trí đã có hồ sơ không thể xóa. Interview Setup khóa sau hồ sơ hợp lệ đầu tiên.</p>
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
              readOnly={locked}
              onChange={change}
            />
            <PositionsEditor
              positions={form.positions}
              errors={errors}
              listError={listError}
              disabled={disabled}
              readOnly={locked}
              onAdd={addPosition}
              onChange={changePosition}
              onRemove={requestRemove}
            />
          </div>
          <aside className="stack stack--roomy" aria-label="Chuẩn bị và xem trước chiến dịch">
            <InterviewSetupCard
              values={form}
              errors={errors}
              disabled={disabled}
              readOnly={locked || current.interviewSetup.locked}
              onChange={change}
            />
            <Card title="Xem trước chiến dịch" subtitle="Tóm tắt nội dung ứng viên sẽ thấy.">
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
          Chiến dịch sẽ hiển thị công khai. Ứng viên chỉ nộp được hồ sơ từ {formatDate(form.opensOn)} đến hết ngày{' '}
          {formatDate(form.closesOn)} (giờ Việt Nam).
        </p>
        <p>
          Sau khi công bố, chi tiết và vị trí chỉ được chỉnh sửa trong giới hạn Q-03; Interview Setup khóa sau hồ sơ hợp lệ đầu tiên và toàn bộ cấu hình khóa khi lịch được xác nhận.
        </p>
      </ConfirmDialog>
      <ConfirmDialog
        open={closeOpen}
        title="Đóng nhận hồ sơ sớm?"
        confirmLabel="Đóng nhận hồ sơ"
        tone="danger"
        busy={action.pending}
        onConfirm={submitClose}
        onCancel={() => setCloseOpen(false)}
      >
        <p>Ứng viên sẽ không thể nộp thêm hồ sơ cho chiến dịch này (Q-03). Các hồ sơ đã nộp được giữ nguyên.</p>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const creating = searchParams.get('new') === '1';
  const campaignId = searchParams.get('campaignId') || undefined;
  // A new draft still loads the primary campaign (the hook default) for the interviewer/room catalog.
  const { data, status, error, reload, ...actions } = useCampaign(creating ? undefined : campaignId);

  // While another campaign id loads, the hook still returns the previous one; never edit stale data.
  const stale = status === 'success' && campaignId && !creating && data.campaign.id !== campaignId;
  if (status !== 'success' || stale) {
    return (
      <MainTemplate {...HEADING} step={1}>
        <AsyncContent status={stale ? 'loading' : status} error={error} onRetry={reload} />
      </MainTemplate>
    );
  }

  if (creating) {
    return (
      <CampaignWorkspace
        key={`new-${dataVersion}`}
        view={blankView(data)}
        actions={{ ...actions, saveDraft: (form) => actions.createCampaign(form) }}
        onCreated={(id) => setSearchParams({ campaignId: id }, { state: { created: true } })}
      />
    );
  }

  return (
    <CampaignWorkspace
      key={`${campaignId ?? 'primary'}-${dataVersion}`}
      view={data}
      actions={actions}
      created={Boolean(location.state?.created)}
      onCreateNew={() => setSearchParams({ new: '1' })}
    />
  );
}
