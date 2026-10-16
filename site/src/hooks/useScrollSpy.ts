import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view, for table-of-contents highlighting.
 *
 * Uses a scroll listener rather than IntersectionObserver because the decision
 * is "which heading is the topmost one already passed", not "which elements are
 * intersecting" — a position calculation answers that directly and behaves
 * predictably for short trailing sections.
 *
 * `ids` should be a stable (module-level or memoised) array; it is an effect
 * dependency.
 */
export function useScrollSpy(ids: readonly string[], offsetPx = 140): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;

    const compute = () => {
      let current: string | null = null;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offsetPx <= 0) current = id;
      }

      if (current) {
        setActiveId(current);
        return;
      }

      // Above the first section, or scrolled to the very bottom where a short
      // trailing section can never cross the offset line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActiveId(atBottom ? (ids[ids.length - 1] ?? null) : (ids[0] ?? null));
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        compute();
      });
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids, offsetPx]);

  return activeId;
}