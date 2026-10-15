import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Resets scroll position on route change, as a SPA router would on load. */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
}