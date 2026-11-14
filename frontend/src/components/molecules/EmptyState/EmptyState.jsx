import './EmptyState.css';

/** Centered message for empty, restricted, or not-yet-available content. */
export default function EmptyState({ title, children, actions, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;

  return (
    <div className="empty-state">
      <Heading className="empty-state__title">{title}</Heading>
      {children ? <div className="empty-state__body">{children}</div> : null}
      {actions ? <div className="empty-state__actions">{actions}</div> : null}
    </div>
  );
}
