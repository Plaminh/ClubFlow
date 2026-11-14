import { Link } from 'react-router-dom';
import './Button.css';

const VARIANTS = new Set(['primary', 'secondary', 'quiet', 'danger', 'success']);

/**
 * Button styled like the PA#2 reference.
 * - `to` renders a router link, `href` a plain link (for files), otherwise a <button>.
 * - `variant`: primary (default), secondary, quiet, danger, success.
 * - `block` stretches it to the container width.
 */
export default function Button({
  children,
  variant = 'primary',
  block = false,
  className = '',
  to,
  href,
  type = 'button',
  ...props
}) {
  const classes = [
    'button',
    VARIANTS.has(variant) && variant !== 'primary' ? `button--${variant}` : '',
    block ? 'button--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
