import Badge from '../../atoms/Badge/index.js';
import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { formatDate } from '../../../utils/format.js';

// Native date inputs display in the browser's locale; show dd/MM/yyyy too.
const chosen = (value) => (value ? `Ngày đã chọn: ${formatDate(value)}.` : undefined);

/**
 * Campaign information (reference "Thông tin chiến dịch"). A draft is an
 * editable form; with `readOnly` (published campaign) the same values are
 * shown as text, not as disabled fields.
 */
export default function CampaignDetailsCard({ values, errors, statusLabel, statusTone, disabled, readOnly, onChange }) {
  const status = <Badge tone={statusTone}>{statusLabel}</Badge>;

  if (readOnly) {
    return (
      <Card title="Thông tin chiến dịch" actions={status}>
        <dl className="summary-list">
          <div>
            <dt>Tên chiến dịch</dt>
            <dd>{values.name || '—'}</dd>
          </div>
          <div>
            <dt>Câu lạc bộ chủ trì</dt>
            <dd>{values.hostClub || '—'}</dd>
          </div>
          <div>
            <dt>Mô tả chiến dịch</dt>
            <dd>{values.description || '—'}</dd>
          </div>
          <div>
            <dt>Thời gian nhận đơn</dt>
            <dd>
              Từ {formatDate(values.opensOn)} đến hết ngày {formatDate(values.closesOn)} (giờ Việt Nam)
            </dd>
          </div>
          <div>
            <dt>Hướng dẫn ứng tuyển</dt>
            <dd>{values.instructions || '—'}</dd>
          </div>
        </dl>
      </Card>
    );
  }

  const bind = (field) => ({
    value: values[field] ?? '',
    onChange: (event) => onChange(field, event.target.value),
    disabled,
  });

  return (
    <Card title="Thông tin chiến dịch" actions={status}>
      <div className="stack">
        <div className="field-grid">
          <FormField id="campaign-name" label="Tên chiến dịch" error={errors.name}>
            {(props) => <textarea {...props} rows={4} {...bind('name')} />}
          </FormField>
          <FormField id="campaign-host" label="Câu lạc bộ chủ trì" error={errors.hostClub}>
            {(props) => <input {...props} {...bind('hostClub')} />}
          </FormField>
        </div>
        <FormField id="campaign-description" label="Mô tả chiến dịch" error={errors.description}>
          {(props) => <textarea {...props} rows={4} {...bind('description')} />}
        </FormField>
        <div className="field-grid">
          <FormField
            id="campaign-opens"
            label="Ngày mở đơn"
            error={errors.opensOn}
            hint={`${chosen(values.opensOn) ?? ''} Nhận hồ sơ từ 00:00 ngày mở đơn (giờ Việt Nam).`.trim()}
          >
            {(props) => <input {...props} type="date" {...bind('opensOn')} />}
          </FormField>
          <FormField
            id="campaign-closes"
            label="Ngày đóng đơn"
            error={errors.closesOn}
            hint={`${chosen(values.closesOn) ?? ''} Nhận hồ sơ đến hết ngày đóng đơn, tức trước 00:00 ngày kế tiếp (giờ Việt Nam).`.trim()}
          >
            {(props) => <input {...props} type="date" {...bind('closesOn')} />}
          </FormField>
        </div>
        <FormField id="campaign-instructions" label="Hướng dẫn ứng tuyển" error={errors.instructions}>
          {(props) => <textarea {...props} rows={4} {...bind('instructions')} />}
        </FormField>
      </div>
    </Card>
  );
}
