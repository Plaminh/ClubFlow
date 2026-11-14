import Badge from '../../atoms/Badge/index.js';
import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import { formatDate } from '../../../utils/format.js';

// Native date inputs display in the browser's locale; show dd/MM/yyyy too.
const chosen = (value) => (value ? `Ngày đã chọn: ${formatDate(value)}.` : undefined);

/** Campaign information fields (reference "Thông tin chiến dịch"). */
export default function CampaignDetailsCard({ values, errors, statusLabel, statusTone, disabled, onChange }) {
  const bind = (field) => ({
    value: values[field] ?? '',
    onChange: (event) => onChange(field, event.target.value),
    disabled,
  });

  return (
    <Card title="Thông tin chiến dịch" actions={<Badge tone={statusTone}>{statusLabel}</Badge>}>
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
          <FormField id="campaign-opens" label="Ngày mở đơn" error={errors.opensOn} hint={chosen(values.opensOn)}>
            {(props) => <input {...props} type="date" {...bind('opensOn')} />}
          </FormField>
          <FormField
            id="campaign-closes"
            label="Ngày đóng đơn"
            error={errors.closesOn}
            hint={`${chosen(values.closesOn) ?? ''} Hồ sơ được nhận đến hết ngày đóng đơn.`.trim()}
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
