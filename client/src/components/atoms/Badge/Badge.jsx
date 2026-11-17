import './Badge.css';

/**
 * Status badge. The text is always visible, so meaning never relies on color.
 * tone: neutral | info | success | warning | danger
 */
export default function Badge({ tone = 'neutral', children, className = '' }) {
  return <span className={`badge badge--${tone} ${className}`.trim()}>{children}</span>;
}
