import { useCallback, useEffect, useMemo, useState } from 'react';

export const COMPARE_LIMIT = 4;

/**
 * Exported so the privacy policy can name the exact key it clears — a
 * hard-coded duplicate would silently stop matching if this ever changed.
 */
export const COMPARE_STORAGE_KEY = 'fluxenite-ai-hub:compare';

function readStoredSelection(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, COMPARE_LIMIT);
  } catch {
    // Private-mode or corrupted storage should never break the app.
    return [];
  }
}

/**
 * Selection for the comparison tray, persisted to localStorage so a reload
 * (or a shared /compare link) keeps the user's picks.
 */
export function useCompareSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>(readStoredSelection);

  useEffect(() => {
    try {
      window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {
      // Ignore quota/permission errors; comparison still works in-session.
    }
  }, [selectedIds]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== COMPARE_STORAGE_KEY) return;
      setSelectedIds(readStoredSelection());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= COMPARE_LIMIT) return current;
      return [...current, id];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const isFull = selectedIds.length >= COMPARE_LIMIT;

  return useMemo(
    () => ({ selectedIds, toggle, remove, clear, isSelected, isFull, limit: COMPARE_LIMIT }),
    [selectedIds, toggle, remove, clear, isSelected, isFull],
  );
}