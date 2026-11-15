import { formatMegabytes } from '../../../utils/validation.js';
import FormField from '../FormField/index.js';

/**
 * File picker with label, hint, error, and the chosen file's name and size.
 * The demo only reads name/type/size; uploading is a backend concern.
 */
export default function FileField({ id, label, accept, file, hint, error, disabled, onChange }) {
  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      extra={
        <p className="field__hint" aria-live="polite">
          {file ? `Đã chọn: ${file.name} · ${formatMegabytes(file.size)}` : 'Chưa chọn tệp'}
        </p>
      }
    >
      {(props) => (
        <input
          {...props}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      )}
    </FormField>
  );
}
