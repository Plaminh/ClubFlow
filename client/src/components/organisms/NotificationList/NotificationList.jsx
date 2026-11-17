import Badge from '../../atoms/Badge/index.js';
import { formatDateTime } from '../../../utils/format.js';
import './NotificationList.css';

/** In-app notifications for the signed-in applicant (no email/SMS/push). */
export default function NotificationList({ notifications }) {
  return (
    <ul className="notification-list">
      {notifications.map((notification) => (
        <li key={notification.id} className="notification-list__item">
          <div className="notification-list__text">
            <strong>{notification.message}</strong>
            <span className="muted">{formatDateTime(notification.createdAt)}</span>
          </div>
          {notification.readAt ? null : <Badge tone="info">Mới</Badge>}
        </li>
      ))}
    </ul>
  );
}
