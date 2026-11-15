import { useOutletContext, useSearchParams } from 'react-router-dom';
import Button from '../components/atoms/Button/index.js';
import Alert from '../components/molecules/Alert/index.js';
import AsyncContent from '../components/molecules/AsyncContent/index.js';
import Card from '../components/molecules/Card/index.js';
import EmptyState from '../components/molecules/EmptyState/index.js';
import Tabs from '../components/molecules/Tabs/index.js';
import ApplicationForm from '../components/organisms/ApplicationForm/index.js';
import MyApplicationsTable from '../components/organisms/MyApplicationsTable/index.js';
import NotificationList from '../components/organisms/NotificationList/index.js';
import PublicCampaignPanel from '../components/organisms/PublicCampaignPanel/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { SCREEN_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useAction from '../hooks/useAction.js';
import useApplicantPortal from '../hooks/useApplicantPortal.js';
import { ROUTE_TABS, TAB_QUERY_PARAM } from '../routes/paths.js';
import { phaseMessage } from '../utils/campaignPhase.js';

const HEADING = {
  eyebrow: 'Cổng ứng viên · CLB Công nghệ & Sáng tạo',
  title: SCREEN_LABELS.applicantPortal,
  description: 'Xem chiến dịch tuyển thành viên, nộp hồ sơ và theo dõi từng hồ sơ của bạn.',
};

function SignInGate({ role, title, text, onSignIn }) {
  if (role === 'visitor') {
    return (
      <EmptyState title={title} actions={<Button onClick={onSignIn}>Sign In</Button>}>
        <p>{text}</p>
      </EmptyState>
    );
  }
  return (
    <EmptyState title="Phần này dành cho tài khoản ứng viên">
      <p>Đăng nhập bằng tài khoản demo vai trò Ứng viên để xem nội dung này.</p>
    </EmptyState>
  );
}

