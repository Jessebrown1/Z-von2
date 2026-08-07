import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Shared button/link. Renders an <a>/<Link> when `to` or `href` is passed,
 * otherwise a <button>. variant: 'solid' | 'outline' | 'ghost'.
 */
export default function Button({
  children,
  to,
  href,
  variant = 'solid',
  className = '',
  ...rest
}) {
  const classes = `btn btn--${variant} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
