import { useTheme } from '../../context/ThemeContext';
import { runTransition } from '../PageTransitionOverlay';
import './ThemeToggle.css';

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" width="12" height="12" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M10 1.5v2.2M10 16.3v2.2M18.5 10h-2.2M3.7 10H1.5" />
        <path d="M15.7 4.3l-1.55 1.55M5.85 14.15L4.3 15.7M15.7 15.7l-1.55-1.55M5.85 5.85L4.3 4.3" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" width="12" height="12" fill="none" aria-hidden="true">
      <path
        d="M17 11.3A7.2 7.2 0 1 1 8.7 3a5.8 5.8 0 0 0 8.3 8.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Glass pill switch that flips the site's color scheme via a quick liquid-glass shutter. */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = () => {
    runTransition(() => toggleTheme(), { quick: true });
  };

  return (
    <button
      type="button"
      className={`theme-toggle glass ${className}`.trim()}
      onClick={handleClick}
      role="switch"
      aria-checked={!isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className={`theme-toggle-thumb ${isDark ? '' : 'is-light'}`}>
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