export default function ApplicantPortalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { role, account, dataVersion } = useDemoSession();
  const { openSignIn } = useOutletContext() ?? {};
  const isApplicant = role === 'applicant';
  const portal = useApplicantPortal(isApplicant);
  const submit = useAction();
  const markRead = useAction();
  const requested = searchParams.get(TAB_QUERY_PARAM);
  const tab = ROUTE_TABS.applicantPortal.includes(requested) ? requested : 'campaign';
  const setTab = (id) => setSearchParams({ [TAB_QUERY_PARAM]: id }, { replace: true });

  if (portal.status !== 'success') {
    return (
      <MainTemplate {...HEADING}>
        <AsyncContent status={portal.status} error={portal.error} onRetry={portal.reload} />
      </MainTemplate>
    );
  }

  const { publicCampaign, applications, notifications } = portal.data;
  if (!publicCampaign.campaign) {
    return (
      <MainTemplate {...HEADING}>
        <EmptyState title="Chưa có chiến dịch đang được công bố">
          <p>Chiến dịch tuyển thành viên sẽ hiển thị ở đây sau khi Ban tuyển dụng công bố.</p>
        </EmptyState>
      </MainTemplate>
    );
  }

  const { campaign, phase } = publicCampaign;
  const unread = notifications.filter((notification) => !notification.readAt).length;
  const tabs = [
    { id: 'campaign', label: 'Campaign', marker: '1' },
    { id: 'apply', label: 'Apply', marker: '2' },
    { id: 'mine', label: 'My Applications', marker: '3' },
    { id: 'notifications', label: 'Notifications', marker: '4', count: unread || null },
  ];

  function handleApply() {
    if (role === 'visitor') {
      openSignIn?.();
    } else {
      setTab('apply');
    }
  }

  async function submitApplication(formData) {
    const result = await submit.run(() => portal.submitApplication(formData));
    if (result.ok) {
      portal.reload();
    }
    return result;
  }

  async function markAllRead() {
    const result = await markRead.run(() => portal.markNotificationsRead());
    if (result.ok) {
      portal.reload();
    }
  }

  let panel;
  if (tab === 'campaign') {
    panel = <PublicCampaignPanel data={publicCampaign} role={role} onApply={handleApply} />;
  } else if (!isApplicant) {
    const gates = {
      apply: ['Cần đăng nhập để nộp hồ sơ', 'Bạn có thể xem chiến dịch mà không cần đăng nhập.'],
      mine: ['Đăng nhập để xem hồ sơ của bạn', 'Chỉ hồ sơ của tài khoản đang đăng nhập được hiển thị.'],
      notifications: ['Đăng nhập để xem thông báo', 'Thông báo là riêng tư theo từng ứng viên.'],
    };
    panel = <SignInGate role={role} title={gates[tab][0]} text={gates[tab][1]} onSignIn={openSignIn} />;
  } else if (tab === 'apply') {
    const status = phaseMessage(phase, campaign);
    panel = (
      <div className="stack">
        {phase !== 'open' ? (
          <Alert tone="warning" title={status.title}>
            <p>{status.text} Biểu mẫu bên dưới chỉ để xem và đang bị vô hiệu hóa.</p>
          </Alert>
        ) : null}
        <ApplicationForm
          key={`${account.id}-${dataVersion}`}
          account={account}
          positions={publicCampaign.positions}
          slots={publicCampaign.slots}
          slotMinutes={campaign.slotMinutes}
          interviewDate={campaign.interviewDate}
          applications={applications}
          disabled={phase !== 'open'}
          onSubmit={submitApplication}
        />
      </div>
    );
  } else if (tab === 'mine') {
    panel = (
      <Card title="Hồ sơ của tôi" subtitle={`${applications.length} hồ sơ của ${account.displayName}`}>
        <div className="stack">
          <Alert tone="info" title="Mỗi hồ sơ được xử lý độc lập">
            <p>
              Trạng thái sàng lọc, lịch phỏng vấn và kết quả cuối của hồ sơ này không quyết định hồ sơ khác của cùng bạn.
              “Qua vòng CV” chưa phải kết quả cuối.
            </p>
          </Alert>
          {applications.length > 0 ? (
            <MyApplicationsTable applications={applications} />
          ) : (
            <EmptyState
              title="Bạn chưa có hồ sơ nào"
              headingLevel={3}
              actions={
                phase === 'open' ? (
                  <Button variant="secondary" onClick={() => setTab('apply')}>
                    Mở tab Apply
                  </Button>
                ) : null
              }
            >
              <p>Bạn có thể ứng tuyển nhiều vị trí, mỗi vị trí một hồ sơ.</p>
            </EmptyState>
          )}
        </div>
      </Card>
    );
  } else {
    panel = (
      <Card
        title="Thông báo trong ứng dụng"
        subtitle="Chỉ gồm kết quả đã công bố. Kết quả chưa công bố không xuất hiện."
        actions={
          unread > 0 ? (
            <Button variant="secondary" onClick={markAllRead} disabled={markRead.pending}>
              Đánh dấu tất cả đã đọc
            </Button>
          ) : null
        }
      >
        <div className="stack">
          {markRead.error ? (
            <Alert tone="error" title="Chưa thể đánh dấu đã đọc" live>
              <p>{markRead.error.message}</p>
            </Alert>
          ) : null}
          {notifications.length > 0 ? (
            <NotificationList notifications={notifications} />
          ) : (
            <EmptyState title="Chưa có thông báo" headingLevel={3}>
              <p>Thông báo về kết quả đã công bố sẽ hiện ở đây. ClubFlow không gửi email, SMS hay thông báo đẩy.</p>
            </EmptyState>
          )}
        </div>
      </Card>
    );
  }

  return (
    <MainTemplate {...HEADING} context={campaign.name}>
      <Tabs idPrefix="portal" label="Các phần của cổng ứng viên" tabs={tabs} value={tab} onChange={setTab} />
      <div role="tabpanel" id={`portal-panel-${tab}`} aria-labelledby={`portal-tab-${tab}`}>
        {panel}
      </div>
    </MainTemplate>
  );
}
