import './Alert.css';

/**
 * Message banner. tone: info | success | warning | error.
 * Pass `live` for messages that appear after a user action so screen readers
 * announce them (errors use role="alert", others role="status").
 */
export default function Alert({ tone = 'info', title, children, live = false, className = '', ...props }) {
  const role = live ? (tone === 'error' ? 'alert' : 'status') : undefined;

  return (
    <div className={`alert alert--${tone} ${className}`.trim()} role={role} {...props}>
      {title ? <strong className="alert__title">{title}</strong> : null}
      {children ? <div className="alert__body">{children}</div> : null}
    </div>
  );
}
