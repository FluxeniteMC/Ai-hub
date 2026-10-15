import { GitCompare, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useDocumentMeta } from '../hooks/useDocumentMeta';

import { ComparisonTable } from '../components/catalog/ComparisonTable';
import { Callout } from '../components/ui/Callout';
import { EmptyState } from '../components/ui/EmptyState';
import { useCompareSelection } from '../hooks/useCompareSelection';
import { getEntriesByIds } from '../lib/catalog';
import { KIND_LABELS } from '../lib/format';

export function ComparePage() {
  useDocumentMeta(
    'Compare AI Models',
    'Compare up to four AI models side by side: provider, context window, published pricing and shared attributes.',
  );
  const { selectedIds, remove, clear } = useCompareSelection();
  const selected = getEntriesByIds(selectedIds);

  return (
    <div className="container container--wide">
      <header className="page-header">
        <div>
          <h1 className="page-header__title">Compare listings</h1>
          <p className="page-header__subtitle">
            Side-by-side view of up to four listings. Only fields stated in the repository README
            are shown; anything unknown reads as “Not stated”.
          </p>
        </div>
      </header>

      {selected.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<GitCompare size={22} />}
            title="Nothing selected yet"
            description="Pick two or more listings in the explorer and they will appear here, ready to compare."
            actions={
              <Link className="button button--primary" to="/explore">
                Browse the catalog
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <ul className="compare-picker">
            {selected.map((entry) => (
              <li key={entry.id} className="panel compare-picker__item">
                <div className="compare-picker__info">
                  <Link className="compare-picker__name" to={`/listing/${entry.id}`}>
                    {entry.name}
                  </Link>
                  <span className="compare-picker__meta">
                    {KIND_LABELS[entry.kind]} · {entry.provider ?? 'Provider not stated'}
                  </span>
                </div>
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => remove(entry.id)}
                  aria-label={`Remove ${entry.name} from comparison`}
                >
                  <X size={14} aria-hidden="true" />
                  Remove
                </button>
              </li>
            ))}
          </ul>

          {selected.length === 1 ? (
            <Callout icon={<Info size={15} />} className="compare-notice">
              Add at least one more listing to see a meaningful comparison.
            </Callout>
          ) : (
            <>
              <div className="compare-toolbar">
                <p className="compare-toolbar__count">
                  Comparing <strong>{selected.length}</strong> listings
                </p>
                <div className="compare-toolbar__actions">
                  <Link className="button button--sm" to="/explore">
                    Add more
                  </Link>
                  <button type="button" className="button button--ghost button--sm" onClick={clear}>
                    Clear all
                  </button>
                </div>
              </div>

              <ComparisonTable entries={selected} />
            </>
          )}
        </>
      )}
    </div>
  );
}