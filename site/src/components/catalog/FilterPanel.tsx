import { RotateCcw } from 'lucide-react';

import { Select } from '../ui/Select';
import { KIND_LABELS } from '../../lib/format';
import type { EntryKind, ExploreFilters, Facets } from '../../types/catalog';

interface FilterPanelProps {
  filters: ExploreFilters;
  facets: Facets;
  onPatch: (patch: Partial<ExploreFilters>) => void;
  onReset: () => void;
  activeCount: number;
}

const KINDS: readonly EntryKind[] = ['model', 'api', 'tool', 'database', 'runner'];

/**
 * Faceted filtering over providers, kinds and categories.
 * Counts come from the full catalog so they never change while filtering.
 */
export function FilterPanel({
  filters,
  facets,
  onPatch,
  onReset,
  activeCount,
}: FilterPanelProps) {
  return (
    <div className="filters">
      <div className="filters__header">
        <h2 className="filters__title">Filters</h2>
        {activeCount > 0 ? (
          <button type="button" className="button button--ghost button--sm" onClick={onReset}>
            <RotateCcw size={13} aria-hidden="true" />
            Reset ({activeCount})
          </button>
        ) : null}
      </div>

      <fieldset className="filters__group">
        <legend className="field__label">Type</legend>
        <div className="filters__chips">
          <button
            type="button"
            className={`chip ${filters.kind === 'all' ? 'chip--on' : ''}`}
            onClick={() => onPatch({ kind: 'all' })}
            aria-pressed={filters.kind === 'all'}
          >
            All
            <span className="chip__count">{facets.kinds.reduce((sum, k) => sum + k.count, 0)}</span>
          </button>
          {KINDS.map((kind) => {
            const count = facets.kinds.find((item) => item.value === kind)?.count ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={kind}
                type="button"
                className={`chip ${filters.kind === kind ? 'chip--on' : ''}`}
                onClick={() => onPatch({ kind })}
                aria-pressed={filters.kind === kind}
              >
                {KIND_LABELS[kind]}
                <span className="chip__count">{count}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Select
        id="filter-provider"
        label="Provider"
        value={filters.provider ?? ''}
        onChange={(value) => onPatch({ provider: value || null })}
        options={[
          { value: '', label: 'All providers' },
          ...facets.providers.map((provider) => ({
            value: provider.value,
            label: provider.value,
            hint: provider.count,
          })),
        ]}
      />

      <Select
        id="filter-section"
        label="Section"
        value={filters.section ?? ''}
        onChange={(value) => onPatch({ section: value || null, group: null })}
        options={[
          { value: '', label: 'All sections' },
          ...facets.sections.map((section) => ({
            value: section.value,
            label: section.value,
            hint: section.count,
          })),
        ]}
      />

      <Select
        id="filter-group"
        label="Grouping"
        value={filters.group ?? ''}
        onChange={(value) => onPatch({ group: value || null })}
        options={[
          { value: '', label: 'All groupings' },
          ...facets.groups.map((group) => ({
            value: group.value,
            label: group.value,
            hint: group.count,
          })),
        ]}
      />

      <div className="filters__group">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.freeOnly}
            onChange={(event) => onPatch({ freeOnly: event.target.checked })}
          />
          Only listings with a free tier
          <span className="chip__count">{facets.freeCount}</span>
        </label>
      </div>
    </div>
  );
}