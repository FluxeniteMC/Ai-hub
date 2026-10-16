import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Exported so the privacy policy can name the exact key it clears — a
 * hard-coded duplicate would silently stop matching if this ever changed.
 */
export const THEME_STORAGE_KEY = 'aihub:theme';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const current = document.documentElement.getAttribute('data-theme');
  return current === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Keeps native UI (scrollbars, form controls) in step with the theme.
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the theme still applies for this session.
  }
}

/**
 * Reads and controls the document theme.
 *
 * The initial value is already on <html> from the inline script in index.html,
 * so there is no flash and no layout shift. Calling toggle() animates the
 * change via the .theme-changing class, which transitions colour properties only
 * for the duration of the switch.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const setThemeValue = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.add('theme-changing');
    applyTheme(next);
    setTheme(next);

    // Remove the transition class after the switch settles.
    window.setTimeout(() => root.classList.remove('theme-changing'), 320);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeValue(readTheme() === 'dark' ? 'light' : 'dark');
  }, [setThemeValue]);

  // Follow the OS only while the visitor has not made an explicit choice.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        saved = null;
      }
      if (saved === 'dark' || saved === 'light') return;
      const next: Theme = event.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.style.colorScheme = next;
      setTheme(next);
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return { theme, setTheme: setThemeValue, toggleTheme };
}