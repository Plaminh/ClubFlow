import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import PositionCard from '../../molecules/PositionCard/index.js';
import Timeline from '../../molecules/Timeline/index.js';
import { phaseMessage } from '../../../utils/campaignPhase.js';
import { formatDate } from '../../../utils/format.js';

/** Public campaign information (reference applicant.html "Campaign" tab). */
export default function PublicCampaignPanel({ data, role, onApply }) {
  const { campaign, positions, phase } = data;
  const status = phaseMessage(phase, campaign);
  let applyHint = '';
  if (phase !== 'open') {
    applyHint = status.text;
  } else if (role === 'visitor') {
    applyHint = 'Nộp hồ sơ cần đăng nhập; khách vẫn xem được thông tin công khai.';
  } else if (role !== 'applicant') {
    applyHint = 'Chỉ tài khoản ứng viên mới nộp hồ sơ.';
  }

  return (
    <div className="stack stack--roomy">
      <Timeline
        items={[
          { date: formatDate(campaign.opensOn), label: 'Mở đơn ứng tuyển' },
          { date: formatDate(campaign.closesOn), label: 'Đóng đơn ứng tuyển' },
          {
            date: formatDate(campaign.interviewDate),
            label: `Phỏng vấn · ${campaign.interviewWindow.start}–${campaign.interviewWindow.end}`,
          },
        ]}
      />
      <Alert tone={status.tone} title={status.title}>
        <p>{status.text}</p>
      </Alert>
      <div className="split-layout split-layout--wide-first">
        <Card title="Thông tin chiến dịch" actions={<Badge tone="success">Đã công bố</Badge>}>
          <div className="stack">
            <div>
              <h3>Mô tả chiến dịch</h3>
              <p className="muted">{campaign.description}</p>
            </div>
            <div>
              <h3>Hướng dẫn ứng tuyển</h3>
              <p className="muted">{campaign.instructions}</p>
            </div>
            <h3>Ban và vị trí tuyển</h3>
            {positions.map((position) => (
              <PositionCard key={position.id} {...position} headingLevel={4} />
            ))}
          </div>
        </Card>
        <Card as="aside" title="Ứng tuyển">
          <div className="stack">
            <p className="muted">Khách có thể xem thông tin công khai của chiến dịch. Nộp hồ sơ cần đăng nhập.</p>
            <div>
              <Button onClick={onApply} disabled={phase !== 'open' || (role !== 'visitor' && role !== 'applicant')}>
                Apply Now
              </Button>
            </div>
            {applyHint ? <p className="hint">{applyHint}</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
