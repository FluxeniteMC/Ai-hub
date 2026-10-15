import { GitCompare, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { CatalogEntry } from '../../types/catalog';

interface CompareTrayProps {
  entries: CatalogEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
  limit: number;
}

/** Sticky tray listing the current comparison picks. */
export function CompareTray({ entries, onRemove, onClear, limit }: CompareTrayProps) {
  if (entries.length === 0) return null;

  return (
    <div className="compare-tray" role="region" aria-label="Comparison selection">
      <div className="container compare-tray__inner">
        <div className="compare-tray__info">
          <GitCompare size={16} aria-hidden="true" />
          <span>
            <strong>{entries.length}</strong> of {limit} selected
          </span>
        </div>

        <ul className="compare-tray__list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <span className="compare-tray__chip">
                {entry.name}
                <button
                  type="button"
                  onClick={() => onRemove(entry.id)}
                  aria-label={`Remove ${entry.name} from comparison`}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>

        <div className="compare-tray__actions">
          <button type="button" className="button button--ghost button--sm" onClick={onClear}>
            Clear
          </button>
          <Link
            className="button button--primary button--sm"
            to="/compare"
            aria-disabled={entries.length < 2}
            onClick={(event) => {
              if (entries.length < 2) event.preventDefault();
            }}
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}