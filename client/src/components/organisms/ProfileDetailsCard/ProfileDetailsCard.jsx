import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Card from '../../molecules/Card/index.js';
import { ROLE_LABELS } from '../../../constants/labels.js';
import './ProfileDetailsCard.css';

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function ProfileDetailsCard({ profile, onEdit }) {
  return (
    <Card
      title="Thông tin cá nhân"
      actions={
        <Button variant="secondary" onClick={onEdit}>
          Chỉnh sửa
        </Button>
      }
    >
      <div className="profile-summary">
        <div className="profile-summary__avatar" aria-hidden="true">
          {initials(profile.displayName)}
        </div>
        <div className="profile-summary__identity">
          <h3>{profile.displayName}</h3>
          <p>{profile.email}</p>
          <Badge tone="info">{ROLE_LABELS[profile.role]}</Badge>
        </div>
      </div>
      <dl className="summary-list summary-list--columns profile-summary__details">
        <div>
          <dt>Mã tài khoản</dt>
          <dd>{profile.id}</dd>
        </div>
        <div>
          <dt>Vai trò</dt>
          <dd>{ROLE_LABELS[profile.role]}</dd>
        </div>
        {profile.studentId ? (
          <div>
            <dt>Mã sinh viên</dt>
            <dd>{profile.studentId}</dd>
          </div>
        ) : null}
        {profile.faculty ? (
          <div>
            <dt>Khoa</dt>
            <dd>{profile.faculty}</dd>
          </div>
        ) : null}
        {profile.year ? (
          <div>
            <dt>Năm học</dt>
            <dd>{profile.year}</dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
