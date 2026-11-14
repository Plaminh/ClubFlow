import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import FormField from '../../molecules/FormField/index.js';
import './PositionsEditor.css';

/**
 * Editable departments/positions list (reference "Ban và vị trí tuyển").
 * positions: [{ key, id?, departmentName, name, quota, description, requirements, applicationCount }]
 */
export default function PositionsEditor({ positions, errors, listError, disabled, onAdd, onChange, onRemove }) {
  return (
    <Card
      title="Ban và vị trí tuyển"
      actions={
        <Button variant="secondary" onClick={onAdd} disabled={disabled}>
          + Thêm vị trí
        </Button>
      }
    >
      <div className="stack">
        {listError ? (
          <Alert tone="error" live>
            <p>{listError}</p>
          </Alert>
        ) : null}
        {positions.map((position, index) => {
          const fieldId = (field) => `position-${position.key}-${field}`;
          const error = (field) => errors[`position:${position.key}:${field}`];
          const bind = (field) => ({
            value: position[field] ?? '',
            onChange: (event) => onChange(position.key, field, event.target.value),
            disabled,
          });
          return (
            <fieldset key={position.key} className="position-editor">
              <legend className="position-editor__legend">
                Vị trí {index + 1}
                {position.name ? ` · ${position.name}` : ''}
              </legend>
              <div className="field-grid">
                <FormField id={fieldId('department')} label="Ban (Department)" error={error('departmentName')}>
                  {(props) => <input {...props} {...bind('departmentName')} />}
                </FormField>
                <FormField id={fieldId('name')} label="Tên vị trí (Position)" error={error('name')}>
                  {(props) => <input {...props} {...bind('name')} />}
                </FormField>
                <FormField
                  id={fieldId('quota')}
                  label="Chỉ tiêu"
                  error={error('quota')}
                  hint="Số người dự kiến tuyển; không giới hạn số hồ sơ nộp."
                >
                  {(props) => <input {...props} inputMode="numeric" {...bind('quota')} />}
                </FormField>
              </div>
              <FormField id={fieldId('description')} label="Mô tả công việc" error={error('description')}>
                {(props) => <textarea {...props} rows={2} {...bind('description')} />}
              </FormField>
              <FormField id={fieldId('requirements')} label="Yêu cầu" error={error('requirements')}>
                {(props) => <textarea {...props} rows={2} {...bind('requirements')} />}
              </FormField>
              <div className="button-row">
                <Button variant="danger" onClick={() => onRemove(position)} disabled={disabled}>
                  Xóa vị trí
                </Button>
                {position.applicationCount > 0 ? (
                  <span className="hint">{position.applicationCount} hồ sơ đang liên kết với vị trí này.</span>
                ) : null}
              </div>
            </fieldset>
          );
        })}
      </div>
    </Card>
  );
}
