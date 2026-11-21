import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import {
  getLabel,
  SCREENING_STATUS_LABELS,
  SCREENING_STATUS_TONES,
} from '../../../constants/labels.js';
import { formatDateTime } from '../../../utils/format.js';
import './ApplicationList.css';

/** Application list items (reference "application-list"). Selecting opens the detail panel. */
export default function ApplicationList({ items, selectedId, onSelect }) {
  return (
    <ul className="application-list">
      {items.map((item) => {
        const current = item.id === selectedId;
        return (
          <li key={item.id}>
            <div className="application-list__item" aria-current={current ? 'true' : undefined}>
              <div className="application-list__text">
                <strong>
                  {item.id} · {item.applicantName}
                </strong>
                <span className="application-list__meta">
                  {item.positionName} · {formatDateTime(item.submittedAt)}
                </span>
                <Badge tone={SCREENING_STATUS_TONES[item.screeningStatus]}>
                  {getLabel(SCREENING_STATUS_LABELS, item.screeningStatus)}
                </Badge>
              </div>
              <Button
                variant="quiet"
                onClick={() => onSelect(item.id)}
                disabled={current}
                aria-label={
                  current ? `Đang xem ${item.id}` : `Review ${item.id} · ${item.applicantName}`
                }
              >
                {current ? 'Đang xem' : 'Review'}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
