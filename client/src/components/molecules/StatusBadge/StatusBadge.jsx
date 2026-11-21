import './StatusBadge.css';

const labels = {
  loading: 'Checking API…',
  online: 'API connected',
  offline: 'API unavailable',
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{labels[status] ?? status}</span>;
}
