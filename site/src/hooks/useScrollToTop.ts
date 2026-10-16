import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Height of the sticky header plus breathing room, read from the token. */
function stickyOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
  const parsed = Number.parseFloat(raw);
  return (Number.isFinite(parsed) ? parsed : 62) + 24;
}

/** How many frames to wait for a lazily-loaded route to render its target. */
const MAX_FRAMES = 40;

/**
 * Resets scroll position on route change, as a SPA router would on load.
 *
 * When the location carries a fragment (`/terms#liability`) this scrolls to that
 * section instead of the top. The router is a HashRouter, so the real URL is
 * `#/terms#liability` — the browser's own fragment handling never fires for the
 * inner id, and a bare `href="#id"` would destroy the route. Scrolling has to be
 * done explicitly.
 *
 * Routes are lazy, so on a cold deep link the target does not exist on the first
 * frame; the lookup is retried for a short window before giving up.
 */
export function useScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const offset = stickyOffset();

    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      id = hash.slice(1);
    }
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    let frame = 0;
    let attempts = 0;

    const attempt = () => {
      const target = document.getElementById(id);
      if (target) {
        const top = window.scrollY + target.getBoundingClientRect().top - offset;
        // 'instant' rather than 'auto': <html> sets scroll-behavior: smooth for
        // native anchor jumps, and 'auto' inherits that, so a long jump would
        // animate and never settle at the expected offset.
        window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
        return;
      }
      if (attempts < MAX_FRAMES) {
        attempts += 1;
        frame = window.requestAnimationFrame(attempt);
      }
    };

    attempt();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname, hash]);
}