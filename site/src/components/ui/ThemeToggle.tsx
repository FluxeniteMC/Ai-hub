import { Moon, Sun } from 'lucide-react';

import { useTheme } from '../../hooks/useTheme';
import { cx } from '../../lib/format';

/**
 * Light/dark switch. The two icons crossfade and rotate rather than swapping
 * abruptly, and the whole page transitions colour (not layout) on change.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const nextLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      className={cx('theme-toggle', className)}
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
      // Communicates state to assistive tech without relying on the icon.
      aria-pressed={isDark}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__icon theme-toggle__icon--sun">
          <Sun size={15} strokeWidth={2.1} />
        </span>
        <span className="theme-toggle__icon theme-toggle__icon--moon">
          <Moon size={15} strokeWidth={2.1} />
        </span>
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
}