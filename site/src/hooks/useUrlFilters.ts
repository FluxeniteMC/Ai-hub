import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_FILTERS } from '../lib/catalog';
import type { EntryKind, ExploreFilters, SortKey } from '../types/catalog';

const KINDS: readonly EntryKind[] = ['model', 'api', 'tool', 'database', 'runner'];
const SORTS: readonly SortKey[] = [
  'name-asc',
  'name-desc',
  'provider-asc',
  'listings-desc',
  'input-cost-asc',
  'output-cost-asc',
  'context-desc',
];

function readEnum<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

/**
 * Keeps explorer state in the URL so filtered views are shareable and survive
 * a refresh or a back/forward navigation.
 */
export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ExploreFilters>(() => {
    const section = searchParams.get('section');
    const group = searchParams.get('group');
    const provider = searchParams.get('provider');
    return {
      query: searchParams.get('q') ?? DEFAULT_FILTERS.query,
      kind: readEnum<EntryKind | 'all'>(searchParams.get('kind'), ['all', ...KINDS], 'all'),
      provider: provider && provider !== 'Unspecified' ? provider : null,
      section: section ?? null,
      group: group ?? null,
      freeOnly: searchParams.get('free') === '1',
      sort: readEnum<SortKey>(searchParams.get('sort'), SORTS, DEFAULT_FILTERS.sort),
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (next: ExploreFilters) => {
      const params = new URLSearchParams();
      if (next.query.trim()) params.set('q', next.query);
      if (next.kind !== 'all') params.set('kind', next.kind);
      if (next.provider) params.set('provider', next.provider);
      if (next.section) params.set('section', next.section);
      if (next.group) params.set('group', next.group);
      if (next.freeOnly) params.set('free', '1');
      if (next.sort !== DEFAULT_FILTERS.sort) params.set('sort', next.sort);
      // replace: true keeps the back button meaningful for navigation.
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const patchFilters = useCallback(
    (patch: Partial<ExploreFilters>) => setFilters({ ...filters, ...patch }),
    [filters, setFilters],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [setFilters]);

  return { filters, setFilters, patchFilters, resetFilters };
}