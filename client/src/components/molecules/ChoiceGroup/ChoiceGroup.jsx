import { useId } from 'react';
import './ChoiceGroup.css';

/**
 * Fieldset of checkboxes or radios (reference "choice-group" / chips).
 * type 'checkbox': value is an array; type 'radio': value is a string.
 */
export default function ChoiceGroup({
  legend,
  name,
  type = 'checkbox',
  options,
  value,
  onChange,
  hint,
  error,
  disabled,
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const selected = (optionValue) =>
    type === 'checkbox' ? value.includes(optionValue) : value === optionValue;

  function toggle(optionValue, checked) {
    if (type === 'radio') {
      onChange(optionValue);
    } else {
      onChange(checked ? [...value, optionValue] : value.filter((item) => item !== optionValue));
    }
  }

  return (
    <fieldset
      className={`choice-group ${error ? 'choice-group--invalid' : ''}`.trim()}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      disabled={disabled}
    >
      <legend className="choice-group__legend">{legend}</legend>
      <div className="choice-group__options">
        {options.map((option) => (
          <label key={option.value} className="choice-group__option">
            <input
              type={type}
              name={name}
              value={option.value}
              checked={selected(option.value)}
              onChange={(event) => toggle(option.value, event.target.checked)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
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
    </fieldset>
  );
}
