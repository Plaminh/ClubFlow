import { useId } from 'react';
import './Card.css';

/**
 * White surface section with an optional heading row (title + actions).
 * Renders a <section> named by its title, so screen readers can reach it by
 * heading or as a named region.
 */
export default function Card({
  title,
  kicker,
  headingLevel = 2,
  actions,
  subtitle,
  as: Element = 'section',
  className = '',
  children,
  ...props
}) {
  const headingId = useId();
  const Heading = `h${headingLevel}`;

  return (
    <Element
      className={`card ${className}`.trim()}
      aria-labelledby={title ? headingId : undefined}
      {...props}
    >
      {title ? (
        <div className="card__heading">
          <div className="card__titles">
            {kicker ? <p className="section-kicker">{kicker}</p> : null}
            <Heading id={headingId} className="card__title">
              {title}
            </Heading>
            {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="card__actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </Element>
  );
}
