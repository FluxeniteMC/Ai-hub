import { SearchX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { CompareTray } from '../components/catalog/CompareTray';
import { EntryCard } from '../components/catalog/EntryCard';
import { FilterPanel } from '../components/catalog/FilterPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { useCompareSelection } from '../hooks/useCompareSelection';

import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useUrlFilters } from '../hooks/useUrlFilters';
import {
  activeFilterCount,
  applyFilters,
  entries,
  facets,
  getEntriesByIds,
  SORT_OPTIONS,
} from '../lib/catalog';
import { formatCount } from '../lib/format';
import type { SortKey } from '../types/catalog';

const PAGE_SIZE = 24;

export function ExplorePage() {
  useDocumentMeta(
    'Explore AI APIs & Models',
    'Search and filter every AI API, model and tool catalogued in the community directory. Filter by provider, category and pricing.',
  );
  const { filters, patchFilters, resetFilters } = useUrlFilters();
  const [rawQuery, setRawQuery] = useState(filters.query);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { selectedIds, toggle, remove, clear, isSelected, isFull } = useCompareSelection();

  // The URL is the single source of truth, so shared links and back/forward
  // navigation always restore the exact view. The input writes to it directly
  // (with `replace`, so history stays clean) — no debounce echo, which would
  // otherwise race and resurrect a stale query on reset.
  useEffect(() => {
    setRawQuery((current) => (current === filters.query ? current : filters.query));
  }, [filters.query]);

  // Show the first page again whenever the result set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const results = useMemo(() => applyFilters(entries, filters), [filters]);

  const visible = results.slice(0, visibleCount);
  const selectedEntries = useMemo(() => getEntriesByIds(selectedIds), [selectedIds]);
  const activeCount = activeFilterCount(filters);
  const sortOption = SORT_OPTIONS.find((option) => option.value === filters.sort);

  const onQueryChange = (value: string) => {
    setRawQuery(value);
    patchFilters({ query: value });
  };

  const resetAll = () => {
    setRawQuery('');
    resetFilters();
  };

  return (
    <>
      <div className="container">
        <header className="page-header">
          <div>
            <h1 className="page-header__title">Explore the catalog</h1>
            <p className="page-header__subtitle">
              Search and filter every listing parsed from the repository README. Results update
              instantly in your browser.
            </p>
          </div>
        </header>

        <div className="explore">
          <aside className="explore__sidebar">
            <div className="panel panel--padded">
              <FilterPanel
                filters={filters}
                facets={facets}
                onPatch={patchFilters}
                onReset={resetAll}
                activeCount={activeCount}
              />
            </div>
          </aside>

          <div className="explore__main">
            <div className="explore__toolbar">
              <SearchInput
                value={rawQuery}
                onChange={onQueryChange}
                label="Search listings by name, provider, category or attribute"
                placeholder="Search models, providers, categories…"
              />

              <Select
                id="sort-select"
                label="Sort"
                hideLabel
                className="explore__sort"
                value={filters.sort}
                onChange={(value) => patchFilters({ sort: value as SortKey })}
                options={SORT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.partial ? `${option.label} (where stated)` : option.label,
                }))}
              />
            </div>

            <div className="explore__status" aria-live="polite">
              <span>
                <strong>{formatCount(results.length)}</strong>{' '}
                {results.length === 1 ? 'listing' : 'listings'}
                {filters.query ? ` matching “${filters.query}”` : ''}
              </span>
              {sortOption?.partial ? (
                <span className="explore__status-note">
                  Listings without this field sort last — unstated is never treated as zero.
                </span>
              ) : null}
            </div>

            {results.length === 0 ? (
              <div className="panel">
                <EmptyState
                  icon={<SearchX size={22} />}
                  title="No listings match these filters"
                  description={
                    filters.query
                      ? `Nothing in the catalog matches “${filters.query}” with the filters currently applied. Try a broader term or clear a filter.`
                      : 'The current filter combination has no matching listings. Clear one or more filters to widen the results.'
                  }
                  actions={
                    <button type="button" className="button button--primary" onClick={resetAll}>
                      Clear all filters
                    </button>
                  }
                />
              </div>
            ) : (
              <>
                <div className="entry-grid">
                  {visible.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      selected={isSelected(entry.id)}
                      selectionDisabled={isFull}
                      onToggleSelect={toggle}
                    />
                  ))}
                </div>

                {visibleCount < results.length ? (
                  <div className="explore__more">
                    <button
                      type="button"
                      className="button"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    >
                      Load {Math.min(PAGE_SIZE, results.length - visibleCount)} more
                    </button>
                    <span className="explore__more-count">
                      Showing {visible.length} of {formatCount(results.length)}
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <CompareTray entries={selectedEntries} onRemove={remove} onClear={clear} limit={4} />
    </>
  );
}