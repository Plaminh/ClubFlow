import './StepIndicator.css';

/** Ordered step strip (reference "flow-steps"); marks the current step. */
export default function StepIndicator({ steps, current, label }) {
  return (
    <ol className="step-indicator" aria-label={label} style={{ '--step-count': steps.length }}>
      {steps.map((step, index) => (
        <li
          key={step}
          className="step-indicator__step"
          aria-current={index + 1 === current ? 'step' : undefined}
        >
          <span className="step-indicator__number" aria-hidden="true">
            {index + 1}
          </span>
          <span>
            {step}
            {index + 1 === current ? <span className="visually-hidden"> (bước hiện tại)</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
