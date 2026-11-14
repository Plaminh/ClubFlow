import { useId } from 'react';
import './FormField.css';

/**
 * Label + control + hint + error, wired for assistive technology.
 * `children` is a function that receives the props to spread on the control:
 *   <FormField label="Tên" error={err}>{(p) => <input {...p} />}</FormField>
 */
export default function FormField({ id, label, hint, error, extra, className = '', children }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${error ? 'field--invalid' : ''} ${className}`.trim()}>
      <label className="field__label" htmlFor={controlId}>
        {label}
      </label>
      {children({
        id: controlId,
        className: 'field__control',
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}
      {extra}
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
