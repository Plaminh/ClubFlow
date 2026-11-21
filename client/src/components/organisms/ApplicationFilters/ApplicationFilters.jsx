import Button from '../../atoms/Button/index.js';
import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { SCREENING_STATUS_LABELS } from '../../../constants/labels.js';
import './ApplicationFilters.css';

/** Search, filter, sort, and CSV export controls (reference "Tìm và lọc hồ sơ"). */
export default function ApplicationFilters({ query, positions, onChange, onExport, exporting }) {
  return (
    <Card
      title="Tìm và lọc hồ sơ"
      actions={
        <Button variant="secondary" onClick={onExport} disabled={exporting}>
          {exporting ? 'Đang xuất…' : 'Xuất CSV'}
        </Button>
      }
    >
      <div className="application-filters">
        <FormField id="application-search" label="Tìm tên hoặc mã hồ sơ">
          {(props) => (
            <input
              {...props}
              type="search"
              placeholder="Ví dụ: CF-026"
              value={query.search}
              onChange={(event) => onChange({ search: event.target.value })}
            />
          )}
        </FormField>
        <FormField id="position-filter" label="Vị trí">
          {(props) => (
            <select
              {...props}
              value={query.positionId}
              onChange={(event) => onChange({ positionId: event.target.value })}
            >
              <option value="">Tất cả vị trí</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id="status-filter" label="Trạng thái">
          {(props) => (
            <select
              {...props}
              value={query.status}
              onChange={(event) => onChange({ status: event.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(SCREENING_STATUS_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id="sort-order" label="Sắp xếp">
          {(props) => (
            <select
              {...props}
              value={query.sort}
              onChange={(event) => onChange({ sort: event.target.value })}
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
            </select>
          )}
        </FormField>
      </div>
    </Card>
  );
}
