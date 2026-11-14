import PositionCard from '../../molecules/PositionCard/index.js';
import { formatDate } from '../../../utils/format.js';

/** Read-only view of what applicants will see for a campaign. */
export default function CampaignPreview({ campaign, positions }) {
  return (
    <div className="stack">
      <p className="section-kicker">Nội dung ứng viên sẽ thấy</p>
      <p className="campaign-preview__title">
        <strong>{campaign.name || 'Chưa có tên chiến dịch'}</strong>
      </p>
      <dl className="summary-list summary-list--columns">
        <div>
          <dt>Câu lạc bộ chủ trì</dt>
          <dd>{campaign.hostClub || '—'}</dd>
        </div>
        <div>
          <dt>Thời gian nhận đơn</dt>
          <dd>
            {formatDate(campaign.opensOn)}–{formatDate(campaign.closesOn)}
          </dd>
        </div>
        <div>
          <dt>Phỏng vấn</dt>
          <dd>
            {formatDate(campaign.interviewDate)} · {campaign.interviewWindow.start}–{campaign.interviewWindow.end} ·{' '}
            {campaign.slotMinutes} phút/ca
          </dd>
        </div>
      </dl>
      <div>
        <h3>Mô tả chiến dịch</h3>
        <p>{campaign.description || '—'}</p>
      </div>
      <div>
        <h3>Hướng dẫn ứng tuyển</h3>
        <p>{campaign.instructions || '—'}</p>
      </div>
      <div className="stack">
        <h3>Ban và vị trí tuyển</h3>
        {positions.length === 0 ? <p className="muted">Chưa có vị trí nào.</p> : null}
        {positions.map((position) => (
          <PositionCard key={position.key ?? position.id} {...position} headingLevel={4} />
        ))}
      </div>
    </div>
  );
}
